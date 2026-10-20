import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { sql } from "../src/db";
import { isS3Enabled, uploadToS3 } from "../src/storage";
import { MEDIA_DIR } from "../src/media";
import { posterFile } from "../src/video";

if (!isS3Enabled()) {
	console.error("S3 is not enabled. Please check S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY.");
	process.exit(1);
}

const EXT: Record<string, string> = {
	"image/png": "png",
	"image/gif": "gif",
	"image/webp": "webp",
	"image/jpeg": "jpg",
	"video/mp4": "mp4",
};

console.log(`Starting media migration to S3 from ${MEDIA_DIR}...`);

const mediaRows = await sql`select id::text, mime, kind, size from media where remote_instance is null order by id asc`;
console.log(`Found ${mediaRows.length} local media records in database.`);

let uploadedCount = 0;
let bytesTotal = 0;
let errorCount = 0;

for (const row of mediaRows) {
	const id = row.id;
	const localFile = join(MEDIA_DIR, id);
	const mime = row.mime || "application/octet-stream";
	const ext = EXT[mime] || "bin";

	if (existsSync(localFile)) {
		try {
			const data = Bun.file(localFile);
			const size = statSync(localFile).size;
			const ok1 = await uploadToS3(id, data, mime);
			const ok2 = await uploadToS3(`${id}.${ext}`, data, mime);
			if (ok1 && ok2) {
				uploadedCount++;
				bytesTotal += size;
				console.log(`[Media] Uploaded ${id} (${(size / 1024).toFixed(1)} KB, ${mime})`);
			} else {
				errorCount++;
				console.error(`[Media] Failed to upload ${id}`);
			}
		} catch (err) {
			errorCount++;
			console.error(`[Media] Error uploading ${id}:`, err);
		}
	}

	if (row.kind === "video") {
		const pFile = posterFile(MEDIA_DIR, id);
		if (existsSync(pFile)) {
			try {
				const pData = Bun.file(pFile);
				const pSize = statSync(pFile).size;
				const ok = await uploadToS3(`${id}.poster.jpg`, pData, "image/jpeg");
				if (ok) {
					uploadedCount++;
					bytesTotal += pSize;
					console.log(`[Poster] Uploaded ${id}.poster.jpg (${(pSize / 1024).toFixed(1)} KB)`);
				} else {
					errorCount++;
					console.error(`[Poster] Failed to upload ${id}.poster.jpg`);
				}
			} catch (err) {
				errorCount++;
				console.error(`[Poster] Error uploading ${id}.poster.jpg:`, err);
			}
		}
	}
}

// Check other files in MEDIA_DIR
if (existsSync(MEDIA_DIR)) {
	const files = readdirSync(MEDIA_DIR);
	for (const f of files) {
		if (/^\d{1,19}$/.test(f)) {
			// already processed or extra
			const full = join(MEDIA_DIR, f);
			if (statSync(full).isFile()) {
				const already = mediaRows.some((r: any) => r.id === f);
				if (!already) {
					try {
						const size = statSync(full).size;
						await uploadToS3(f, Bun.file(full));
						uploadedCount++;
						bytesTotal += size;
						console.log(`[Extra] Uploaded ${f} (${(size / 1024).toFixed(1)} KB)`);
					} catch (e) {
						console.error(`[Extra] Error uploading ${f}:`, e);
					}
				}
			}
		} else if (/^\d{1,19}\.poster\.jpg$/.test(f)) {
			const id = f.replace(/\.poster\.jpg$/, "");
			const already = mediaRows.some((r: any) => r.id === id);
			if (!already) {
				const full = join(MEDIA_DIR, f);
				try {
					const size = statSync(full).size;
					await uploadToS3(f, Bun.file(full), "image/jpeg");
					uploadedCount++;
					bytesTotal += size;
					console.log(`[Extra Poster] Uploaded ${f} (${(size / 1024).toFixed(1)} KB)`);
				} catch (e) {
					console.error(`[Extra Poster] Error uploading ${f}:`, e);
				}
			}
		}
	}
}

// Chat uploads
try {
	const chatRows = await sql`select hash, total_bytes from chat_uploads where ready = true`;
	console.log(`Found ${chatRows.length} sealed chat uploads in database.`);
	for (const c of chatRows) {
		const sealedFile = join(MEDIA_DIR, "chat", c.hash, "sealed");
		if (existsSync(sealedFile)) {
			try {
				const size = statSync(sealedFile).size;
				await uploadToS3(`chat/${c.hash}`, Bun.file(sealedFile), "application/octet-stream");
				uploadedCount++;
				bytesTotal += size;
				console.log(`[Chat] Uploaded chat/${c.hash} (${(size / 1024).toFixed(1)} KB)`);
			} catch (e) {
				console.error(`[Chat] Error uploading chat/${c.hash}:`, e);
			}
		}
	}
} catch (err) {
	console.log("No chat_uploads table or error reading it:", err);
}

console.log("\n--- Migration Complete ---");
console.log(`Total items uploaded: ${uploadedCount}`);
console.log(`Total data transferred: ${(bytesTotal / (1024 * 1024)).toFixed(2)} MB`);
console.log(`Errors encountered: ${errorCount}`);
process.exit(0);
