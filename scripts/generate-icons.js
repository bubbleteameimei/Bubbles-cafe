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

function resolveStrictFaviconPath() {
  // Prefer client/public/favicon.png if present
  const p = path.resolve(process.cwd(), 'client', 'public', 'favicon.png');
  try {
    if (fs.existsSync(p)) {
      return p;
    }
  } catch {}
  return null;
}

function buildMonogramSvg(size, {
  bg = '#0a0a0a',
  fg = '#ffffff',
  glyph = 'B',
  fontWeight = 800
} = {}) {
  const fontSize = Math.round(size * 0.62);
  // Center text vertically a bit below midline for optical balance
  const y = Math.round(size * 0.70);
  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#111111"/>
        <stop offset="100%" stop-color="#1a1a1a"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="${bg === 'gradient' ? 'url(#g)' : bg}"/>
    <text x="50%" y="${y}" fill="${fg}" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif"
      font-size="${fontSize}" font-weight="${fontWeight}" text-anchor="middle">${glyph}</text>
  </svg>`;
  return Buffer.from(svg);
}

function buildOgSvg(width = 1200, height = 630, {
  bg1 = '#0a0a0a',
  bg2 = '#141414',
  title = "Bubble’s Cafe",
  subtitle = "Dark • Psychological • Experimental Fiction",
  fg = '#ffffff'
} = {}) {
  const titleSize = 96;
  const subtitleSize = 36;
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    <text x="50%" y="${Math.round(height * 0.48)}" fill="${fg}" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif"
      font-size="${titleSize}" font-weight="800" text-anchor="middle">${title}</text>
    <text x="50%" y="${Math.round(height * 0.60)}" fill="rgba(255,255,255,0.85)" font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, sans-serif"
      font-size="${subtitleSize}" font-weight="500" text-anchor="middle">${subtitle}</text>
  </svg>`;
  return Buffer.from(svg);
}

async function generateRoundedPngFromBuffer(sourceBuffer, size, outPath) {
  const mask = circleMaskSvg(size);
  await sharp(sourceBuffer)
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

  const sourcePath = resolveStrictFaviconPath();
  let sourceBuffer;
  if (sourcePath) {
    console.log(`[icons] Using source image: ${sourcePath}`);
    sourceBuffer = await fs.promises.readFile(sourcePath);
  } else {
    console.warn('[icons] favicon.png not found at client/public/favicon.png — generating high-contrast monogram icons.');
    sourceBuffer = buildMonogramSvg(1024, { bg: 'gradient', fg: '#ffffff', glyph: 'B' });
  }

  // Generate icons and OG image
  for (const dir of outputDirs) {
    const iconsDir = path.join(dir, 'icons');

    // PWA icons (rounded)
    for (const size of [192, 512]) {
      const outPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await generateRoundedPngFromBuffer(sourceBuffer, size, outPath);
      console.log('Generated', outPath);
    }

    // Apple touch icon (rounded)
    {
      const outPath = path.join(iconsDir, 'apple-touch-icon.png');
      await generateRoundedPngFromBuffer(sourceBuffer, 180, outPath);
      console.log('Generated', outPath);
    }

    // Favicons (rounded)
    const favicon16Path = path.join(iconsDir, 'favicon-16x16.png');
    const favicon32Path = path.join(iconsDir, 'favicon-32x32.png');
    await generateRoundedPngFromBuffer(sourceBuffer, 16, favicon16Path);
    await generateRoundedPngFromBuffer(sourceBuffer, 32, favicon32Path);
    console.log('Generated', favicon16Path);
    console.log('Generated', favicon32Path);

    // Open Graph / Twitter share image
    const ogOutPath = path.join(dir, 'og-image-1200x630.png');
    if (sourcePath) {
      // Use provided artwork and fit to social size
      await sharp(sourceBuffer)
        .resize(1200, 630, { fit: 'cover', position: 'entropy' })
        .png({ quality: 92 })
        .toFile(ogOutPath);
    } else {
      // Generate a readable text-based OG image for maximum legibility
      const ogSvg = buildOgSvg(1200, 630, {});
      await sharp(ogSvg)
        .png({ quality: 92 })
        .toFile(ogOutPath);
    }
    console.log('Generated', ogOutPath);
  }

  // Note: ICO generation removed to avoid pulling deprecated/transitive packages.
  // Modern browsers support PNG favicons; if .ico is required, use a maintained generator in CI.
}

main().catch((e) => { console.error(e); process.exit(1); });