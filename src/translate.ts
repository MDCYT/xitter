import type { Viewer } from "./auth";
import { sql } from "./db";
import { isId } from "./ids";
import { extractEntities, bioEntities, urlEntities } from "./links";
import { MENTION_HANDLE } from "./mentions";
import { bioMentions, hashtags, legacyTweet, userMentions } from "./model";
import { getPost } from "./posts";
import { userById } from "./users";
import { detectLanguage, getLanguageDisplayName, normalizeLangCode, toApiLang } from "./lang";

const TRANSLATE_API_URL = "https://cf-ai-translator.mdcdev.workers.dev/api/translate";
const TRANSLATE_API_KEY = "cftrans_a0199ca4327eaa7b51862a8644a31b6419d2ea199810f5e2fbc2a04c5ea9093a";

const GOOGLE_ENDPOINT = "https://translate-pa.googleapis.com/v1/translateHtml";
const GOOGLE_API_KEY = "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520";
const TIMEOUT_MS = 8000;
const MAX_CHARS = 30_000;

export interface TranslationResult {
	translated_text: string;
	source_lang: string; // ISO 639-1 code (e.g. "en")
	target_lang: string; // ISO 639-1 code (e.g. "es")
	cached?: boolean;
}

const memoryCache = new Map<string, TranslationResult>();
const MAX_CACHE_SIZE = 2000;

function setCache(key: string, result: TranslationResult) {
	if (memoryCache.size >= MAX_CACHE_SIZE) {
		const firstKey = memoryCache.keys().next().value;
		if (firstKey) memoryCache.delete(firstKey);
	}
	memoryCache.set(key, result);
}

const LANG_RE = /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/;
export const isValidLang = (code: unknown): code is string => typeof code === "string" && LANG_RE.test(code);

const escapeHtml = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const unescapeHtml = (s: string) =>
	s
		.replace(/<br\s*\/?>\s?/gi, "\n")
		.replace(/<\/span>\s+(?=[,.!?;:])/g, "")
		.replace(/<[^>]*>/g, "")
		.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (m, ref: string) => {
			if (ref[0] !== "#") return NAMED[ref.toLowerCase()] ?? m;
			const cp = ref[1] === "x" || ref[1] === "X" ? Number.parseInt(ref.slice(2), 16) : Number.parseInt(ref.slice(1), 10);
			return Number.isFinite(cp) && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
		});

const KEEP = new RegExp(`https?:\\/\\/\\S+|#[\\p{L}\\p{N}_]+|${MENTION_HANDLE.source}`, "giu");

const protectedHtml = (text: string) => {
	let out = "";
	let at = 0;
	for (const m of text.matchAll(KEEP)) {
		out += `${escapeHtml(text.slice(at, m.index))}<span translate="no">${escapeHtml(m[0])}</span>`;
		at = m.index + m[0].length;
	}
	return out + escapeHtml(text.slice(at));
};

export async function googleTranslate(text: string, target: string, source = "auto"): Promise<{ text: string; source: string } | undefined> {
	try {
		const res = await fetch(GOOGLE_ENDPOINT, {
			method: "POST",
			headers: { "content-type": "application/json+protobuf", "x-goog-api-key": GOOGLE_API_KEY },
			body: JSON.stringify([[[protectedHtml(text)], source, target], "te_lib"]),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		if (!res.ok) return undefined;
		const data = await res.json();
		if (!Array.isArray(data) || !Array.isArray(data[0]) || typeof data[0][0] !== "string") return undefined;
		const detected = Array.isArray(data[1]) && typeof data[1][0] === "string" ? data[1][0] : source;
		return { text: unescapeHtml(data[0][0]), source: detected };
	} catch {
		return undefined;
	}
}

function isNonTranslatableLine(line: string): boolean {
	const trimmed = line.trim();
	if (!trimmed) return true;
	// Pure URL (optionally with leading/trailing emojis or bullets)
	if (/^(\p{Extended_Pictographic}|\s|[🔗👉👇•*-])*(https?:\/\/[^\s<>"]+)\s*$/u.test(trimmed)) return true;
	// Pure hashtags (e.g. #P4R or #Persona #Gaming)
	if (/^(\p{Extended_Pictographic}|\s|[•*-])*(#[\p{L}\p{N}_]+\s*)+$/u.test(trimmed)) return true;
	// Pure mentions (e.g. @staff or @user@instance)
	if (/^(\p{Extended_Pictographic}|\s|[•*-])*(@[\w@.-]+\s*)+$/u.test(trimmed)) return true;
	// Pure emojis, punctuation, numbers, symbols (no letters)
	if (!/\p{L}/u.test(trimmed)) return true;
	return false;
}

async function translateSingleLine(
	text: string,
	normTarget: string,
	resolvedSource: string,
): Promise<string> {
	if (isNonTranslatableLine(text)) return text;

	const lineKey = `${normTarget}:${resolvedSource}:${text}`;
	const cached = memoryCache.get(lineKey);
	if (cached) return cached.translated_text;

	// Try Cloudflare Workers AI first
	try {
		const res = await fetch(TRANSLATE_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": TRANSLATE_API_KEY,
				"User-Agent": "Mozilla/5.0",
			},
			body: JSON.stringify({
				text: text.slice(0, 5000),
				source_lang: toApiLang(resolvedSource),
				target_lang: toApiLang(normTarget),
			}),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});

		if (res.ok) {
			const json = (await res.json()) as {
				success?: boolean;
				data?: {
					translated_text: string;
					source_lang: string;
					target_lang: string;
					cached?: boolean;
				};
			};
			if (json?.success && json?.data?.translated_text) {
				const translated = json.data.translated_text;
				setCache(lineKey, {
					translated_text: translated,
					source_lang: resolvedSource,
					target_lang: normTarget,
					cached: json.data.cached,
				});
				return translated;
			}
		}
	} catch (err: unknown) {
		console.error("Cloudflare translateSingleLine failed, trying Google fallback:", (err as Error)?.message || err);
	}

	// Fallback to Google Translate
	const gResult = await googleTranslate(text, normTarget, resolvedSource);
	if (gResult?.text) {
		setCache(lineKey, {
			translated_text: gResult.text,
			source_lang: resolvedSource,
			target_lang: normTarget,
		});
		return gResult.text;
	}

	return text;
}

export async function translateText(
	text: string,
	targetLang: string,
	sourceLang?: string,
): Promise<TranslationResult> {
	if (!text || !text.trim()) {
		return {
			translated_text: text,
			source_lang: normalizeLangCode(sourceLang) || "en",
			target_lang: normalizeLangCode(targetLang) || "es",
		};
	}

	const normTarget = normalizeLangCode(targetLang);
	const normSource = sourceLang ? normalizeLangCode(sourceLang) : undefined;
	const resolvedSource = normSource || detectLanguage(text, "en");
	const cacheKey = `${normTarget}:${resolvedSource}:${text}`;

	const cached = memoryCache.get(cacheKey);
	if (cached) return { ...cached, cached: true };

	if (resolvedSource === normTarget) {
		return {
			translated_text: text,
			source_lang: resolvedSource,
			target_lang: normTarget,
		};
	}

	const normalized = text.replace(/\r\n/g, "\n");
	if (normalized.includes("\n")) {
		const lines = normalized.split("\n");
		const translatedLines = await Promise.all(
			lines.map((line) => translateSingleLine(line, normTarget, resolvedSource))
		);
		const combined = translatedLines.join("\n");
		const result: TranslationResult = {
			translated_text: combined,
			source_lang: resolvedSource,
			target_lang: normTarget,
		};
		setCache(cacheKey, result);
		return result;
	}

	const single = await translateSingleLine(normalized, normTarget, resolvedSource);
	const result: TranslationResult = {
		translated_text: single,
		source_lang: resolvedSource,
		target_lang: normTarget,
	};
	setCache(cacheKey, result);
	return result;
}

const hashOf = (text: string) => new Bun.CryptoHasher("sha256").update(text).digest("hex");

const TRANSLATE_TWEET = /strato\/column\/None\/tweetId=(\d{1,19}),destinationLanguage=(None|Some\(([A-Za-z-]{2,10})\)),[^/]*\/translation\/service\/translateTweet$/;
const TRANSLATE_PROFILE = /strato\/column\/None\/profileUserId=(\d{1,19}),destinationLanguage=(None|Some\(([A-Za-z-]{2,10})\)),[^/]*\/translation\/service\/translateProfile$/;
export const isTranslateRequest = (path: string) => /\/translation\/service\/translate(Tweet|Profile)$/.test(path);

const failure = (status: number, code: number, message: string) => Response.json({ errors: [{ code, message }] }, { status });

export async function translateRoute(path: string, viewer: Viewer): Promise<Response | undefined> {
	if (!isTranslateRequest(path)) return undefined;
	let decoded = path;
	try {
		decoded = decodeURIComponent(path);
	} catch {}
	const profile = TRANSLATE_PROFILE.exec(decoded);
	if (profile) return translateProfile(profile, viewer);
	const m = TRANSLATE_TWEET.exec(decoded);
	if (!m || !isId(m[1])) return failure(400, 214, "That translation request isn't valid.");
	const target = isValidLang(m[3]) ? normalizeLangCode(m[3]) : isValidLang(viewer.language) ? normalizeLangCode(viewer.language) : "es";
	const post = await getPost(viewer.id, m[1]);
	if (!post) return failure(404, 144, "No status found with that ID.");
	if (!post.text.trim() || post.text.length > MAX_CHARS) return failure(400, 214, "This post can't be translated.");

	const baseId = post.staleEditOf ?? post.id;
	const [old] = post.staleEditOf ? await sql`select seq from post_versions where version_id = ${post.id}::bigint` : [];
	const version = old ? Number(old.seq) : (post.edit_count ?? 0);
	const hash = hashOf(post.text);
	const [hit] = await sql`select source_lang, text from post_translations
		where post_id = ${baseId}::bigint and version = ${version} and target_lang = ${target} and source_hash = ${hash}`.catch(() => []);
	let translated: { text: string; source: string } | undefined = hit ? { text: hit.text, source: hit.source_lang } : undefined;
	if (!translated) {
		try {
			const res = await translateText(post.text, target);
			translated = { text: res.translated_text, source: res.source_lang };
			await sql`insert into post_translations (post_id, version, target_lang, source_hash, source_lang, text)
				values (${baseId}::bigint, ${version}, ${target}, ${hash}, ${translated.source}, ${translated.text})
				on conflict (post_id, version, target_lang) do update set source_hash = excluded.source_hash, source_lang = excluded.source_lang, text = excluded.text, created_at = now()`.catch(() => {});
		} catch {
			return failure(503, 131, "Translation isn't available right now. Try again later.");
		}
	}
	const text = translated.text;
	const textLength = [...text].length;
	const base = legacyTweet(post);
	const media = (base.extended_entities as any)?.media ?? (base.entities as any)?.media ?? [];
	const adjustedMedia = media.map((m: any) => ({ ...m, indices: [textLength, textLength] }));
	const entities = extractEntities(text, adjustedMedia);

	return Response.json({
		...base,
		id: post.id,
		id_str: post.id,
		text,
		full_text: text,
		translation: text,
		display_text_range: [0, textLength],
		entities,
		...(adjustedMedia.length ? { extended_entities: { media: adjustedMedia } } : {}),
		translationState: "Success",
		sourceLanguage: translated.source,
		localizedSourceLanguage: getLanguageDisplayName(translated.source, target),
		destinationLanguage: target,
		translationSource: "X",
	});
}

async function translateProfile(m: RegExpExecArray, viewer: Viewer): Promise<Response> {
	if (!isId(m[1])) return failure(400, 214, "That translation request isn't valid.");
	const target = isValidLang(m[3]) ? normalizeLangCode(m[3]) : isValidLang(viewer.language) ? normalizeLangCode(viewer.language) : "es";
	const user = await userById(viewer.id, m[1]);
	if (!user || user.status === "suspended" || user.stats?.blockedBy) return failure(404, 50, "User not found.");
	const bio = user.bio?.trim() ?? "";
	if (!bio || bio.length > MAX_CHARS) return failure(400, 214, "This bio can't be translated.");
	const hash = hashOf(bio);
	const [hit] = await sql`select source_lang, text from bio_translations
		where user_id = ${user.id}::bigint and target_lang = ${target} and source_hash = ${hash}`.catch(() => []);
	let translated: { text: string; source: string } | undefined = hit ? { text: hit.text, source: hit.source_lang } : undefined;
	if (!translated) {
		try {
			const res = await translateText(bio, target);
			translated = { text: res.translated_text, source: res.source_lang };
			await sql`insert into bio_translations (user_id, target_lang, source_hash, source_lang, text)
				values (${user.id}::bigint, ${target}, ${hash}, ${translated.source}, ${translated.text})
				on conflict (user_id, target_lang) do update set source_hash = excluded.source_hash, source_lang = excluded.source_lang, text = excluded.text, created_at = now()`.catch(() => {});
		} catch {
			return failure(503, 131, "Translation isn't available right now. Try again later.");
		}
	}
	const text = translated.text;
	return Response.json({
		profileUserId: user.id,
		profileTranslation: {
			translation: text,
			entities: { urls: extractEntities(text).urls, user_mentions: bioMentions({ ...user, bio: text }), hashtags: hashtags(text), symbols: [] },
			translationState: "Success",
			sourceLanguage: translated.source,
			localizedSourceLanguage: getLanguageDisplayName(translated.source, target),
			destinationLanguage: target,
			translationSource: "X",
		},
	});
}
