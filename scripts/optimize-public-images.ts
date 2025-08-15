import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'client', 'public');
const MAX_BYTES = 400 * 1024; // re-encode if larger than 400KB
const MAX_WIDTH = 1600; // cap width to 1600px

function isImage(file: string) {
	const lower = file.toLowerCase();
	return lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg');
}

async function getFiles(dir: string): Promise<string[]> {
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const e of entries) {
		const full = path.join(dir, e.name);
		// skip generated icons and build assets
		if (e.isDirectory()) {
			if (['icons', 'assets', 'js', 'audio', 'attached_assets', 'static'].includes(e.name)) continue;
			files.push(...await getFiles(full));
		} else if (e.isFile() && isImage(full)) {
			files.push(full);
		}
	}
	return files;
}

async function optimizeFile(filePath: string): Promise<boolean> {
	const stat = await fs.promises.stat(filePath);
	if (stat.size <= MAX_BYTES) return false;

	const buf = await fs.promises.readFile(filePath);
	const img = sharp(buf, { limitInputPixels: false });
	const meta = await img.metadata();

	let pipeline = img.clone();
	if ((meta.width || 0) > MAX_WIDTH) {
		pipeline = pipeline.resize({ width: MAX_WIDTH });
	}

	const ext = path.extname(filePath).toLowerCase();
	let out: Buffer;
	if (ext === '.png') {
		// Keep PNG, try palette; if still large, try reducing to 8-bit palette
		out = await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true }).toBuffer();
		if (out.length > stat.size) {
			// if larger due to palette, fallback to higher compression no palette
			out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
		}
	} else {
		// JPEG
		out = await pipeline.jpeg({ quality: 75, mozjpeg: true, progressive: true }).toBuffer();
	}

	if (out.length < stat.size) {
		await fs.promises.writeFile(filePath, out);
		return true;
	}
	return false;
}

async function main() {
	const files = await getFiles(PUBLIC_DIR);
	let optimized = 0;
	let before = 0;
	let after = 0;
	for (const f of files) {
		const s = await fs.promises.stat(f);
		before += s.size;
		const changed = await optimizeFile(f);
		if (changed) optimized++;
		const s2 = await fs.promises.stat(f);
		after += s2.size;
	}
	console.log(JSON.stringify({ scanned: files.length, optimized, bytesBefore: before, bytesAfter: after }));
}

main().catch((e) => { console.error(e); process.exit(1); });