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
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/poster/4001.jpg">`);

		// Stats row
		expect(html).toContain("💬 3   🔁 7   ❤️ 42");

		// Redirect to post URL, NOT "/"
		expect(html).toContain(`<meta http-equiv="refresh" content="0;url=${PUBLIC_ORIGIN}/johndoe/status/3001">`);
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
			like_count: 1540,
			repost_count: 230,
			reply_count: 85,
		};

		const res = postPreview(photoPost);
		const html = await res.text();

		expect(html).toContain('<meta property="og:type" content="article">');
		expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/media/4011">`);
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/media/4012">`);
		expect(html).toContain(`<meta property="og:image" content="${PUBLIC_ORIGIN}/embed/media/4013">`);

		// Formatted stats with K suffixes
		expect(html).toContain("💬 85   🔁 230   ❤️ 1.5K");
	});

	test("quote tweet and poll are formatted in embed description", async () => {
		const complexPost: Post = {
			id: "3003",
			text: "What do you think of this idea?",
			created_at: new Date("2026-10-21T12:00:00Z"),
			author: sampleAuthor,
			media: [],
			like_count: 10,
			repost_count: 2,
			reply_count: 1,
			quoted: {
				id: "2999",
				text: "We should build something new today.",
				author: { screen_name: "alice", name: "Alice" },
			},
			poll: {
				choices: ["Yes", "No"],
				counts: [80, 20],
				totalVotes: 100,
				closed: true,
			},
		};

		const res = postPreview(complexPost);
		const html = await res.text();

		// Quote tweet text
		expect(html).toContain("🗨️ Quoting Alice (@alice):");
		expect(html).toContain("We should build something new today.");

		// Poll text
		expect(html).toContain("📊 Poll (Final results):");
		expect(html).toContain("🔘 Yes (80%)");
		expect(html).toContain("🔘 No (20%)");
		expect(html).toContain("100 votes");
	});

	test("profile preview formats bio and follower stats", async () => {
		const res = profilePreview(sampleAuthor);
		const html = await res.text();

		expect(html).toContain("John Doe (@johndoe)");
		expect(html).toContain("Developer &amp; open source enthusiast");
		expect(html).toContain("👥 1.3K Followers   •   Following 340   •   📝 89 Posts");
		expect(html).toContain(`<meta http-equiv="refresh" content="0;url=${PUBLIC_ORIGIN}/johndoe">`);
	});
});
