import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function findSourceImage() {
  // Search in both client/public and project-level public to honor where the user placed the file
  const candidateDirs = [
    path.resolve(process.cwd(), 'client', 'public'),
    path.resolve(process.cwd(), 'public'),
  ];
  const candidates = ['favicon.png', 'profile.png', 'IMG_5307.png', 'IMG_4848.jpeg'];
  for (const dir of candidateDirs) {
    for (const c of candidates) {
      const p = path.join(dir, c);
      try {
        if (fs.existsSync(p)) return { sourcePath: p, sourceDir: dir };
      } catch {}
    }
  }
  return null;
}

async function main() {
  const clientPublicDir = path.resolve(process.cwd(), 'client', 'public');
  const distPublicDir = path.resolve(process.cwd(), 'dist', 'public');
  const outputDirs = [clientPublicDir];
  try { if (fs.existsSync(distPublicDir)) outputDirs.push(distPublicDir); } catch {}

  // Ensure icons subdir exists in each output dir
  for (const dir of outputDirs) {
    await ensureDir(path.join(dir, 'icons'));
  }

  const found = await findSourceImage();
  if (!found) {
    console.warn('[icons] No suitable source image found in client/public or public – skipping icon and OG generation.');
    return;
  }
  const { sourcePath } = found;

  // Generate PWA icons (192, 512), Apple touch (180), favicons (16, 32) into each output dir
  for (const dir of outputDirs) {
    const iconsDir = path.join(dir, 'icons');

    for (const size of [192, 512]) {
      const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(sourcePath)
        .resize(size, size, { fit: 'cover' })
        .png({ quality: 85 })
        .toFile(outPath);
      console.log('Generated', outPath);
    }

    {
      const outPath = path.join(iconsDir, 'apple-touch-icon.png');
      await sharp(sourcePath)
        .resize(180, 180, { fit: 'cover' })
        .png({ quality: 90 })
        .toFile(outPath);
      console.log('Generated', outPath);
    }

    const favicon16Path = path.join(iconsDir, 'favicon-16x16.png');
    const favicon32Path = path.join(iconsDir, 'favicon-32x32.png');
    await sharp(sourcePath).resize(16, 16, { fit: 'cover' }).png({ quality: 100 }).toFile(favicon16Path);
    await sharp(sourcePath).resize(32, 32, { fit: 'cover' }).png({ quality: 100 }).toFile(favicon32Path);
    console.log('Generated', favicon16Path);
    console.log('Generated', favicon32Path);

    // Open Graph / Twitter share image (1200x630) placed at the root of each output dir
    const ogOutPath = path.join(dir, 'og-image-1200x630.png');
    await sharp(sourcePath)
      .resize(1200, 630, { fit: 'cover', position: 'entropy' })
      .png({ quality: 90 })
      .toFile(ogOutPath);
    console.log('Generated', ogOutPath);
  }

  // Note: ICO generation removed to avoid pulling deprecated/transitive packages.
  // Modern browsers support PNG favicons; if .ico is required, use a maintained generator in CI.
}

main().catch((e) => { console.error(e); process.exit(1); });