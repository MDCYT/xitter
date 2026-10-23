// The public API under /api/v1: plain JSON for bots and scripts, signed in
// with a personal token from /account/api ("Authorization: Bearer xit_...").
// Writes go through the same operations the client calls (graphql.ts), so
// every rule the app enforces holds here too; reads use the same visibility
// (blocks, protected accounts, suspensions). The rate limits are the
// client's. /api is the documentation.

import { BodyTooLarge, boundedBody } from "./api-input";
import { accountPage, esc } from "./account-page";
import { type User, type Viewer, GUEST_VIEWER } from "./auth";
import { PUBLIC_ORIGIN } from "./config";
import { sql } from "./db";
import { callOperation } from "./graphql";
import { isId, newId } from "./ids";
import { activeCards } from "./explore-cards";
import { postLimitFor } from "./textlen";
import { absolute, mediaUpload, mediaUrl, posterUrl } from "./media";
import { type PostRow, badgeList, isOrganization, isVerified, verifiedSince } from "./model";
import { PostError, feed, forYouFeed, getPost, likedPosts, postsByIds, replies, type FeedItem } from "./posts";
import { listNotifications } from "./notifications";
import { type Bucket, limitHeaders, limitedResponse, noteRefusal, take } from "./ratelimit";
import { cachedTrends, searchPosts, searchUsers } from "./search";
import { settings } from "./settings";
import { badgeUrl, followList, setFollow, suggestedUsers, toUser, userByName, userCols, usersByIds } from "./users";
import { translateText } from "./translate";
import { votePoll } from "./polls";
import { decorationUrl, parseDecoration } from "./decorations";
import { DISCORD_DECORATIONS } from "./decoration-presets";

const hash = (token: string) => new Bun.CryptoHasher("sha256").update(token).digest("hex");
const MAX_TOKENS = 10;

class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

// ---- tokens

export async function createToken(userId: string, name: string, scope: "read" | "write", issuingSession?: string) {
	const token = `xit_${Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("hex")}`;
	await sql.begin(async (tx) => {
		// Password recovery and token creation take the same account lock. A
		// request authenticated before recovery must not mint a credential after it.
		const [account] = await tx`select id from users where id = ${userId}::bigint
			and status <> 'suspended' and deactivated_at is null and instance is null for update`;
		if (!account) throw new ApiError(401, "Sign in again to make an API token.");
		if (issuingSession !== undefined) {
			const [session] = await tx`select token from sessions where token = ${issuingSession} and user_id = ${userId}::bigint
				and (expires_at is null or expires_at > clock_timestamp())`;
			if (!session) throw new ApiError(401, "Sign in again to make an API token.");
		}
		const [{ n }] = await tx`select count(*)::int as n from api_tokens where user_id = ${userId}::bigint and client_id is null`;
		if (n >= MAX_TOKENS) throw new ApiError(400, `You can have up to ${MAX_TOKENS} tokens. Delete one first.`);
		await tx`insert into api_tokens (id, user_id, name, token_hash, scope) values (${newId()}::bigint, ${userId}::bigint, ${name}, ${hash(token)}, ${scope})`;
	});
	return token;
}

async function tokenViewer(req: Request): Promise<{ viewer: Viewer; scope: string } | undefined> {
	const token = /^Bearer\s+(xit_[0-9a-f]{48})$/i.exec(req.headers.get("authorization") ?? "")?.[1];
	if (!token) return undefined;
	const [row] = await sql`
		select u.id::text, u.screen_name, u.name, u.bio, u.location, u.website, u.avatar_url, u.banner_url, u.verified_type, u.flag, u.status, u.role, u.protected, u.language, u.created_at,
			t.scope, t.id::text as token_id, t.last_used_at, c.name as app_name
		from api_tokens t join users u on u.id = t.user_id left join oauth_clients c on c.id = t.client_id
		where t.token_hash = ${hash(token)} and u.status <> 'suspended' and u.deactivated_at is null
			and (t.expires_at is null or t.expires_at > now()) and (t.client_id is null or c.revoked = false)`;
	if (!row) return undefined;
	if (!row.last_used_at || Date.now() - row.last_used_at.getTime() > 60_000) await sql`update api_tokens set last_used_at = now() where id = ${row.token_id}::bigint`;
	const { scope, token_id: _id, last_used_at: _used, app_name, ...user } = row;
	// staff tokens are limited like anyone's: the exemption is for the panel
	return { viewer: { ...user, role: null, csrf: "", token: "", postSource: app_name ? `App: ${app_name}` : "Xitter API" } as Viewer, scope };
}

// ---- shapes

const iso = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString() : null);

