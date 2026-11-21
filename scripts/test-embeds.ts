import { describe, expect, test } from "bun:test";
import { postPreview, profilePreview, postTitle, type Post, type Author } from "../src/embeds";
import { PUBLIC_ORIGIN } from "../src/config";

describe("Rich Embeds (fxTwitter / vxTwitter style)", () => {
	const sampleAuthor: Author = {
		id: "1001",
		screen_name: "johndoe",
		name: "John Doe",
		bio: "Developer & open source enthusiast",
		avatar_url: "/media/2001",
		followers: 1250,
		following: 340,
		posts: 89,
	};

	test("postTitle formats name and screen name", () => {
		expect(postTitle(sampleAuthor)).toBe("John Doe (@johndoe)");
	});

	test("video post preview generates OpenGraph video and Twitter player tags", async () => {
		const videoPost: Post = {
			id: "3001",
			text: "Check out this amazing video!",
			created_at: new Date("2026-10-21T12:00:00Z"),
			author: sampleAuthor,
			media: [
				{
					id: "4001",
					kind: "video",
					mime: "video/mp4",
					width: 1920,
					height: 1080,
					remote: false,
				},
			],
			like_count: 42,
			repost_count: 7,
			reply_count: 3,
		};

		const res = postPreview(videoPost);
		expect(res.status).toBe(200);
		const html = await res.text();

		// Video meta tags
		expect(html).toContain('<meta property="og:type" content="video.other">');
		expect(html).toContain(`<meta property="og:video" content="${PUBLIC_ORIGIN}/embed/video/4001.mp4">`);
		expect(html).toContain('<meta property="og:video:type" content="video/mp4">');
		expect(html).toContain('<meta property="og:video:width" content="1920">');
		expect(html).toContain('<meta property="og:video:height" content="1080">');
		expect(html).toContain('<meta name="twitter:card" content="player">');
		expect(html).toContain(`<meta name="twitter:player" content="${PUBLIC_ORIGIN}/embed/video/4001.mp4">`);
		expect(html).toContain(`<meta name="twitter:player:stream" content="${PUBLIC_ORIGIN}/embed/video/4001.mp4">`);
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/post/3001">`);

		// Redirect to post URL
		expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${PUBLIC_ORIGIN}/johndoe/status/3001">`);
	});

	test("multi-image post preview generates multiple og:image tags for gallery grid", async () => {
		const photoPost: Post = {
			id: "3002",
			text: "Gallery of 3 photos!",
			created_at: new Date("2026-10-21T12:00:00Z"),
			author: sampleAuthor,
			media: [
				{ id: "4011", kind: "photo", mime: "image/jpeg", width: 800, height: 600, remote: false },
				{ id: "4012", kind: "photo", mime: "image/png", width: 1200, height: 800, remote: false },
				{ id: "4013", kind: "photo", mime: "image/webp", width: 1000, height: 1000, remote: false },
			],
			counts: { replies: 85, reposts: 230, likes: 1540, views: 5000 },
		};

		const res = postPreview(photoPost);
		const html = await res.text();

		expect(html).toContain('<meta property="og:type" content="article">');
		expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/post/3002">`);
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/post/3002/1">`);
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/post/3002/2">`);
	});

	test("quote tweet is formatted in embed description", async () => {
		const complexPost: Post = {
			id: "3003",
			text: "What do you think of this idea?",
			created_at: new Date("2026-10-21T12:00:00Z"),
			author: sampleAuthor,
			media: [],
			counts: { replies: 1, reposts: 2, likes: 10, views: 50 },
			quote: {
				id: "2999",
				text: "We should build something new today.",
				author: { id: "1002", screen_name: "alice", name: "Alice", bio: "", avatar_url: null },
				media: [],
			},
		};

		const res = postPreview(complexPost);
		const html = await res.text();

		// Quote tweet text
		expect(html).toContain("Quoting Alice (@alice):");
		expect(html).toContain("We should build something new today.");
	});

	test("profile preview formats bio and meta redirect", async () => {
		const res = profilePreview(sampleAuthor);
		const html = await res.text();

		expect(html).toContain("John Doe (@johndoe)");
		expect(html).toContain("Developer &amp; open source enthusiast");
		expect(html).toContain(`<meta http-equiv="refresh" content="0; url=${PUBLIC_ORIGIN}/johndoe">`);
	});
});
