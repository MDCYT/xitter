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

	test("contains valid JavaScript syntax inside all script tags", () => {
		for (const viewer of [sampleViewer, null]) {
			const html = circusClientHtml({
				viewer,
				instanceName: "Digital Circus",
				origin: "https://x.glitchprod.xyz",
			});

			const matches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
			expect(matches.length).toBeGreaterThan(0);
			for (const match of matches) {
				const scriptContent = match[1];
				expect(() => new Function(scriptContent)).not.toThrow();
			}
		}
	});

	test("includes search filters, modern mode localization, and image error fallbacks", () => {
		const htmlEn = circusClientHtml({
			viewer: { ...sampleViewer, language: "en" },
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
			lang: "en",
		});

		// Search filters radio and checkbox inputs
		expect(htmlEn).toContain('name="search-filter-people"');
		expect(htmlEn).toContain('name="search-filter-location"');
		expect(htmlEn).toContain('id="search-filter-verified"');

		// Modern mode translated in English
		expect(htmlEn).toContain("Modern Mode");
		// "Cliente clásico inspirado en 2016." removed completely
		expect(htmlEn).not.toContain("Cliente clásico inspirado en 2016.");

		// Image onerror fallbacks present
		expect(htmlEn).toContain("onerror=");
		expect(htmlEn).toContain("this.src='/public/icon-dark.png'");
	});

	test("formats large numbers and resolves federated mentions accurately", () => {
		const html = circusClientHtml({
			viewer: sampleViewer,
			instanceName: "Digital Circus",
			origin: "https://x.glitchprod.xyz",
		});
		const match = html.match(/<script>([\s\S]*?)<\/script>/);
		expect(match).toBeTruthy();
		const code = match![1];
		const sandbox: any = {
			window: { location: { hostname: "x.glitchprod.xyz", search: "", pathname: "/" } },
			document: { addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
		};
		const fn = new Function("window", "document", `${code}; return circusApp;`);
		const app = fn(sandbox.window, sandbox.document);

		// Test formatNumber
		expect(app.formatNumber(0)).toBe("0");
		expect(app.formatNumber(42)).toBe("42");
		expect(app.formatNumber(999)).toBe("999");
		expect(app.formatNumber(1000)).toBe("1K");
		expect(app.formatNumber(97764)).toBe("97.8K");
		expect(app.formatNumber(100000)).toBe("100K");
		expect(app.formatNumber(2973464)).toBe("3M");
		expect(app.formatNumber(33193746)).toBe("33.2M");

		// Test federated mentions
		const remotePost = {
			author: { screen_name: "X@xitter.opuadm.com" },
			text: "Hello @discord and @YouTube and @localUser@xitter.space!"
		};
		const formatted = app.formatTweetText(remotePost.text, remotePost);
		expect(formatted).toContain('href="/discord@xitter.opuadm.com"');
		expect(formatted).toContain("circusApp.viewProfile('discord@xitter.opuadm.com')");
		expect(formatted).toContain('href="/YouTube@xitter.opuadm.com"');
		expect(formatted).toContain('href="/localUser@xitter.space"');

		// Local post mentions
		const localPost = {
			author: { screen_name: "pomni" },
			text: "Hello @discord!"
		};
		const localFormatted = app.formatTweetText(localPost.text, localPost);
		expect(localFormatted).toContain('href="/discord"');
		expect(localFormatted).toContain("circusApp.viewProfile('discord')");

		// Replies and source indicator
		const replyPost = {
			id: "12345",
			author: { screen_name: "ragatha", name: "Ragatha" },
			text: "Replying to you!",
			created_at: new Date().toISOString(),
			reply_to: "999",
			reply_to_screen_name: "pomni",
			source: "Digital Circus for Wacky Watch"
		};
		const cardHtml = app.renderTweetCard(replyPost);
		expect(cardHtml).toContain("tweet-reply-context");
		expect(cardHtml).toContain("@pomni");
		expect(cardHtml).toContain("tweet-source");
		expect(cardHtml).toContain("Digital Circus for Wacky Watch");
	});
});
