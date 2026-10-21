// Previews of this instance's links in other apps (Discord, Slack, iMessage,
// Telegram, Mastodon…). Their link fetchers are signed out, so a signed-out
// request for a post or a profile gets a rich page with its OpenGraph and
// Twitter card tags (with native inline video player, multi-image gallery grid,
// quote tweet text, poll results, and engagement stats) and an oEmbed link;
// people who open it are redirected to the post. Only what a public X account
// shows anyone is used: active, unprotected accounts and their visible posts,
// with no picture from a post marked sensitive. Admin > Settings > Features
// turns previews off.

import { PUBLIC_ORIGIN } from "./config";
import { sql } from "./db";
import { remoteMediaFile } from "./federation-sync";
import { GUEST_VIEWER } from "./auth";
import { serveMedia } from "./media";
import { isId } from "./ids";
import { feature, settings } from "./settings";

const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const clip = (s: string, n: number) => ([...s].length > n ? `${[...s].slice(0, n - 1).join("")}…` : s);

function formatCount(n: number): string {
	if (!n || n < 0) return "0";
	if (n < 1000) return String(n);
	if (n < 1_000_000) {
		const v = n / 1000;
		return `${v >= 10 || n % 1000 === 0 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
	}
	const v = n / 1_000_000;
	return `${v >= 10 || n % 1_000_000 === 0 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
}

export type Author = {
	id: string;
	screen_name: string;
	name: string;
	bio: string;
	avatar_url: string | null;
	followers?: number;
	following?: number;
	posts?: number;
};

// an account anyone may see: not protected, suspended, limited or deactivated
export async function publicAuthor(where: ReturnType<typeof sql>): Promise<Author | undefined> {
	const [u] = await sql`select u.id::text, u.screen_name, u.name, u.bio, u.avatar_url,
		coalesce((u.count_overrides->>'followers')::int, s.followers, 0) as followers,
		coalesce((u.count_overrides->>'following')::int, s.following, 0) as following,
		coalesce((u.count_overrides->>'posts')::int, s.posts, 0) as posts
		from users u
		left join user_stats s on s.user_id = u.id
		where ${where} and not u.protected and not u.instance_blocked and u.status in ('active', 'restricted') and u.deactivated_at is null`;
	return u as Author | undefined;
}

export type MediaItem = {
	id: string;
	kind: string;
	mime: string;
	width: number;
	height: number;
	remote: boolean;
};

export type QuotedPost = {
	id: string;
	text: string;
	author: { screen_name: string; name: string };
};

export type PollInfo = {
	choices: string[];
	counts: number[];
	totalVotes: number;
	closed: boolean;
};

export type Post = {
	id: string;
	text: string;
	created_at: Date;
	author: Author;
	media: MediaItem[];
	like_count: number;
	repost_count: number;
	reply_count: number;
	quoted?: QuotedPost;
	poll?: PollInfo;
};

const SUSPENDED_USERS = sql`(select id from users where status = 'suspended' or instance_blocked)`;

export async function publicPost(id: string): Promise<Post | undefined> {
	if (!isId(id)) return undefined;
	const [p] = await sql`select p.id::text, p.user_id::text, p.text, p.created_at, p.quote_id::text, p.poll_id::text,
		p.sensitive and not u.never_sensitive as sensitive, u.never_sensitive,
		coalesce((p.count_overrides->>'likes')::int, greatest((p.remote_counts->>'likes')::int, (select count(*)::int from likes x where x.post_id = p.id and x.user_id not in ${SUSPENDED_USERS}))) as like_count,
		coalesce((p.count_overrides->>'reposts')::int, greatest((p.remote_counts->>'reposts')::int, (select count(*)::int from reposts x where x.post_id = p.id and x.user_id not in ${SUSPENDED_USERS}))) as repost_count,
		coalesce((p.count_overrides->>'replies')::int, greatest((p.remote_counts->>'replies')::int, (select count(*)::int from posts x where x.reply_to_id = p.id and x.user_id not in ${SUSPENDED_USERS}))) as reply_count
		from posts p join users u on u.id = p.user_id where p.id = ${id}::bigint and not p.hidden`;
	if (!p) return undefined;
	const author = await publicAuthor(sql`u.id = ${p.user_id}::bigint`);
	if (!author) return undefined;
	const media = (p.sensitive
		? []
		: await sql`select id::text, kind, mime, width, height, remote_instance is not null as remote from media
			where post_id = ${id}::bigint and state = 'ready' and (coalesce(cardinality(sensitive_warning), 0) = 0 or ${p.never_sensitive}) order by position nulls last limit 4`) as MediaItem[];

	let quoted: QuotedPost | undefined;
	if (p.quote_id && isId(p.quote_id)) {
		const [qp] = await sql`select p.id::text, p.user_id::text, p.text, u.screen_name, u.name
			from posts p
			join users u on u.id = p.user_id
			where p.id = ${p.quote_id}::bigint and not p.hidden and not u.protected and not u.instance_blocked and u.status in ('active', 'restricted') and u.deactivated_at is null`;
		if (qp) {
			quoted = {
				id: qp.id,
				text: qp.text,
				author: { screen_name: qp.screen_name, name: qp.name },
			};
		}
	}

	let poll: PollInfo | undefined;
	if (p.poll_id && isId(p.poll_id)) {
		const [pr] = await sql`select p.id::text, p.choices, p.ends_at,
			coalesce((select array_agg(c.n order by c.choice) from (
				select g.choice, count(v.user_id)::int as n from generate_series(1, array_length(p.choices, 1)) as g(choice)
				left join poll_votes v on v.poll_id = p.id and v.choice = g.choice group by g.choice) c), '{}') as counts
			from polls p where p.id = ${p.poll_id}::bigint`;
		if (pr) {
			const counts: number[] = pr.counts ?? [];
			const total = counts.reduce((a, b) => a + b, 0);
			const closed = pr.ends_at ? new Date(pr.ends_at).getTime() <= Date.now() : false;
			poll = {
				choices: pr.choices ?? [],
				counts,
				totalVotes: total,
				closed,
			};
		}
	}

	return {
		id: p.id,
		text: p.text,
		created_at: p.created_at,
		author,
		media,
		like_count: Math.max(0, Number(p.like_count ?? 0)),
		repost_count: Math.max(0, Number(p.repost_count ?? 0)),
		reply_count: Math.max(0, Number(p.reply_count ?? 0)),
		quoted,
		poll,
	};
}

const avatarId = (a: Author) => /^\/media\/(\d{1,19})$/.exec(a.avatar_url ?? "")?.[1];

function page(o: {
	path: string;
	title: string;
	description: string;
	media?: MediaItem[];
	avatarUrl?: string;
	large: boolean;
	author?: Author;
	time?: Date;
}): Response {
	const name = settings().instance_name;
	const url = PUBLIC_ORIGIN + o.path;

	const tags: [string, string, string][] = [
		["property", "og:site_name", name],
		["property", "og:url", url],
		["property", "og:title", o.title],
		["property", "og:description", o.description],
		["name", "twitter:title", o.title],
		["name", "twitter:description", o.description],
		["name", "description", o.description],
		["name", "theme-color", "#1d9bf0"],
	];

	if (o.time) {
		tags.push(["property", "article:published_time", o.time.toISOString()]);
	}

	const video = o.media?.find((m) => m.kind === "video" || m.mime === "video/mp4");
	const photos = o.media?.filter((m) => m.kind === "photo" || m.mime.startsWith("image/")) ?? [];

	if (video) {
		const videoUrl = `${PUBLIC_ORIGIN}/embed/video/${video.id}.mp4`;
		const posterUrl = `${PUBLIC_ORIGIN}/embed/poster/${video.id}.jpg`;
		const width = String(video.width || 1280);
		const height = String(video.height || 720);

		tags.push(
			["property", "og:type", "video.other"],
			["property", "og:video", videoUrl],
			["property", "og:video:url", videoUrl],
			["property", "og:video:secure_url", videoUrl],
			["property", "og:video:type", "video/mp4"],
			["property", "og:video:width", width],
			["property", "og:video:height", height],
			["property", "og:image", posterUrl],
			["property", "og:image:width", width],
			["property", "og:image:height", height],
			["name", "twitter:card", "player"],
			["name", "twitter:player", videoUrl],
			["name", "twitter:player:width", width],
			["name", "twitter:player:height", height],
			["name", "twitter:player:stream", videoUrl],
			["name", "twitter:player:stream:content_type", "video/mp4"],
			["name", "twitter:image", posterUrl],
		);
	} else if (photos.length > 0) {
		tags.push(["property", "og:type", "article"]);
		tags.push(["name", "twitter:card", "summary_large_image"]);
		tags.push(["name", "twitter:image", `${PUBLIC_ORIGIN}/embed/media/${photos[0].id}`]);

		// Discord native image gallery: up to 4 og:image tags
		for (const photo of photos) {
			tags.push(["property", "og:image", `${PUBLIC_ORIGIN}/embed/media/${photo.id}`]);
			if (photo.width && photo.height) {
				tags.push(["property", "og:image:width", String(photo.width)]);
				tags.push(["property", "og:image:height", String(photo.height)]);
			}
		}
	} else {
		tags.push(["property", "og:type", o.time ? "article" : "profile"]);
		tags.push(["name", "twitter:card", o.large ? "summary_large_image" : "summary"]);
		const fallbackImg = o.avatarUrl ?? `${PUBLIC_ORIGIN}/public/icon-dark.png`;
		tags.push(["property", "og:image", fallbackImg]);
		tags.push(["name", "twitter:image", fallbackImg]);
	}

	const oembed = `${PUBLIC_ORIGIN}/oembed?url=${encodeURIComponent(url)}`;
	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(o.title)}</title>
${tags.map(([attr, key, value]) => `<meta ${attr}="${key}" content="${esc(value)}">`).join("\n")}
<link rel="canonical" href="${esc(url)}">
<link rel="alternate" type="application/json+oembed" href="${esc(oembed)}" title="${esc(o.title)}">
<meta http-equiv="refresh" content="0;url=${esc(url)}">
</head><body style="background:#000;color:#e7e9ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;box-sizing:border-box">
<div style="text-align:center;max-width:500px">
<p><a href="${esc(url)}" style="color:#1d9bf0;text-decoration:none;font-weight:bold;font-size:18px">Redirecting to ${esc(o.title)}...</a></p>
<p style="color:#71767b;font-size:14px">If you are not redirected automatically, click the link above.</p>
</div>
<script>location.replace(${JSON.stringify(url)});</script>
</body></html>`;
	return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export const postTitle = (a: { name: string; screen_name: string }) => `${a.name} (@${a.screen_name})`;

export function postPreview(p: Post): Response {
	const avatar = avatarId(p.author);
	const avatarUrl = avatar ? `${PUBLIC_ORIGIN}/embed/avatar/${p.author.id}` : undefined;

	let description = clip(p.text, 1000) || "Post";

	if (p.quoted) {
		description += `\n\n🗨️ Quoting ${p.quoted.author.name} (@${p.quoted.author.screen_name}):\n"${clip(p.quoted.text, 300)}"`;
	}

	if (p.poll) {
		const pollHeader = p.poll.closed ? "📊 Poll (Final results):" : "📊 Poll:";
		const options = p.poll.choices.map((c, i) => {
			const votes = p.poll!.counts[i] ?? 0;
			const pct = p.poll!.totalVotes > 0 ? Math.round((votes / p.poll!.totalVotes) * 100) : 0;
			return `🔘 ${c} (${pct}%)`;
		});
		description += `\n\n${pollHeader}\n${options.join("\n")}\n${formatCount(p.poll.totalVotes)} votes`;
	}

	const statsRow = `💬 ${formatCount(p.reply_count)}   🔁 ${formatCount(p.repost_count)}   ❤️ ${formatCount(p.like_count)}`;
	description += `\n\n${statsRow}`;

	return page({
		path: `/${p.author.screen_name}/status/${p.id}`,
		title: `${postTitle(p.author)} on ${settings().instance_name}`,
		description,
		media: p.media,
		avatarUrl,
		large: p.media.length > 0,
		author: p.author,
		time: p.created_at,
	});
}

export function profilePreview(a: Author): Response {
	const bio = a.bio?.trim();
	const stats = `👥 ${formatCount(a.followers ?? 0)} Followers   •   Following ${formatCount(a.following ?? 0)}   •   📝 ${formatCount(a.posts ?? 0)} Posts`;
	const description = bio ? `${clip(bio, 400)}\n\n${stats}` : stats;

	return page({
		path: `/${a.screen_name}`,
		title: `${postTitle(a)} on ${settings().instance_name}`,
		description,
		avatarUrl: avatarId(a) ? `${PUBLIC_ORIGIN}/embed/avatar/${a.id}` : undefined,
		large: false,
		author: a,
	});
}

export const handleIn = (pathname: string) => {
	const raw = /^\/([^/]{1,320})\/?$/.exec(pathname)?.[1];
	try {
		const name = raw && decodeURIComponent(raw);
		return name && /^[^\s\p{C}/\\?#@%,:]{1,50}(?:@[a-z0-9.:-]{1,260})?$/iu.test(name) ? name : undefined;
	} catch {
		return undefined;
	}
};

// a signed-out page request: the preview page, or undefined to carry on as before
export async function linkPreview(pathname: string): Promise<Response | undefined> {
	if (!feature("link_previews")) return undefined;

	// Strip optional fx or vx prefix
	const clean = pathname.replace(/^\/(?:fx|vx)/i, "");

	// Match status: /user/status/:id, /status/:id, /i/status/:id, with optional photo/video suffix or .mp4
	const status = /^(?:\/([^/]{1,320}))?\/status\/(\d{1,19})(?:\/(?:photo|video)\/\d)?(?:\.mp4)?\/?$/i.exec(clean);
	if (status && isId(status[2])) {
		const post = await publicPost(status[2]);
		if (!post) return undefined;

		// Direct .mp4 request -> redirect to direct video if post has one
		if (clean.toLowerCase().endsWith(".mp4")) {
			const video = post.media.find((m) => m.kind === "video" || m.mime === "video/mp4");
			if (video) return Response.redirect(`${PUBLIC_ORIGIN}/embed/video/${video.id}.mp4`, 302);
		}

		return postPreview(post);
	}

	const profile = handleIn(clean);
	if (profile) {
		const author = await publicAuthor(sql`lower(u.screen_name) = lower(${profile})`);
		return author ? profilePreview(author) : undefined;
	}
	return undefined;
}

async function fileResponse(body: Blob | undefined, type: string): Promise<Response> {
	if (!body) return new Response("not found", { status: 404, headers: { "cache-control": "no-store" } });
	const stream = "bucket" in body && typeof (body as any).stream === "function" ? (body as any).stream() : body;
	return new Response(stream, { headers: { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

// Media streaming and image serving for previews
export async function embedMedia(req: Request, pathname: string): Promise<Response> {
	const none = new Response("not found", { status: 404, headers: { "cache-control": "no-store" } });
	if (!feature("link_previews")) return none;

	// Legacy endpoint: /embed/post/:id (first photo or video poster)
	const post = /^\/embed\/post\/(\d{1,19})$/.exec(pathname);
	if (post && isId(post[1])) {
		const p = await publicPost(post[1]);
		const first = p?.media[0];
		if (!first) return none;
		return first.kind === "photo"
			? fileResponse(await remoteMediaFile(first.id), first.mime)
			: fileResponse(await remoteMediaFile(first.id, true), "image/jpeg");
	}

	// Specific media image: /embed/media/:id
	const media = /^\/embed\/media\/(\d{1,19})(?:\.[a-z0-9]+)?$/.exec(pathname);
	if (media && isId(media[1])) {
		const [row] = await sql`select m.id::text, m.kind, m.mime, p.sensitive and not u.never_sensitive as sensitive, u.never_sensitive, coalesce(cardinality(m.sensitive_warning), 0) as warnings
			from media m
			join posts p on p.id = m.post_id
			join users u on u.id = p.user_id
			where m.id = ${media[1]}::bigint and not p.hidden and not u.protected and not u.instance_blocked and u.status in ('active', 'restricted') and u.deactivated_at is null`;
		if (!row || (row.sensitive && !row.never_sensitive) || (row.warnings > 0 && !row.never_sensitive)) return none;
		if (row.kind === "video") {
			return serveMedia(req, `/media/${media[1]}.mp4`, GUEST_VIEWER);
		}
		return fileResponse(await remoteMediaFile(media[1]), row.mime);
	}

	// Video streaming with byte-range requests: /embed/video/:id(.mp4)?
	const video = /^\/embed\/video\/(\d{1,19})(?:\.mp4)?$/.exec(pathname);
	if (video && isId(video[1])) {
		const [row] = await sql`select m.id::text, m.mime, p.sensitive and not u.never_sensitive as sensitive, u.never_sensitive, coalesce(cardinality(m.sensitive_warning), 0) as warnings
			from media m
			join posts p on p.id = m.post_id
			join users u on u.id = p.user_id
			where m.id = ${video[1]}::bigint and not p.hidden and not u.protected and not u.instance_blocked and u.status in ('active', 'restricted') and u.deactivated_at is null`;
		if (!row || (row.sensitive && !row.never_sensitive) || (row.warnings > 0 && !row.never_sensitive)) return none;
		return serveMedia(req, `/media/${video[1]}.mp4`, GUEST_VIEWER);
	}

	// Poster frame thumbnail: /embed/poster/:id(.jpg)?
	const poster = /^\/embed\/poster\/(\d{1,19})(?:\.jpg)?$/.exec(pathname);
	if (poster && isId(poster[1])) {
		const [row] = await sql`select m.id::text, p.sensitive and not u.never_sensitive as sensitive, u.never_sensitive, coalesce(cardinality(m.sensitive_warning), 0) as warnings
			from media m
			join posts p on p.id = m.post_id
			join users u on u.id = p.user_id
			where m.id = ${poster[1]}::bigint and not p.hidden and not u.protected and not u.instance_blocked and u.status in ('active', 'restricted') and u.deactivated_at is null`;
		if (!row || (row.sensitive && !row.never_sensitive) || (row.warnings > 0 && !row.never_sensitive)) return none;
		return fileResponse(await remoteMediaFile(poster[1], true), "image/jpeg");
	}

	// Avatar thumbnail: /embed/avatar/:id
	const avatar = /^\/embed\/avatar\/(\d{1,19})$/.exec(pathname);
	if (avatar && isId(avatar[1])) {
		const a = await publicAuthor(sql`u.id = ${avatar[1]}::bigint`);
		const id = a && avatarId(a);
		if (!id || !isId(id)) return none;
		const [m] = await sql`select mime from media where id = ${id}::bigint`;
		return m ? fileResponse(await remoteMediaFile(id), m.mime) : none;
	}

	return none;
}

// Backward-compatibility alias
export const embedImage = (pathname: string) => embedMedia(new Request(`http://localhost${pathname}`), pathname);

// oEmbed (oembed.com): apps such as Discord show the author and provider from it
export async function oembed(url: URL): Promise<Response> {
	const none = new Response("not found", { status: 404, headers: { "cache-control": "no-store" } });
	if (!feature("link_previews")) return none;
	let target: URL;
	try {
		target = new URL(url.searchParams.get("url") ?? "");
	} catch {
		return none;
	}
	if (target.origin !== PUBLIC_ORIGIN) return none;
	const clean = target.pathname.replace(/^\/(?:fx|vx)/i, "");
	const status = /^(?:\/[^/]{1,320})?\/status\/(\d{1,19})/i.exec(clean);
	const author = status
		? (await publicPost(status[1]))?.author
		: await publicAuthor(sql`lower(u.screen_name) = lower(${handleIn(clean) ?? ""})`);
	if (!author) return none;
	return Response.json(
		{
			version: "1.0",
			type: "link",
			title: postTitle(author),
			author_name: postTitle(author),
			author_url: `${PUBLIC_ORIGIN}/${author.screen_name}`,
			provider_name: settings().instance_name,
			provider_url: PUBLIC_ORIGIN,
		},
		{ headers: { "cache-control": "no-store", "access-control-allow-origin": "*" } },
	);
}
