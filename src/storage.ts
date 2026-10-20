// S3 / Cloudflare R2 object storage integration.
// Supports saving, streaming, and checking media in S3-compatible buckets.

import { S3Client, type S3File } from "bun";

const S3_ENDPOINT = process.env.S3_ENDPOINT;
const S3_BUCKET = process.env.S3_BUCKET;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
export const CDN_URL = process.env.CDN_URL?.replace(/\/+$/, "") || "";

export const isS3Enabled = (): boolean =>
	Boolean(S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_ENDPOINT);

let client: S3Client | null = null;

export function getS3Client(): S3Client | null {
	if (!isS3Enabled()) return null;
	if (!client) {
		client = new S3Client({
			endpoint: S3_ENDPOINT!,
			bucket: S3_BUCKET!,
			accessKeyId: S3_ACCESS_KEY_ID!,
			secretAccessKey: S3_SECRET_ACCESS_KEY!,
			region: "auto",
		});
	}
	return client;
}

export function getS3File(key: string): S3File | null {
	const c = getS3Client();
	return c ? c.file(key) : null;
}

export async function uploadToS3(
	key: string,
	data: Uint8Array | Buffer | Blob | string,
	mime?: string
): Promise<boolean> {
	const c = getS3Client();
	if (!c) return false;
	try {
		const opts: { type?: string } = {};
		if (mime) opts.type = mime;
		await c.write(key, data, opts);
		return true;
	} catch (err) {
		console.error(`S3 upload error for ${key}:`, err);
		return false;
	}
}

export async function deleteFromS3(key: string): Promise<boolean> {
	const c = getS3Client();
	if (!c) return false;
	try {
		await c.delete(key);
		return true;
	} catch (err) {
		console.error(`S3 delete error for ${key}:`, err);
		return false;
	}
}

export async function existsInS3(key: string): Promise<boolean> {
	const c = getS3Client();
	if (!c) return false;
	try {
		return await c.file(key).exists();
	} catch {
		return false;
	}
}

export async function getFromS3(key: string): Promise<Uint8Array | null> {
	const c = getS3Client();
	if (!c) return null;
	try {
		const f = c.file(key);
		if (!(await f.exists())) return null;
		return new Uint8Array(await f.arrayBuffer());
	} catch {
		return null;
	}
}
