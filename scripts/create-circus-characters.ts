import { sql } from "../src/db";
import { newId } from "../src/ids";
import fs from "fs";
import path from "path";

const LABEL_ID = "2111889248255737856"; // Circus Member
const PASSWORD = "JO123ant";
const MEDIA_DIR = process.env.MEDIA_DIR ?? "media";

const CHARACTERS = [
	{
		screenName: "Ragatha",
		name: "Ragatha",
		email: "ragatha+x@femboy.cyou",
		flag: "lesbian",
		bio: "Trying my best to stay positive and keep everyone together! 🎪❤️",
		avatarFile: "/tmp/tadc_media/ragatha.jpg",
		bannerFile: "/tmp/tadc_media/ragatha_banner.jpg",
	},
	{
		screenName: "Gangle",
		name: "Gangle",
		email: "gangle+x@femboy.cyou",
		flag: "asexual",
		bio: "My comedy mask keeps breaking... but I'm doing my best! 🎭",
		avatarFile: "/tmp/tadc_media/gangle.jpg",
		bannerFile: "/tmp/tadc_media/gangle_banner.jpg",
	},
	{
		screenName: "Kinger",
		name: "Kinger",
		email: "kinger+x@femboy.cyou",
		flag: null,
		bio: "DID SOMEONE SAY AN INSECT COLLECTION?! ♟️👑",
		avatarFile: "/tmp/tadc_media/kinger.jpg",
		bannerFile: "/tmp/tadc_media/kinger_banner.jpg",
	},
	{
		screenName: "Zooble",
		name: "Zooble",
		email: "zooble+x@femboy.cyou",
		flag: "nonbinary",
		bio: "Don't look at me, don't talk to me, and don't make me go on Caine's adventures.",
		avatarFile: "/tmp/tadc_media/zooble.jpg",
		bannerFile: "/tmp/tadc_media/zooble_banner.jpg",
	},
];

async function main() {
	console.log("Hashing password...");
	const passwordHash = await Bun.password.hash(PASSWORD);
	console.log("Password hash generated.");

	fs.mkdirSync(MEDIA_DIR, { recursive: true });

	const createdUserIds: string[] = [];

	for (const char of CHARACTERS) {
		console.log(`\nCreating character @${char.screenName}...`);

		// Check if already exists
		const [existing] = await sql`SELECT id::text FROM users WHERE lower(screen_name) = lower(${char.screenName})`;
		if (existing) {
			console.log(`@${char.screenName} already exists (ID: ${existing.id}).`);
			createdUserIds.push(existing.id);
			continue;
		}

		const userId = newId();
		const avatarMediaId = newId();
		const bannerMediaId = newId();

		// Read and copy avatar
		const avatarBuf = fs.readFileSync(char.avatarFile);
		const avatarDest = path.join(MEDIA_DIR, avatarMediaId);
		fs.writeFileSync(avatarDest, avatarBuf);

		// Read and copy banner
		const bannerBuf = fs.readFileSync(char.bannerFile);
		const bannerDest = path.join(MEDIA_DIR, bannerMediaId);
		fs.writeFileSync(bannerDest, bannerBuf);

		// Insert user first (so media foreign key succeeds)
		await sql`
			INSERT INTO users (
				id, screen_name, name, email, password_hash, flag, bio,
				avatar_url, banner_url, verified_type, label_id, email_verified,
				role, protected, count_overrides
			) VALUES (
				${userId}::bigint, ${char.screenName}, ${char.name}, ${char.email}, ${passwordHash},
				${char.flag}, ${char.bio},
				${`/media/${avatarMediaId}`}, ${`/media/banner/${bannerMediaId}`},
				'blue', ${LABEL_ID}::bigint, true,
				null, false, '{}'::jsonb
			)
		`;

		// Insert avatar media record
		await sql`
			INSERT INTO media (id, user_id, kind, mime, size, width, height, state)
			VALUES (${avatarMediaId}::bigint, ${userId}::bigint, 'photo', 'image/jpeg', ${avatarBuf.length}, 400, 400, 'ready')
		`;

		// Insert banner media record
		await sql`
			INSERT INTO media (id, user_id, kind, mime, size, width, height, state)
			VALUES (${bannerMediaId}::bigint, ${userId}::bigint, 'photo', 'image/jpeg', ${bannerBuf.length}, 750, 250, 'ready')
		`;

		// Initialize user_stats row
		await sql`
			INSERT INTO user_stats (user_id, posts, articles, media_posts, likes, highlights, followers, following)
			VALUES (${userId}::bigint, 0, 0, 0, 0, 0, 0, 0)
			ON CONFLICT (user_id) DO NOTHING
		`;

		createdUserIds.push(userId);
		console.log(`Created @${char.screenName} (ID: ${userId})`);
	}

	// Now set up follows
	console.log("\nSetting up follows graph...");
	// Get all circus character IDs (Pomni, Jax, Caine, Staff, and the 4 new ones)
	const allCircusUsers = await sql`
		SELECT id::text, screen_name FROM users
		WHERE lower(screen_name) IN ('pomni', 'jax', 'caine', 'staff', 'ragatha', 'gangle', 'kinger', 'zooble')
	`;

	const userMap = new Map<string, string>();
	for (const u of allCircusUsers) {
		userMap.set(u.screen_name.toLowerCase(), u.id);
	}

	const circusNames = ["pomni", "jax", "caine", "ragatha", "gangle", "kinger", "zooble"];

	// All circus members follow Staff
	const staffId = userMap.get("staff");
	if (staffId) {
		for (const name of circusNames) {
			const id = userMap.get(name);
			if (id) {
				await sql`
					INSERT INTO follows (follower_id, followee_id)
					VALUES (${id}::bigint, ${staffId}::bigint)
					ON CONFLICT DO NOTHING
				`;
			}
		}
	}

	// Mutual follows between all circus members
	for (const a of circusNames) {
		const aId = userMap.get(a);
		if (!aId) continue;
		for (const b of circusNames) {
			if (a === b) continue;
			const bId = userMap.get(b);
			if (!bId) continue;
			await sql`
				INSERT INTO follows (follower_id, followee_id)
				VALUES (${aId}::bigint, ${bId}::bigint)
				ON CONFLICT DO NOTHING
			`;
		}
	}

	console.log("Follows established among all circus characters.");
	console.log("\nAll characters created successfully!");
	process.exit(0);
}

main().catch((err) => {
	console.error("Fatal error creating characters:", err);
	process.exit(1);
});
