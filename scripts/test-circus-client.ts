import { describe, expect, test } from "bun:test";
import { circusClientHtml } from "../src/circus-client";

describe("Circus 2016 Custom Client", () => {
	const sampleViewer: any = {
		id: "1001",
		screen_name: "pomni",
		name: "Pomni",
		avatar_url: "/media/9999",
		banner_url: "/media/banner/8888",
		bio: "Perdida en el circo digital pero lista para twittear.",
		verified_type: "business",
		role: "admin",
		translator: "translator",
		badges: [{ id: "42", name: "Star" }],
		language: "es",
		csrf: "fake-csrf-token",
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
		expect(html).toContain("navbar-instance-logo");
		expect(html).toContain("Twittear");
		expect(html).toContain("window.__VIEWER__ = {");
		expect(html).toContain('"screen_name":"pomni"');
		expect(html).toContain('"name":"Pomni"');
		expect(html).toContain('"banner_url":"/media/banner/8888"');
	});

	test("includes dedicated search view, explore cards, and composer tools", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		expect(html).toContain('id="search-view"');
		expect(html).toContain('id="search-subtab-top"');
		expect(html).toContain('id="search-subtab-latest"');
		expect(html).toContain('id="search-subtab-people"');
		expect(html).toContain('id="search-subtab-media"');
		expect(html).toContain('id="explore-cards-module"');
		expect(html).toContain('id="composer-sticker-picker"');
		expect(html).toContain('id="composer-emoji-picker"');
	});

	test("includes authentic 2016 Twitter profile layout and canopy elements", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		expect(html).toContain('id="profile-view"');
		expect(html).toContain('class="profile-canopy"');
		expect(html).toContain('class="profile-nav-bar"');
		expect(html).toContain('class="profile-avatar-large"');
		expect(html).toContain('id="profile-tab-posts"');
		expect(html).toContain('id="profile-tab-with-replies"');
	});

	test("includes settings modal with API, import, and language options", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});

		expect(html).toContain('id="settings-modal"');
		expect(html).toContain('id="settings-language-select"');
		expect(html).toContain('href="/account/api"');
		expect(html).toContain('href="/account/import"');
		expect(html).toContain('href="/admin"');
		expect(html).toContain('id="user-nav-dropdown"');
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