function userJson(u: User) {
	const shown = badgeList(u);
	return {
		id: u.id,
		screen_name: u.screen_name,
		name: u.name,
		bio: u.bio ?? "",
		location: u.location ?? "",
		website: u.website || null,
		avatar_url: absolute(u.avatar_url) || `${PUBLIC_ORIGIN}/public/default-avatar.png`,
		banner_url: absolute(u.banner_url),
		verified_type: u.verified_type,
		verified_at: iso(u.verified_at),
		country: u.country ?? null,
		region: u.region ?? u.country ?? null,
		pronouns: u.pronouns ?? null,
		verified: isVerified(u),
		verified_since: iso(isVerified(u) ? verifiedSince(u) : null),
		parody_label: u.parody_label && u.parody_label !== "None" ? u.parody_label : null,
		automated_by: u.automated_by ?? null,
		organization: isOrganization(u),
		...(isOrganization(u) ? { affiliates_count: u.affiliates ?? 0 } : {}),
		affiliations: shown.flatMap((b) => (b.org ? [{ screen_name: b.org, name: b.description, badge_url: b.url }] : [])),
		protected: !!u.protected,
		created_at: iso(u.created_at),
		url: `${PUBLIC_ORIGIN}/${u.screen_name}`,
		translator: u.translator ?? null,
		flag: u.flag ?? null,
		decoration: u.decoration ? decorationUrl(parseDecoration(u.decoration), true) : null,
		decoration_raw: u.decoration ? parseDecoration(u.decoration) : null,
		followers_you_follow: (u.followers_you_follow ?? []).map((fu: any) => ({
			screen_name: fu.screen_name,
			name: fu.name,
			avatar_url: absolute(fu.avatar_url) || `${PUBLIC_ORIGIN}/public/default-avatar.png`
		})),
		followers_you_follow_count: u.followers_you_follow_count ?? 0,
		badges: (u.badges ?? []).map((b) => ({ id: b.id, name: b.name, url: `/public/badge-${b.id}.png` })),
		remote_badges: u.remote_badges ?? [],
		org: u.org ? {
			id: u.org.id,
			name: u.org.name,
			screen_name: u.org.screen_name,
			avatar_url: absolute(u.org.avatar_url),
			since: iso(u.org.since),
		} : null,
		label: u.label ? {
			text: u.label.text,
			badge_url: u.label.badge_id ? `/public/badge-${u.label.badge_id}.png` : null,
			url: u.label.url || null,
		} : null,
		parody_label: u.parody_label && u.parody_label !== "None" ? u.parody_label : null,
		instance: u.instance || null,
		max_chars: postLimitFor(u.verified_type),
		...(u.stats
			? {
					counts: {
						posts: u.stats.rootPosts ?? u.stats.posts,
						posts_with_replies: u.stats.posts,
						root_posts: u.stats.rootPosts ?? u.stats.posts,
						followers: u.stats.followers,
						following: u.stats.following,
						likes: u.stats.likes,
					},
					viewer: { following: u.stats.followedByViewer, followed_by: u.stats.followsViewer },
				}
			: {}),
	};
}

function postJson(p: PostRow, repostBy?: { by: User; created_at: Date }) {
	return {
		id: p.id,
		text: p.text,
		created_at: iso(p.created_at),
		edited_at: iso(p.edited_at),
		url: `${PUBLIC_ORIGIN}/${p.author.screen_name}/status/${p.id}`,
		author: userJson(p.author),
		source: p.source || null,
		reply_to: p.reply_to_id,
		reply_to_screen_name: p.reply_screen_name ?? null,
		quote_of: p.quote_id,
		sensitive: !!p.sensitive,
		counts: { likes: p.like_count, reposts: p.repost_count, replies: p.reply_count, quotes: p.quote_count, bookmarks: p.bookmark_count, views: p.view_count ?? 0 },
		viewer: { liked: p.liked, reposted: p.reposted, bookmarked: p.bookmarked },
		media: (p.media ?? []).map((m) => ({
			id: m.id,
			type: m.kind === "video" ? "video" : m.mime === "image/gif" ? "gif" : "photo",
			url: mediaUrl(m.id, m.mime),
			...(m.kind === "video" ? { poster_url: posterUrl(m.id) } : {}),
			width: m.width,
			height: m.height,
			alt_text: m.alt_text ?? null,
		})),
		quoted: p.quoted ? postJson(p.quoted) : null,
		card: p.conversationCard ? {
			title: p.conversationCard.title,
			thanks: p.conversationCard.thanks,
			choices: p.conversationCard.choices,
		} : null,
		poll: p.poll ? {
			id: p.poll_id,
			choices: (p.poll as any).choices ?? [],
			counts: (p.poll as any).counts ?? [],
			total_votes: (p.poll as any).totalVotes ?? 0,
			closed: !!(p.poll as any).closed,
			voted: (p.poll as any).voted ?? null,
		} : null,
		...(repostBy ? { reposted_by: userJson(repostBy.by), reposted_at: iso(repostBy.created_at) } : {}),
	};
}

