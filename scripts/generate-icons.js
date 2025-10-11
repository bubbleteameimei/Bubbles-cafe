import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function generatePngBuffer(sourcePath, size) {
  return await sharp(sourcePath)
    .resize(size, size, { fit: 'cover' })
    .png({ quality: 90 })
    .toBuffer();
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

  // ICO favicon (16 + 32)
  try {
    const toIcoMod = await import('to-ico');
    const toIco = toIcoMod.default ?? toIcoMod;
    const buf16 = await generatePngBuffer(sourcePath, 16);
    const buf32 = await generatePngBuffer(sourcePath, 32);
    const icoBuf = await toIco([buf16, buf32]);
    const icoPath = path.join(publicDir, 'favicon.ico');
    await fs.promises.writeFile(icoPath, icoBuf);
    console.log('Generated', icoPath);
  } catch (e) {
    console.error('Failed to generate favicon.ico, ensure "to-ico" is installed:', e?.message ?? e);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });