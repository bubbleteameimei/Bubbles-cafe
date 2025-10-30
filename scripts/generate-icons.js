import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function circleMaskSvg(size) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
    </svg>`
  );
}

function resolveStrictFavicon() {
  // STRICT: require client/public/favicon.png only (no fallbacks)
  const p = path.resolve(process.cwd(), 'client', 'public', 'favicon.png');
  try {
    if (fs.existsSync(p)) {
      return p;
    }
  } catch {}
  return null;
}

async function generateRoundedPng(sourcePath, size, outPath) {
  const mask = circleMaskSvg(size);
  await sharp(sourcePath)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }]) // apply circular alpha mask
    .png({ quality: 95 })
    .toFile(outPath);
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

  const sourcePath = resolveStrictFavicon();
  if (!sourcePath) {
    console.error('[icons] favicon.png not found at client/public/favicon.png. Please add the correct image and rerun.');
    return;
  }
  console.log(`[icons] Using source image: ${sourcePath}`);

  // Generate icons with rounded (circular) shape and OG image (rectangular)
  for (const dir of outputDirs) {
    const iconsDir = path.join(dir, 'icons');

    // PWA icons (rounded)
    for (const size of [192, 512]) {
      const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await generateRoundedPng(sourcePath, size, outPath);
      console.log('Generated', outPath);
    }

    // Apple touch icon (rounded)
    {
      const outPath = path.join(iconsDir, 'apple-touch-icon.png');
      await generateRoundedPng(sourcePath, 180, outPath);
      console.log('Generated', outPath);
    }

    // Favicons (rounded)
    const favicon16Path = path.join(iconsDir, 'favicon-16x16.png');
    const favicon32Path = path.join(iconsDir, 'favicon-32x32.png');
    await generateRoundedPng(sourcePath, 16, favicon16Path);
    await generateRoundedPng(sourcePath, 32, favicon32Path);
    console.log('Generated', favicon16Path);
    console.log('Generated', favicon32Path);

    // Open Graph / Twitter share image (rectangle, not rounded)
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