const itemJson = (i: FeedItem) => postJson(i.post, i.repost);

// a page of feed items, and the cursor for the next one
const page = (items: FeedItem[], limit: number) => ({
	data: items.map(itemJson),
	next_cursor: items.length >= limit ? items[items.length - 1].id : null,
});

// ---- requests

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
	Response.json(body, { status, headers: { "cache-control": "no-store", ...headers } });
const fail = (status: number, message: string) => json({ error: message }, status);

const limitOf = (url: URL, max = 100) => Math.min(Math.max(Math.floor(Number(url.searchParams.get("limit"))) || 20, 1), max);
const cursorOf = (url: URL) => {
	const c = url.searchParams.get("cursor");
	return isId(c) ? c : undefined;
};

async function body(req: Request): Promise<Record<string, any>> {
	const type = req.headers.get("content-type") ?? "";
	const bytes = await boundedBody(req, 2 * 1024 * 1024);
	const parsed = new Response(bytes, { headers: { "content-type": type } });
	if (type.includes("application/json")) {
		const value = await parsed.json().catch(() => ({}));
		return value && typeof value === "object" && !Array.isArray(value) ? value : {};
	}
	if (type.includes("form")) return Object.fromEntries((await parsed.formData().catch(() => new FormData())).entries());
	return {};
}

async function userOr404(v: Viewer, name: string) {
	let decoded = (() => {
		try {
			return decodeURIComponent(name);
		} catch {
			return "";
		}
	})();
	if (decoded.includes("%")) {
		try {
			decoded = decodeURIComponent(decoded);
		} catch {}
	}
	const u = decoded ? await userByName(v.id, decoded) : undefined;
	if (!u || u.status === "suspended") throw new ApiError(404, "No account goes by that name.");
	return u;
}

async function postOr404(v: Viewer, id: string) {
	const p = isId(id) ? await getPost(v.id, id) : undefined;
	if (!p) throw new ApiError(404, "No post with that id, or you can't see it.");
	return p;
}

const MAX_MEDIA_SEGMENT = 5 * 1024 * 1024;
const mediaLimit = (type: string) => type.startsWith("video/") ? settings().limits.video_mb * 1024 * 1024 : type === "image/gif" ? 15 * 1024 * 1024 : settings().limits.image_mb * 1024 * 1024;

async function callMedia(v: Viewer, query: Record<string, string>, form?: FormData) {
	const url = new URL(`${PUBLIC_ORIGIN}/i/media/upload.json?${new URLSearchParams(query)}`);
	const res = await mediaUpload(new Request(url, { method: "POST", body: form }), url, v);
	const out = res.status === 204 ? {} : await res.json().catch(() => ({}));
	if (res.status >= 400) throw new ApiError(res.status, out?.errors?.[0]?.message ?? out?.error ?? "Upload failed.");
	return out;
}

const mediaResult = (id: string, out: any) => ({
	media_id: id,
	processing: out.processing_info?.state ?? "succeeded",
	...(out.processing_info?.check_after_secs !== undefined ? { check_after_secs: out.processing_info.check_after_secs } : {}),
	...(out.processing_info?.progress_percent !== undefined ? { progress_percent: out.processing_info.progress_percent } : {}),
	...(out.processing_info?.error ? { error: out.processing_info.error } : {}),
	...(out.expires_after_secs !== undefined ? { expires_after_secs: out.expires_after_secs } : {}),
	...(out.total_bytes !== undefined ? { total_bytes: out.total_bytes, received_bytes: out.received_bytes, segments: out.segments } : {}),
});

async function beginMedia(req: Request, v: Viewer) {
	const b = await body(req);
	const type = typeof b.media_type === "string" ? b.media_type.trim().toLowerCase() : "";
	if (!/^(image|video)\/[a-z0-9.+-]+$/.test(type)) throw new ApiError(415, "Give the file's image/* or video/* media_type.");
	const total = typeof b.total_bytes === "number" || typeof b.total_bytes === "string" ? Number(b.total_bytes) : NaN;
	if (!Number.isSafeInteger(total) || total <= 0) throw new ApiError(400, "total_bytes must be the file's positive byte length.");
	if (total > mediaLimit(type)) throw new ApiError(413, "That file is too large.");
	const out = await callMedia(v, { command: "INIT", total_bytes: String(total), media_type: type, media_category: type.startsWith("video/") ? "tweet_video" : type === "image/gif" ? "tweet_gif" : "tweet_image" });
	return { media_id: out.media_id_string, max_segment_bytes: MAX_MEDIA_SEGMENT, expires_after_secs: 3600 };
}

