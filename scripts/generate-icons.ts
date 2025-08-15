import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir: string) {
	await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
	const publicDir = path.resolve(process.cwd(), 'client', 'public');
	const iconsDir = path.join(publicDir, 'icons');
	await ensureDir(iconsDir);

	// Pick a source image that exists in public
	const candidates = ['profile.png', 'IMG_5307.png', 'IMG_4848.jpeg'];
	let sourcePath: string | null = null;
	for (const c of candidates) {
		const p = path.join(publicDir, c);
		if (fs.existsSync(p)) { sourcePath = p; break; }
	}
	if (!sourcePath) {
		console.error('No suitable source image found in client/public');
		process.exit(1);
	}

	const sizes = [192, 512];
	for (const size of sizes) {
		const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
		await sharp(sourcePath)
			.resize(size, size, { fit: 'cover' })
			.png({ quality: 80 })
			.toFile(outPath);
		console.log('Generated', outPath);
	}
}

main().catch((e) => { console.error(e); process.exit(1); });