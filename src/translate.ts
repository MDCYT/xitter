// Integration with Cloudflare Workers AI Translation API

import { detectLanguage, normalizeLangCode, toApiLang } from "./lang";

const TRANSLATE_API_URL = "https://cf-ai-translator.mdcdev.workers.dev/api/translate";
const TRANSLATE_API_KEY = "cftrans_a0199ca4327eaa7b51862a8644a31b6419d2ea199810f5e2fbc2a04c5ea9093a";

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

	const bodyPayload: Record<string, string> = {
		text: text.slice(0, 5000),
		source_lang: toApiLang(resolvedSource),
		target_lang: toApiLang(normTarget),
	};

	try {
		const res = await fetch(TRANSLATE_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": TRANSLATE_API_KEY,
				"User-Agent": "Mozilla/5.0",
			},
			body: JSON.stringify(bodyPayload),
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			const errText = await res.text().catch(() => "");
			console.error(`Translation API error (${res.status}):`, errText);
			return text; // Graceful fallback
		}

		const json = (await res.json()) as {
			success?: boolean;
			data?: {
				translated_text: string;
				source_lang: string;
				target_lang: string;
				cached?: boolean;
			};
		};

		if (!json?.success || !json?.data?.translated_text) {
			return text; // Graceful fallback
		}

		const translated = json.data.translated_text;
		setCache(lineKey, {
			translated_text: translated,
			source_lang: resolvedSource,
			target_lang: normTarget,
			cached: json.data.cached,
		});
		return translated;
	} catch (err: unknown) {
		console.error("translateSingleLine failed:", (err as Error)?.message || err);
		return text; // Graceful fallback
	}
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
