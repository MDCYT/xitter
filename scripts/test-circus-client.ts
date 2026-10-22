import { describe, expect, test } from "bun:test";
import { circusClientHtml } from "../src/circus-client";

describe("Circus 2016 Custom Client", () => {
	const sampleViewer: any = {
		id: "1001",
		screen_name: "pomni",
		name: "Pomni",
		avatar_url: "/media/9999",
		bio: "Perdida en el circo digital pero lista para twittear.",
		verified_type: null,
	};

	test("generates complete HTML with Bootstrap 3 and Circus branding", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		expect(html).toContain("<!DOCTYPE html>");
		expect(html).toContain("bootstrap.min.css");
		expect(html).toContain("Digital Circus - Inicio");
		expect(html).toContain("circus-tent-svg");
		expect(html).toContain("Twittear");
		expect(html).toContain("window.__VIEWER__ = {");
		expect(html).toContain('"screen_name":"pomni"');
		expect(html).toContain('"name":"Pomni"');
	});

	test("handles guest / logged-out user gracefully", () => {
		const html = circusClientHtml({
			viewer: null,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		expect(html).toContain("window.__VIEWER__ = null");
		expect(html).toContain("Iniciar sesión");
	});

	test("adheres strictly to human writing (no AI cliches)", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		// Check for forbidden AI slop cliches
		const forbidden = [
			"tapestry",
			"delve",
			"testament to",
			"beacon of",
			"embark on",
			"vibrant",
			"it is important to note",
			"it's worth noting",
			"adéntrate",
			"tapiz",
			"testimonio de",
		];

		for (const word of forbidden) {
			expect(html.toLowerCase()).not.toContain(word);
		}
	});
});