async function appendMedia(req: Request, v: Viewer, id: string, segment: string) {
	if (!isId(id)) throw new ApiError(404, "Unknown upload.");
	const index = Number(segment);
	if (!Number.isInteger(index) || index < 0 || index > 10_000) throw new ApiError(400, "segment_index must be between 0 and 10000.");
	const data = await boundedBody(req, MAX_MEDIA_SEGMENT);
	if (!data.length) throw new ApiError(400, "The segment is empty.");
	const form = new FormData();
	form.set("media", new Blob([data], { type: "application/octet-stream" }));
	await callMedia(v, { command: "APPEND", media_id: id, segment_index: String(index) }, form);
	return { media_id: id, segment_index: index };
}

async function finishMedia(v: Viewer, id: string) {
	if (!isId(id)) throw new ApiError(404, "Unknown upload.");
	const status = await callMedia(v, { command: "STATUS", media_id: id });
	if (status.processing_info?.state !== "uploading") return mediaResult(id, status);
	if (status.received_bytes !== status.total_bytes) throw new ApiError(400, "Upload all segments before finalizing.");
	return mediaResult(id, await callMedia(v, { command: "FINALIZE", media_id: id }));
}

// The simple whole-body endpoint remains useful for small files. Larger files
// use the same uploader through bounded segments below the server's body cap.
async function uploadMedia(req: Request, v: Viewer) {
	const ct = req.headers.get("content-type") ?? "";
	if (ct.includes("multipart/form-data")) {
		const form = await req.formData();
		const file = (form.get("media") ?? form.get("file")) as Blob | null;
		if (!file) throw new ApiError(400, "Provide a file in 'media' or 'file' field.");
		const type = file.type || "image/jpeg";
		if (!/^(image|video)\//.test(type)) throw new ApiError(415, "Only image and video uploads are allowed.");
		const data = new Uint8Array(await file.arrayBuffer());
		if (data.length > mediaLimit(type)) throw new ApiError(413, "That file is too large.");
		const video = type.startsWith("video/");
		const init = await callMedia(v, { command: "INIT", total_bytes: String(data.length), media_type: type, media_category: video ? "tweet_video" : type === "image/gif" ? "tweet_gif" : "tweet_image" });
		const id = init.media_id_string;
		const segForm = new FormData();
		segForm.set("media", new Blob([data], { type }));
		await callMedia(v, { command: "APPEND", media_id: id, segment_index: "0" }, segForm);
		const done = await callMedia(v, { command: "FINALIZE", media_id: id });
		return {
			media_id: id,
			processing: done.processing_info?.state ?? "succeeded",
			kind: video ? "video" : type === "image/gif" ? "gif" : "image",
			poster_url: video ? `/media/poster/${id}.jpg` : null,
		};
	}
	const type = ct.split(";")[0].trim();
	if (!/^(image|video)\//.test(type)) throw new ApiError(415, "Send the file as the body with its image/* or video/* content type.");
	const data = await boundedBody(req, mediaLimit(type));
	if (!data.length) throw new ApiError(400, "The body is empty.");
	const video = type.startsWith("video/");
	const init = await callMedia(v, { command: "INIT", total_bytes: String(data.length), media_type: type, media_category: video ? "tweet_video" : type === "image/gif" ? "tweet_gif" : "tweet_image" });
	const id = init.media_id_string;
	const form = new FormData();
	form.set("media", new Blob([data], { type }));
	await callMedia(v, { command: "APPEND", media_id: id, segment_index: "0" }, form);
	const done = await callMedia(v, { command: "FINALIZE", media_id: id });
	return {
		media_id: id,
		processing: done.processing_info?.state ?? "succeeded",
		kind: video ? "video" : type === "image/gif" ? "gif" : "image",
		poster_url: video ? `/media/poster/${id}.jpg` : null,
	};
}

type Route = { method: string; pattern: RegExp; scope: "read" | "write"; bucket?: Bucket; run: (v: Viewer, m: RegExpExecArray, req: Request, url: URL) => Promise<unknown> };

const op = async (name: string, v: Viewer, vars: Record<string, unknown>) => {
	try {
		return await callOperation(name, v, vars);
	} catch (e) {
		if (e instanceof PostError) throw new ApiError(e.code === 144 ? 404 : 400, e.message);
		throw e;
	}
};

const ROUTES: Route[] = [
	{ method: "GET", pattern: /^\/me$/, scope: "read", run: async (v) => ({ data: v.id === "0" ? null : userJson((await userByName(v.id, v.screen_name))!) }) },
	{
		method: "POST", pattern: /^\/account\/settings$/, scope: "write", bucket: "write",
		run: async (v, _m, req) => {
			if (v.id === "0") throw new ApiError(401, "Sign in to update account settings.");
			const b = await body(req);
			const changes: Record<string, any> = {};
			if (typeof b.language === "string" && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(b.language)) {
				changes.language = b.language;
			}
			if (typeof b.name === "string" && b.name.trim().length > 0 && b.name.trim().length <= 50) {
				changes.name = b.name.trim();
			}
			if (typeof b.bio === "string" && b.bio.length <= 160) {
				changes.bio = b.bio;
			}
			if (typeof b.location === "string" && b.location.length <= 30) {
				changes.location = b.location;
			}
			if (typeof b.website === "string" && (b.website === "" || /^https?:\/\/\S+$/.test(b.website)) && b.website.length <= 100) {
				changes.website = b.website || null;
			}
			if (typeof b.avatar_url === "string") {
				changes.avatar_url = b.avatar_url.trim() || null;
			}
			if (typeof b.banner_url === "string") {
				changes.banner_url = b.banner_url.trim() || null;
			}
			if (typeof b.pronouns === "string") {
				changes.pronouns = b.pronouns.trim().slice(0, 30) || null;
			}
			if (typeof b.flag === "string") {
				changes.flag = b.flag.trim() || null;
			}
			if (b.decoration !== undefined) {
				const deco = parseDecoration(b.decoration);
				changes.decoration = deco ? JSON.stringify(deco) : null;
			}
			if (Object.keys(changes).length) {
				await sql`update users set ${sql(changes)} where id = ${v.id}::bigint`;
			}
			const [updated] = await sql`select ${userCols(v.id)} from users u where u.id = ${v.id}::bigint`;
			return { data: userJson(toUser(updated)) };
		},
	},
	{
		method: "GET", pattern: /^\/trends$/, scope: "read",
		run: async () => {
			let trends = await cachedTrends(1, 10);
			if (!trends.length) {
				try {
					const fallback = await sql`
						select lower((regexp_matches(text, '#([a-zA-Z0-9_\u00c0-\u024f]+)', 'g'))[1]) as tag, count(*)::int as posts
						from posts
						where created_at > now() - interval '24 hours' and not hidden
						group by 1
						order by 2 desc
						limit 10
					`;
					trends = (fallback as any[]).map((r) => ({ tag: r.tag, posts: r.posts }));
				} catch {}
			}
			return { data: trends };
		},
	},
	{ method: "GET", pattern: /^\/cards$/, scope: "read", run: async () => ({ data: await activeCards() }) },
	{ method: "GET", pattern: /^\/decorations$/, scope: "read", run: async () => ({ data: DISCORD_DECORATIONS }) },
	{
		method: "POST", pattern: /^\/remote-oauth\/token$/, scope: "read",
		run: async (_v, _m, req) => {
			const b = await body(req);
			const targetInstance = String(b.instance || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
			if (!targetInstance) throw new ApiError(400, "Missing target instance.");
			const code = String(b.code || "");
			const verifier = String(b.code_verifier || "");
			if (!code || !verifier) throw new ApiError(400, "Missing code or code_verifier.");
			const tokenRes = await fetch(`https://${targetInstance}/oauth/token`, {
				method: "POST",
				headers: { "content-type": "application/x-www-form-urlencoded" },
				body: new URLSearchParams({
					grant_type: "authorization_code",
					client_id: `${PUBLIC_ORIGIN}/oauth/circus-client.json`,
					code,
					code_verifier: verifier,
					redirect_uri: `${PUBLIC_ORIGIN}/?beta=1`,
				}),
			});
			const data = await tokenRes.json();
			if (!tokenRes.ok) throw new ApiError(tokenRes.status, data.error || "OAuth exchange failed.");
			return { data };
		},
	},
	{ method: "GET", pattern: /^\/suggestions$/, scope: "read", run: async (v, _m, _req, url) => ({ data: (await suggestedUsers(v.id, limitOf(url, 5))).map(userJson) }) },
	{ method: "GET", pattern: /^\/users\/([^/]+)$/, scope: "read", run: async (v, m) => ({ data: userJson(await userOr404(v, m[1])) }) },
	{
		method: "GET", pattern: /^\/users\/([^/]+)\/posts$/, scope: "read",
		run: async (v, m, _r, url) => {
			const u = await userOr404(v, m[1]);
			const limit = limitOf(url);
			return page(await feed({ viewerId: v.id, authors: { user: u.id }, replies: url.searchParams.get("replies") === "true", kinds: "both", limit, before: cursorOf(url) }), limit);
		},
	},
	{
		method: "GET", pattern: /^\/users\/([^/]+)\/(followers|following)$/, scope: "read",
		run: async (v, m, _r, url) => {
			const u = await userOr404(v, m[1]);
			return { data: (await followList(v.id, u.id, m[2] as "followers" | "following", limitOf(url, 200))).map(userJson) };
		},
	},
	{
		method: "GET", pattern: /^\/users\/([^/]+)\/likes$/, scope: "read",
		run: async (v, m, _r, url) => {
			const u = await userOr404(v, m[1]);
			const posts = await likedPosts(v.id, u.id, limitOf(url));
			return { data: posts.map((p) => postJson(p)) };
		},
	},
	{
		method: "GET", pattern: /^\/timeline$/, scope: "read",
		run: async (v, _m, _r, url) => {
			const limit = limitOf(url);
			const feedParam = url.searchParams.get("feed") || "for_you";
			if (feedParam === "for_you") {
				const rawCursor = url.searchParams.get("cursor");
				const offset = rawCursor ? (parseInt(rawCursor, 10) || 0) : 0;
				const items = await forYouFeed(v.id, limit, offset);
				return {
					data: items.map(itemJson),
					next_cursor: items.length >= limit ? String(offset + items.length) : null,
				};
			}
			const authors: FeedQuery["authors"] = feedParam === "following" && v.id !== "0" ? { following: true } : {};
			return page(await feed({ viewerId: v.id, authors, replies: false, kinds: "both", limit, before: cursorOf(url) }), limit);
		},
	},
	{
		method: "GET", pattern: /^\/notifications$/, scope: "read",
		run: async (v, _m, _r, url) => {
			if (v.id === "0") throw new ApiError(401, "Sign in to view notifications.");
			const mentionsOnly = url.searchParams.get("filter") === "mentions";
			const limit = limitOf(url);
			const notifs = await listNotifications(v.id, { mentionsOnly, limit });
			return {
				data: notifs.map((n) => ({
					kind: n.kind,
					at: n.at.toISOString(),
					users: n.users.map(userJson),
					post: n.post ? postJson(n.post) : null,
					total: n.total,
					text: n.text,
				})),
			};
		},
	},
	{ method: "GET", pattern: /^\/posts\/(\d{1,19})$/, scope: "read", run: async (v, m) => ({ data: postJson(await postOr404(v, m[1])) }) },
	{
		method: "GET", pattern: /^\/posts\/(\d{1,19})\/replies$/, scope: "read",
		run: async (v, m, _r, url) => {
			await postOr404(v, m[1]);
			return { data: (await replies(v.id, m[1], limitOf(url))).map((p) => postJson(p)) };
		},
	},
	{
		method: "GET", pattern: /^\/search(?:\/posts)?$/, scope: "read",
		run: async (v, _m, _r, url) => {
			const q = (url.searchParams.get("q") ?? "").trim().slice(0, 500);
			if (!q) throw new ApiError(400, "Give a query in q.");
			const limit = limitOf(url);
			const top = url.searchParams.get("sort") === "top";
			// Top is ranked, so its cursor is an offset ("o<n>"), as the client's
			// search is; an id cursor works for the newest-first listing.
			const cursor = url.searchParams.get("cursor") ?? "";
			const offset = top && /^o(\d{1,6})$/.test(cursor) ? Number(cursor.slice(1)) : 0;
			const ids = await searchPosts(q, { viewerId: v.id, top, limit, before: top ? undefined : cursorOf(url), offset });
			const byId = await postsByIds(v.id, ids);
			const data = (ids as string[]).map((id) => byId.get(id)).filter((p): p is PostRow => !!p).map((p) => postJson(p));
			const next = ids.length >= limit ? (top ? `o${offset + limit}` : ids[ids.length - 1]) : null;
			return { data, next_cursor: next };
		},
	},
	{
		method: "GET", pattern: /^\/search\/users$/, scope: "read",
		run: async (v, _m, _r, url) => {
			const q = (url.searchParams.get("q") ?? "").trim().slice(0, 500);
			if (!q) throw new ApiError(400, "Give a query in q.");
			const ids = await searchUsers(v.id, q, limitOf(url));
			const byId = await usersByIds(v.id, ids);
			return { data: (ids as string[]).map((id) => byId.get(id)).filter((x): x is User => !!x).map(userJson) };
		},
	},

	{
		method: "POST", pattern: /^\/posts$/, scope: "write", bucket: "post",
		run: async (v, _m, req) => {
			const b = await body(req);
			const mediaIds = (Array.isArray(b.media_ids) ? b.media_ids : typeof b.media_ids === "string" ? b.media_ids.split(",") : []).map(String).filter(isId);
			if (b.reply_to !== undefined && !isId(String(b.reply_to))) throw new ApiError(400, "reply_to is a post id.");
			if (b.quote !== undefined && !isId(String(b.quote))) throw new ApiError(400, "quote is a post id.");
			const quoted = b.quote !== undefined ? await postOr404(v, String(b.quote)) : undefined;
			const out: any = await op("CreateTweet", v, {
				tweet_text: typeof b.text === "string" ? b.text : "",
				...(b.reply_to !== undefined ? { reply: { in_reply_to_tweet_id: String(b.reply_to) } } : {}),
				...(quoted ? { attachment_url: `${PUBLIC_ORIGIN}/${quoted.author.screen_name}/status/${quoted.id}` } : {}),
				media: { media_entities: mediaIds.map((media_id: string) => ({ media_id })), possibly_sensitive: b.sensitive === true || b.sensitive === "true" },
			});
			const id = out?.data?.create_tweet?.tweet_results?.result?.rest_id;
			return { data: postJson(await postOr404(v, id)), status: 201 };
		},
	},
	{
		method: "POST", pattern: /^\/posts\/(\d{1,19})\/translate$/, scope: "read",
		run: async (v, m, req) => {
			const b = await body(req);
			const target = String(b.target_lang ?? v.language ?? "es");
			const post = await postOr404(v, m[1]);
			const res = await translateText(post.text, target);
			return { data: { text: res.translated_text, translated_text: res.translated_text, source_lang: res.source_lang, target_lang: target } };
		},
	},
	{
		method: "POST", pattern: /^\/polls\/(\d{1,19})\/vote$/, scope: "write", bucket: "engage",
		run: async (v, m, req) => {
			const b = await body(req);
			const choice = Number(b.choice);
			await votePoll(v.id, m[1], choice);
			return { data: { voted: choice } };
		},
	},
	{
		method: "DELETE", pattern: /^\/posts\/(\d{1,19})$/, scope: "write",
		run: async (v, m) => {
			const p = await postOr404(v, m[1]);
			if (p.author.id !== v.id) throw new ApiError(403, "You can only delete your own posts.");
			await op("DeleteTweet", v, { tweet_id: m[1] });
			return { data: { deleted: true } };
		},
	},
	...(["like", "repost", "bookmark"] as const).flatMap((what): Route[] => {
		const [on, off] = { like: ["FavoriteTweet", "UnfavoriteTweet"], repost: ["CreateRetweet", "DeleteRetweet"], bookmark: ["CreateBookmark", "DeleteBookmark"] }[what];
		const run = (name: string, key: string) => async (v: Viewer, m: RegExpExecArray) => {
			await postOr404(v, m[1]);
			await op(name, v, { [key]: m[1] });
			return { data: postJson(await postOr404(v, m[1])) };
		};
		return [
			{ method: "POST", pattern: new RegExp(`^/posts/(\\d{1,19})/${what}$`), scope: "write", bucket: "engage", run: run(on, "tweet_id") },
			{ method: "DELETE", pattern: new RegExp(`^/posts/(\\d{1,19})/${what}$`), scope: "write", bucket: "engage", run: run(off, what === "repost" ? "source_tweet_id" : "tweet_id") },
		];
	}),
	...(["POST", "DELETE"] as const).map((method): Route => ({
		method, pattern: /^\/users\/([^/]+)\/follow$/, scope: "write", bucket: "engage",
		run: async (v, m) => {
			const u = await userOr404(v, m[1]);
			if (u.id === v.id) throw new ApiError(400, "You can't follow yourself.");
			await setFollow(v.id, u.id, method === "POST");
			return { data: userJson(await userOr404(v, m[1])) };
		},
	})),
	{ method: "POST", pattern: /^\/media$/, scope: "write", bucket: "upload", run: async (v, _m, req) => ({ data: await uploadMedia(req, v), status: 201 }) },
	{ method: "POST", pattern: /^\/media\/uploads$/, scope: "write", bucket: "upload", run: async (v, _m, req) => ({ data: await beginMedia(req, v), status: 201 }) },
	{ method: "POST", pattern: /^\/media\/(\d{1,19})\/segments\/(\d+)$/, scope: "write", bucket: "write", run: async (v, m, req) => ({ data: await appendMedia(req, v, m[1], m[2]) }) },
	{ method: "POST", pattern: /^\/media\/(\d{1,19})\/finalize$/, scope: "write", bucket: "write", run: async (v, m) => {
		if (!isId(m[1])) throw new ApiError(404, "Unknown upload.");
		return { data: await finishMedia(v, m[1]) };
	} },
	{ method: "GET", pattern: /^\/media\/(\d{1,19})$/, scope: "read", run: async (v, m) => {
		if (!isId(m[1])) throw new ApiError(404, "Unknown upload.");
		return { data: mediaResult(m[1], await callMedia(v, { command: "STATUS", media_id: m[1] })) };
	} },
];

export async function publicApi(req: Request, url: URL, sessionViewer?: Viewer): Promise<Response> {
	const path = url.pathname.slice("/api/v1".length) || "/";
	if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
	const auth = (await tokenViewer(req)) ?? (sessionViewer ? { viewer: sessionViewer, scope: "write" } : { viewer: GUEST_VIEWER, scope: "read" });
	const { viewer, scope } = auth;
	let route: Route | undefined;
	let match: RegExpExecArray | null = null;
	for (const r of ROUTES) {
		const m = r.pattern.exec(path);
		if (!m) continue;
		if (r.method === req.method) {
			route = r;
			match = m;
			break;
		}
	}
	if (!route || !match) return withCors(fail(404, "No such endpoint. See /api for the list."));
	if (route.scope === "write" && (scope !== "write" || viewer.id === "0")) return withCors(fail(401, "Sign in to perform this action."));
	if (settings().operations.maintenance) return withCors(fail(503, settings().operations.message || "The instance is under maintenance."));

	const rateId = viewer.id === "0" ? "guest" : viewer.id;
	const where = `api ${route.method} ${route.pattern.source}`;
	const last = take(route.bucket ? [["read", rateId], [route.bucket, rateId]] : [["read", rateId]], (bucket, first) => {
		if (first) noteRefusal(bucket, where, rateId);
	});
	if (!last.ok) return withCors(limitedResponse(last));
	try {
		const out: any = await route.run(viewer, match, req, url);
		const { status, ...rest } = out ?? {};
		return withCors(json(rest, status ?? 200, limitHeaders(last)));
	} catch (e) {
		if (e instanceof BodyTooLarge) return withCors(fail(413, "That request is too large."));
		if (e instanceof ApiError) return withCors(fail(e.status, e.message));
		console.error(e);
		return withCors(fail(500, "Something went wrong on our side."));
	}
}

// tokens are sent explicitly, never as cookies, so any site may call the API
const CORS = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type", "access-control-allow-methods": "GET, POST, DELETE, OPTIONS", "access-control-max-age": "86400" };
function withCors(res: Response) {
	for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
	return res;
}

// ---- /account/api: the account's tokens

async function tokensView(req: Request, v: Viewer, fresh = "", error = "", status = 200) {
	const tokens = await sql`select id::text, name, scope, created_at, last_used_at from api_tokens where user_id = ${v.id}::bigint and client_id is null order by created_at desc`;
	const when = (d: Date | null) => (d ? new Date(d).toUTCString().replace(/:\d\d GMT$/, " UTC") : "never");
	return accountPage({
		req,
		viewer: v,
		title: "API tokens",
		status,
		// same-origin, not no-referrer: under no-referrer the form posts with "Origin: null"
		referrer: "same-origin",
		body: `<h1>API tokens</h1>
<p>A token lets a script or bot use your account through the <a href="/api">API</a>. Anyone holding it can act as you, so keep it secret and delete it when you stop using it.</p>
<p>Changing or resetting your password revokes all API tokens. Your scripts and bots will need new tokens afterward.</p>
${fresh ? `<div class="card success"><b>Your new token.</b> Copy it now; it won't be shown again.<p class="code">${esc(fresh)}</p></div>` : ""}
${error ? `<p class="error">${esc(error)}</p>` : ""}
<form method="post"><input type="hidden" name="do" value="create">
<input name="name" placeholder="What it's for, e.g. my weather bot" maxlength="40" required>
<select name="scope"><option value="read">Read only</option><option value="write">Read and write (post, like, follow...)</option></select>
<button type="submit">Make a token</button></form>
${tokens.length
	? tokens.map((t: any) => `<div class="card split"><div><b>${esc(t.name)}</b><div class="dim">${t.scope === "write" ? "read and write" : "read only"} · made ${esc(when(t.created_at))} · last used ${esc(when(t.last_used_at))}</div></div>
<form method="post"><input type="hidden" name="do" value="delete"><input type="hidden" name="id" value="${esc(t.id)}"><button class="small danger" type="submit">Delete</button></form></div>`).join("")
	: `<p class="dim">No tokens yet.</p>`}
<p><a href="/api">API documentation</a></p>`,
	});
}

export async function apiTokensRoute(req: Request, v: Viewer): Promise<Response> {
	if (req.method !== "POST") return tokensView(req, v);
	// a plain form post from this page only
	const origin = req.headers.get("origin");
	if (origin && origin !== PUBLIC_ORIGIN) return tokensView(req, v, "", "That request didn't come from this page.");
	const f = await req.formData().catch(() => new FormData());
	if (f.get("do") === "delete") {
		const id = String(f.get("id") ?? "");
		if (isId(id)) await sql`delete from api_tokens where id = ${id}::bigint and user_id = ${v.id}::bigint and client_id is null`;
		return tokensView(req, v);
	}
	const name = String(f.get("name") ?? "").trim();
	if (!name || [...name].length > 40) return tokensView(req, v, "", "Name the token (up to 40 characters).");
	const scope = f.get("scope") === "write" ? "write" : "read";
	try {
		return tokensView(req, v, await createToken(v.id, name, scope, v.token));
	} catch (e) {
		if (e instanceof ApiError) return tokensView(req, v, "", e.message, e.status);
		throw e;
	}
}
