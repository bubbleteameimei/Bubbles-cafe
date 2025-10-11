import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'client', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  await ensureDir(iconsDir);

  // Prefer explicitly provided favicon source, then fall back to known images
  const candidates = ['favicon.png', 'profile.png', 'IMG_5307.png', 'IMG_4848.jpeg'];
  let sourcePath = null;
  for (const c of candidates) {
    const p = path.join(publicDir, c);
    if (fs.existsSync(p)) { sourcePath = p; break; }
  }
  if (!sourcePath) {
    console.error('No suitable source image found in client/public');
    process.exit(1);
  }

  // Generate PWA icons
  for (const size of [192, 512]) {
    const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await sharp(sourcePath)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 85 })
      .toFile(outPath);
    console.log('Generated', outPath);
  }

  // Apple touch icon (180x180)
  {
    const outPath = path.join(iconsDir, 'apple-touch-icon.png');
    await sharp(sourcePath)
      .resize(180, 180, { fit: 'cover' })
      .png({ quality: 90 })
      .toFile(outPath);
    console.log('Generated', outPath);
  }

  // PNG favicons (16x16, 32x32)
  const favicon16Path = path.join(iconsDir, 'favicon-16x16.png');
  const favicon32Path = path.join(iconsDir, 'favicon-32x32.png');
  await sharp(sourcePath).resize(16, 16, { fit: 'cover' }).png({ quality: 100 }).toFile(favicon16Path);
  await sharp(sourcePath).resize(32, 32, { fit: 'cover' }).png({ quality: 100 }).toFile(favicon32Path);
  console.log('Generated', favicon16Path);
  console.log('Generated', favicon32Path);

  // Note: ICO generation removed to avoid pulling deprecated/transitive packages.
  // Modern browsers support PNG favicons; if .ico is required, use a maintained generator in CI.
}

main().catch((e) => { console.error(e); process.exit(1); });