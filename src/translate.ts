// Integration with Cloudflare Workers AI Translation API

import { normalizeLangCode, toApiLang } from "./lang";

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
	const cacheKey = `${normTarget}:${normSource ?? "auto"}:${text}`;

	const cached = memoryCache.get(cacheKey);
	if (cached) return { ...cached, cached: true };

	const bodyPayload: Record<string, string> = {
		text: text.slice(0, 5000),
		target_lang: toApiLang(normTarget),
	};
	if (normSource) {
		bodyPayload.source_lang = toApiLang(normSource);
	}

	try {
		const res = await fetch(TRANSLATE_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-API-Key": TRANSLATE_API_KEY,
			},
			body: JSON.stringify(bodyPayload),
			signal: AbortSignal.timeout(8000),
		});

		if (!res.ok) {
			const errText = await res.text().catch(() => "");
			console.error(`Translation API error (${res.status}):`, errText);
			throw new Error(`Translation API error (${res.status})`);
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
			throw new Error("Translation API returned unsuccessful response");
		}

		const result: TranslationResult = {
			translated_text: json.data.translated_text,
			source_lang: normalizeLangCode(json.data.source_lang) || normSource || "en",
			target_lang: normalizeLangCode(json.data.target_lang) || normTarget,
			cached: json.data.cached,
		};

		if (memoryCache.size >= MAX_CACHE_SIZE) {
			const firstKey = memoryCache.keys().next().value;
			if (firstKey) memoryCache.delete(firstKey);
		}
		memoryCache.set(cacheKey, result);

		return result;
	} catch (err: unknown) {
		console.error("translateText failed:", (err as Error)?.message || err);
		throw err;
	}
}
