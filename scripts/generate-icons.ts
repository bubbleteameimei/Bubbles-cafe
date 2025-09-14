import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir: string) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generatePlaceholderIcon(outPath: string, size: number) {
  // Generate a simple placeholder icon if no source image is available
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6EE7F9"/>
          <stop offset="100%" stop-color="#A78BFA"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="url(#g)"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
            font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
            font-size="${Math.round(size * 0.26)}" fill="white">BC</text>
    </svg>`;
  const svgBuffer = Buffer.from(svg);
  await sharp(svgBuffer).png({ quality: 90 }).toFile(outPath);
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'client', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  await ensureDir(iconsDir);

  // Pick a source image that exists in public
  const candidates = ['profile.png', 'IMG_5307.png', 'IMG_4848.jpeg', 'logo.png', 'logo.jpg'];
  let sourcePath: string | null = null;
  for (const c of candidates) {
    const p = path.join(publicDir, c);
    if (fs.existsSync(p)) { sourcePath = p; break; }
  }

  const sizes = [192, 512];
  for (const size of sizes) {
    const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    if (sourcePath) {
      await sharp(sourcePath)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 80 })
        .toFile(outPath);
    } else {
      // Fallback to placeholder icon generation
      await generatePlaceholderIcon(outPath, size);
    }
    console.log('Generated', outPath);
  }
}

main().catch((e) => { console.error(e); process.exit(0); });