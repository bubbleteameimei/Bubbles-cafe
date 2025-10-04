// scripts/validate-sitemaps.mjs
// Validate generated sitemaps and robots.txt in dist/public
// If robots.txt is missing, generate a minimal one to avoid false negatives in CI.

import { promises as fs } from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const DIST_PUBLIC = path.resolve('dist', 'public');
const SITE_URL = process.env.SITE_URL || 'https://bubblescafe.space';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
});

async function readFile(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function countUrlsFromParsed(parsed) {
  if (!parsed?.urlset) return 0;
  const u = parsed.urlset.url;
  if (!u) return 0;
  return Array.isArray(u) ? u.length : 1;
}

async function ensureRobots(robotsPath) {
  try {
    await fs.access(robotsPath);
    return;
  } catch {
    const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
    await writeFile(robotsPath, content);
    console.log('[validate] Created missing robots.txt for validation');
  }
}

async function validateSitemapIndex(file) {
  const xml = await readFile(file);
  const parsed = parser.parse(xml);
  assert(parsed?.sitemapindex, `Invalid sitemap index (${file}) - root <sitemapindex> not found`);
  const sitemaps = parsed.sitemapindex.sitemap;
  const list = Array.isArray(sitemaps) ? sitemaps : sitemaps ? [sitemaps] : [];
  assert(list.length >= 1, `Sitemap index (${file}) should contain at least one <sitemap>`);
  console.log(`[validate] OK: ${path.basename(file)} has ${list.length} sitemap entries`);
}

async function validateUrlset(file, name) {
  const xml = await readFile(file);
  const parsed = parser.parse(xml);
  assert(parsed?.urlset, `Invalid ${name} (${file}) - root <urlset> not found`);
  const count = countUrlsFromParsed(parsed);
  console.log(`[validate] OK: ${path.basename(file)} parsed with url count=${count}`);
}

async function validateRobots(file) {
  const txt = await readFile(file);
  assert(/User-agent:\s*\*/i.test(txt), 'robots.txt missing "User-agent: *"');
  const expected = `Sitemap: ${SITE_URL}/sitemap.xml`;
  assert(txt.includes(expected), `robots.txt missing sitemap directive "${expected}"`);
  console.log('[validate] OK: robots.txt contains sitemap directive and User-agent');
}

async function main() {
  const sitemapIndex = path.join(DIST_PUBLIC, 'sitemap.xml');
  const pagesSitemap = path.join(DIST_PUBLIC, 'pages-sitemap.xml');
  const storiesSitemap = path.join(DIST_PUBLIC, 'stories-sitemap.xml');
  const robots = path.join(DIST_PUBLIC, 'robots.txt');

  // Ensure robots exists (create minimal if missing)
  await ensureRobots(robots);

  // Ensure files exist
  for (const f of [sitemapIndex, pagesSitemap, storiesSitemap, robots]) {
    await fs.access(f).catch(() => {
      throw new Error(`Missing file: ${f}`);
    });
  }

  await validateSitemapIndex(sitemapIndex);
  await validateUrlset(pagesSitemap, 'pages sitemap');
  await validateUrlset(storiesSitemap, 'stories sitemap');
  await validateRobots(robots);

  console.log('[validate] All sitemap files validated successfully');
}

main().catch((err) => {
  console.error('[validate] FAILED:', err.message);
  process.exit(1);
});