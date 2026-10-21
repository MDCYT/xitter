// Language detection, code normalization, and localized language display names.

const CJK_JA = /[\u3040-\u309F\u30A0-\u30FF]/; // Hiragana or Katakana -> Japanese
const CJK_KO = /[\uAC00-\uD7AF\u1100-\u11FF]/; // Hangul -> Korean
const CJK_ZH = /[\u4E00-\u9FFF]/; // Hanzi -> Chinese
const CYRILLIC = /[\u0400-\u04FF]/; // Cyrillic -> Russian
const ARABIC = /[\u0600-\u06FF]/; // Arabic

const STOP_WORDS: Record<string, Set<string>> = {
	es: new Set(["de", "la", "que", "el", "en", "y", "a", "los", "se", "del", "las", "por", "un", "para", "con", "no", "una", "su", "al", "lo", "como", "mas", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "son", "entre", "cuando", "muy", "sin", "sobre", "también", "tambien", "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí", "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho", "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros", "mi", "mis", "tus", "te", "ti", "hola", "bueno", "bien", "estoy", "tengo", "hacer", "hace"]),
	en: new Set(["the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "im", "dont", "cant"]),
	pt: new Set(["de", "a", "o", "que", "e", "do", "da", "em", "um", "para", "é", "com", "não", "uma", "os", "no", "se", "na", "por", "mais", "as", "dos", "como", "mas", "foi", "ao", "ele", "das", "tem", "à", "seu", "sua", "ou", "ser", "quando", "muito", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até", "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter", "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha", "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa", "pelos", "elas", "havia", "seja", "qual", "será", "nós", "tenho", "lhe", "deles", "essas", "esses", "pelas", "este", "fosse", "dele"]),
	fr: new Set(["de", "la", "le", "et", "les", "des", "en", "un", "du", "une", "est", "que", "pour", "dans", "qui", "il", "par", "sur", "au", "pas", "ce", "plus", "avec", "ne", "se", "sont", "ou", "son", "sa", "ses", "mais", "ont", "ses", "cette", "comme", "nous", "vous", "ils", "elle", "tout", "lui", "même", "aux", "leur", "aussi", "faire", "peut", "ces", "y", "deux", "bien", "sans", "peut", "encore", "dont"]),
	de: new Set(["der", "die", "und", "in", "den", "von", "zu", "das", "mit", "sich", "des", "auf", "für", "ist", "im", "dem", "nicht", "ein", "eine", "als", "auch", "es", "an", "werden", "aus", "er", "hat", "dass", "sie", "nach", "wird", "bei", "einer", "um", "am", "sind", "noch", "wie", "einem", "über", "einen", "so", "zum", "war", "haben", "nur", "oder", "aber", "vor", "zur", "bis", "mehr", "durch", "man", "sein", "wurde", "sei", "prozent", "hatte", "kann", "gegen", "vom", "können", "schon", "wenn", "habe", "seine", "ihre", "unter", "wir", "diese", "eines", "zeit", "das", "weil"]),
	it: new Set(["di", "il", "che", "la", "e", "un", "a", "in", "per", "una", "sono", "mi", "si", "ho", "ma", "ha", "non", "del", "da", "al", "dei", "della", "con", "gli", "le", "ci", "questo", "io", "se", "anche", "come", "delle", "più", "nel", "alla", "era", "cosa", "loro", "su", "dal", "ti", "dello", "dei"]),
};

const CODE_TO_NAME: Record<string, string> = {
	en: "english",
	es: "spanish",
	pt: "portuguese",
	fr: "french",
	de: "german",
	it: "italian",
	ja: "japanese",
	ko: "korean",
	zh: "chinese",
	ru: "russian",
	ar: "arabic",
	nl: "dutch",
	pl: "polish",
	tr: "turkish",
	uk: "ukrainian",
	sv: "swedish",
	id: "indonesian",
	hi: "hindi",
	vi: "vietnamese",
};

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(Object.entries(CODE_TO_NAME).map(([c, n]) => [n, c]));

export function normalizeLangCode(lang: string | undefined | null): string {
	if (!lang) return "en";
	const clean = lang.trim().toLowerCase();
	if (NAME_TO_CODE[clean]) return NAME_TO_CODE[clean];
	const short = clean.split(/[-_]/)[0];
	return short || "en";
}

export function toApiLang(codeOrName: string | undefined | null): string {
	const code = normalizeLangCode(codeOrName);
	return CODE_TO_NAME[code] || code;
}

export function detectLanguage(text: string | undefined | null, fallbackLang = "en"): string {
	if (!text || !text.trim()) return normalizeLangCode(fallbackLang);

	if (CJK_JA.test(text)) return "ja";
	if (CJK_KO.test(text)) return "ko";
	if (CJK_ZH.test(text)) return "zh";
	if (CYRILLIC.test(text)) return "ru";
	if (ARABIC.test(text)) return "ar";

	// Clean text of URLs, mentions, hashtags, and special symbols
	const clean = text
		.replace(/https?:\/\/\S+/g, "")
		.replace(/@\w+/g, "")
		.replace(/#\w+/g, "")
		.toLowerCase()
		.replace(/[^\p{L}\s]/gu, " ");

	const words = clean.split(/\s+/).filter((w) => w.length > 1);
	if (words.length === 0) return normalizeLangCode(fallbackLang);

	const scores: Record<string, number> = {};
	for (const [lang, stopSet] of Object.entries(STOP_WORDS)) {
		let count = 0;
		for (const w of words) {
			if (stopSet.has(w)) count++;
		}
		scores[lang] = count;
	}

	let bestLang = normalizeLangCode(fallbackLang);
	let bestScore = 0;
	for (const [lang, score] of Object.entries(scores)) {
		if (score > bestScore) {
			bestScore = score;
			bestLang = lang;
		}
	}

	if (bestScore === 0) {
		if (/[áéíóúüñ¿¡]/i.test(text)) return "es";
		if (/[ãõçâêô]/i.test(text)) return "pt";
		if (/[éèêëàâôîïùûçœæ]/i.test(text)) return "fr";
		if (/[äöüß]/i.test(text)) return "de";
		return normalizeLangCode(fallbackLang);
	}

	return bestLang;
}

export function getLanguageDisplayName(code: string, displayLang = "en"): string {
	const norm = normalizeLangCode(code);
	const targetNorm = normalizeLangCode(displayLang);
	try {
		if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
			const dn = new Intl.DisplayNames([targetNorm, "en"], { type: "language" });
			const name = dn.of(norm);
			if (name) return name.charAt(0).toUpperCase() + name.slice(1);
		}
	} catch {}

	const FALLBACK_NAMES: Record<string, Record<string, string>> = {
		es: {
			en: "Inglés",
			es: "Español",
			pt: "Portugués",
			fr: "Francés",
			de: "Alemán",
			it: "Italiano",
			ja: "Japonés",
			ko: "Coreano",
			zh: "Chino",
			ru: "Ruso",
			ar: "Árabe",
		},
		en: {
			en: "English",
			es: "Spanish",
			pt: "Portuguese",
			fr: "French",
			de: "German",
			it: "Italian",
			ja: "Japanese",
			ko: "Korean",
			zh: "Chinese",
			ru: "Russian",
			ar: "Arabic",
		},
	};

	return FALLBACK_NAMES[targetNorm]?.[norm] ?? FALLBACK_NAMES.en[norm] ?? norm.toUpperCase();
}
