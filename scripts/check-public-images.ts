import path from 'path';
import fs from 'fs';

const PUBLIC_DIR = path.resolve(process.cwd(), 'client', 'public');
const MAX_SINGLE = 2 * 1024 * 1024; // 2MB per image
const MAX_TOTAL = 12 * 1024 * 1024; // 12MB total budget

function isImage(file: string) {
	const f = file.toLowerCase();
	return f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp') || f.endsWith('.avif');
}

async function getFiles(dir: string): Promise<string[]> {
	const entries = await fs.promises.readdir(dir, { withFileTypes: true });
	const files: string[] = [];
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (['icons', 'assets', 'js', 'audio', 'attached_assets', 'static'].includes(e.name)) continue;
			files.push(...await getFiles(full));
		} else if (e.isFile() && isImage(full)) {
			files.push(full);
		}
	}
	return files;
}

async function main() {
	const files = await getFiles(PUBLIC_DIR);
	let total = 0;
	let violations: { file: string; size: number }[] = [];
	for (const f of files) {
		const s = await fs.promises.stat(f);
		total += s.size;
		if (s.size > MAX_SINGLE) {
			violations.push({ file: f.replace(PUBLIC_DIR + path.sep, ''), size: s.size });
		}
	}
	if (total > MAX_TOTAL) {
		console.error(`Total public image size ${total} exceeds budget ${MAX_TOTAL}`);
	}
	if (violations.length || total > MAX_TOTAL) {
		console.error(JSON.stringify({ total, violations }, null, 2));
		process.exit(1);
	}
	console.log(JSON.stringify({ total, violations: [] }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });