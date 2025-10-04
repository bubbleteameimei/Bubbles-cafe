// scripts/generate-sitemaps.mjs
// Generate sitemap.xml (index), pages-sitemap.xml, and stories-sitemap.xml into dist/public

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPublicDir = path.resolve(__dirname, '..', 'dist', 'public');

// Config
const SITE_URL = process.env.SITE_URL || 'https://bubblescafe.space';
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://bubbles-cafe.onrender.com';

// Helpers
const fmtDate = (d) => {
  try {
    const iso = new Date(d).toISOString();
    return iso.split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

async function safeFetchJson(url) {
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
    return await res.json();
  } catch (err) {
    console.error('[sitemaps] fetch error:', err.message);
    return null;
  }
}

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function generatePagesSitemap() {
  const today = fmtDate(new Date());
  // Core navigable pages
  const pages = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: '1.0', lastmod: today },
    { loc: `${SITE_URL}/stories`, changefreq: 'daily', priority: '0.9', lastmod: today },
    { loc: `${SITE_URL}/reader`, changefreq: 'daily', priority: '0.8', lastmod: today },
    { loc: `${SITE_URL}/community`, changefreq: 'weekly', priority: '0.7', lastmod: today },
    { loc: `${SITE_URL}/about`, changefreq: 'monthly', priority: '0.5', lastmod: today },
    { loc: `${SITE_URL}/contact`, changefreq: 'monthly', priority: '0.5', lastmod: today },
    { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: '0.3', lastmod: today },
  ];

  const urls = pages.map(
    (p) => `  <url>
    <loc>${escapeXml(p.loc)}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${p.lastmod}</lastmod>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await fs.writeFile(path.join(distPublicDir, 'pages-sitemap.xml'), xml, 'utf8');
  console.log('[sitemaps] wrote pages-sitemap.xml');
}

async function generateStoriesSitemap() {
  const today = fmtDate(new Date());
  const stories = [];

  // Regular posts
  const regular = await safeFetchJson(`${BACKEND_BASE_URL}/api/posts?limit=1000`);
  if (regular?.posts?.length) {
    for (const post of regular.posts) {
      const slug = post?.slug || (post?.id ? `post-${post.id}` : null);
      if (!slug) continue;
      const lastmod = fmtDate(post?.date || post?.createdAt || today);
      stories.push({
        loc: `${SITE_URL}/reader/${encodeURIComponent(slug)}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod,
      });
    }
  }

  // Community posts
  const community = await safeFetchJson(`${BACKEND_BASE_URL}/api/posts/community?limit=1000`);
  if (community?.posts?.length) {
    for (const post of community.posts) {
      const slug = post?.slug || (post?.id ? `post-${post.id}` : null);
      if (!slug) continue;
      const lastmod = fmtDate(post?.date || post?.createdAt || today);
      stories.push({
        loc: `${SITE_URL}/community-story/${encodeURIComponent(slug)}`,
        changefreq: 'weekly',
        priority: '0.6',
        lastmod,
      });
    }
  }

  // Build XML
  const urls = stories.map(
    (s) => `  <url>
    <loc>${escapeXml(s.loc)}</loc>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.priority}</priority>
    <lastmod>${s.lastmod}</lastmod>
  </url>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  await fs.writeFile(path.join(distPublicDir, 'stories-sitemap.xml'), xml, 'utf8');
  console.log('[sitemaps] wrote stories-sitemap.xml');
}

async function generateSitemapIndex() {
  const today = fmtDate(new Date());
  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/pages-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/stories-sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>
`;
  await fs.writeFile(path.join(distPublicDir, 'sitemap.xml'), index, 'utf8');
  console.log('[sitemaps] wrote sitemap.xml (index)');
}

async function main() {
  await ensureDir(distPublicDir);
  await generatePagesSitemap();
  await generateStoriesSitemap();
  await generateSitemapIndex();
}

main().catch((err) => {
  console.error('[sitemaps] generation failed:', err);
  process.exitCode = 1;
});