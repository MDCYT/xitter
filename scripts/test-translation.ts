import { describe, expect, test } from "bun:test";
import { detectLanguage, getLanguageDisplayName, normalizeLangCode, toApiLang } from "../src/lang";
import { translateText } from "../src/translate";

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

	test("i18n manifest contains supported language bundles", async () => {
		const manifest = (await import("../src/i18n-manifest.json")).default as Record<string, string>;
		expect(manifest.es).toBeDefined();
		expect(manifest.es).toContain("i18n/es.");
		expect(manifest.en).toBeDefined();
		expect(manifest.fr).toBeDefined();
		expect(manifest.ja).toBeDefined();
	});
});
