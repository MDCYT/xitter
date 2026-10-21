import { describe, expect, test } from "bun:test";
import { detectLanguage, getLanguageDisplayName, normalizeLangCode, toApiLang } from "../src/lang";
import { translateText } from "../src/translate";
import { extractEntities } from "../src/links";

describe("Language detection and normalization", () => {
	test("normalizes language codes and names", () => {
		expect(normalizeLangCode("es")).toBe("es");
		expect(normalizeLangCode("es-ES")).toBe("es");
		expect(normalizeLangCode("SPANISH")).toBe("es");
		expect(normalizeLangCode("english")).toBe("en");
		expect(normalizeLangCode("en-US")).toBe("en");
		expect(normalizeLangCode("pt-BR")).toBe("pt");
		expect(toApiLang("es")).toBe("spanish");
		expect(toApiLang("en")).toBe("english");
	});

	test("detects script-based languages", () => {
		expect(detectLanguage("こんにちは、世界")).toBe("ja");
		expect(detectLanguage("안녕하세요 여러분")).toBe("ko");
		expect(detectLanguage("你好世界")).toBe("zh");
		expect(detectLanguage("Привет всем")).toBe("ru");
		expect(detectLanguage("مرحبا بالعالم")).toBe("ar");
	});

	test("detects stop-word and accent based languages", () => {
		expect(detectLanguage("Hello everyone, welcome to Xitter!")).toBe("en");
		expect(detectLanguage("Hola a todos, bienvenidos a esta nueva publicación")).toBe("es");
		expect(detectLanguage("Olá a todos, bem-vindos ao meu novo post")).toBe("pt");
		expect(detectLanguage("Bonjour tout le monde, bienvenue")).toBe("fr");
		expect(detectLanguage("Hallo zusammen, willkommen zu meinem Beitrag")).toBe("de");
	});

	test("localized language display names", () => {
		expect(getLanguageDisplayName("en", "es")).toBe("Inglés");
		expect(getLanguageDisplayName("es", "en")).toBe("Spanish");
		expect(getLanguageDisplayName("ja", "es")).toBe("Japonés");
	});
});

describe("Translation API integration", () => {
	test("translates text using Cloudflare Workers AI and caches result", async () => {
		const text = "Prueba de traducción en tiempo real";
		const res = await translateText(text, "en", "es");
		expect(res.translated_text).toBeDefined();
		expect(res.translated_text.length).toBeGreaterThan(0);
		expect(res.target_lang).toBe("en");

		// Second call should come from memory cache
		const cached = await translateText(text, "en", "es");
		expect(cached.cached).toBe(true);
		expect(cached.translated_text).toBe(res.translated_text);
	});

	test("handles empty text safely", async () => {
		const res = await translateText("", "en", "es");
		expect(res.translated_text).toBe("");
	});

	test("preserves newlines when translating multi-line text", async () => {
		const text = "Primera línea\nSegunda línea\n\nTercera línea";
		const res = await translateText(text, "en", "es");
		const lines = res.translated_text.split("\n");
		expect(lines.length).toBe(4);
		expect(lines[0].length).toBeGreaterThan(0);
		expect(lines[1].length).toBeGreaterThan(0);
		expect(lines[2]).toBe("");
		expect(lines[3].length).toBeGreaterThan(0);
	});

	test("extractEntities extracts URLs, hashtags, and mentions with exact character indices", () => {
		const text = "Hello @alice! Check https://example.com/test and #awesome hashtag $BTC";
		const entities = extractEntities(text);

		expect(entities.urls.length).toBe(1);
		expect(entities.urls[0].url).toBe("https://example.com/test");
		const urlSlice = [...text].slice(entities.urls[0].indices[0], entities.urls[0].indices[1]).join("");
		expect(urlSlice).toBe(entities.urls[0].url);

		expect(entities.hashtags.length).toBe(1);
		expect(entities.hashtags[0].text).toBe("awesome");
		const tagSlice = [...text].slice(entities.hashtags[0].indices[0], entities.hashtags[0].indices[1]).join("");
		expect(tagSlice).toBe("#awesome");

		expect(entities.user_mentions.length).toBe(1);
		expect(entities.user_mentions[0].screen_name).toBe("alice");
		const mentionSlice = [...text].slice(entities.user_mentions[0].indices[0], entities.user_mentions[0].indices[1]).join("");
		expect(mentionSlice).toBe("@alice");

		expect(entities.symbols.length).toBe(1);
		expect(entities.symbols[0].text).toBe("BTC");
	});

	test("i18n manifest contains supported language bundles", async () => {
		const manifest = (await import("../src/i18n-manifest.json")).default as Record<string, string>;
		expect(manifest.es).toBeDefined();
		expect(manifest.es).toContain("i18n/es.");
		expect(manifest.en).toBeDefined();
		expect(manifest.fr).toBeDefined();
		expect(manifest.ja).toBeDefined();
	});
});
