import { Request, Response } from 'express';

const ICON_VERSION = 'v=3';
const OG_VERSIONED = 'https://bubblescafe.space/og-image-1200x630.png?v=5';

export function ssrStreamHandler(req: Request, res: Response) {
  if (process.env.ENABLE_SSR !== 'true') {
    res.status(404).end('SSR disabled');
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  // Include favicon and social preview meta for SSR path as well
  res.write(`<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>Bubble’s Cafe - Dark, Psychological and Gothic Fiction</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png?${ICON_VERSION}"/>
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png?${ICON_VERSION}"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?${ICON_VERSION}"/>
    <link rel="shortcut icon" href="/favicon.ico"/>
    <meta name="description" content="A home for dark, psychological and experimental short fiction — stories that explore the quiet violence beneath ordinary life."/>
    <meta property="og:title" content="Bubble’s Cafe"/>
    <meta property="og:description" content="Dark, psychological and experimental short fiction."/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="Bubble’s Cafe"/>
    <meta name="twitter:description" content="Dark, psychological and experimental short fiction."/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
  </head><body>`);

  res.write(`<div id="root">`);
  // Skeleton shell
  res.write(`<div style="padding:16px;font-family:system-ui">Loading…</div>`);
  res.write(`</div>`);
  // Hydration script placeholder; client will mount
  res.write(`<script type="module" src="/src/main.tsx"></script>`);
  res.end(`</body></html>`);
}

// Minimal server-side preview for Reader pages so crawlers get OG meta without executing JS.
// This does not stream the story, it only serves head tags and a quick shell.
export function readerPreviewHandler(req: Request, res: Response) {
  const slug = String(req.params.slug || '').trim();
  const safeTitle = slug ? `Read: ${decodeURIComponent(slug)} | Bubble’s Cafe` : 'Bubble’s Cafe';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${safeTitle}</title>
    <meta name="description" content="Dark, psychological and experimental short fiction on Bubble’s Cafe."/>
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png?${ICON_VERSION}"/>
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png?${ICON_VERSION}"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?${ICON_VERSION}"/>
    <link rel="shortcut icon" href="/favicon.ico"/>
    <link rel="icon" type="image/png" sizes="any" href="/favicon.png?${ICON_VERSION}"/>

    <!-- Open Graph for social previews -->
    <meta property="og:title" content="${safeTitle}"/>
    <meta property="og:description" content="Read this story on Bubble’s Cafe."/>
    <meta property="og:type" content="article"/>
    <meta property="og:url" content="https://bubblescafe.space/reader/${encodeURIComponent(slug)}"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:secure_url" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${safeTitle}"/>
    <meta name="twitter:description" content="Read this story on Bubble’s Cafe."/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
  </head>
  <body>
    <div id="root"><div style="padding:16px;font-family:system-ui">Loading…</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body></html>`;

  res.status(200).end(html);
}

export function aboutPreviewHandler(_req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const title = 'About | Bubble’s Cafe';
  const desc = 'About Vanessa — writer, designer, and developer behind Bubble’s Cafe.';

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <meta name="description" content="${desc}"/>
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png?${ICON_VERSION}"/>
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png?${ICON_VERSION}"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?${ICON_VERSION}"/>
    <link rel="shortcut icon" href="/favicon.ico"/>
    <link rel="icon" type="image/png" sizes="any" href="/favicon.png?${ICON_VERSION}"/>

    <!-- Open Graph for social previews -->
    <meta property="og:title" content="${title}"/>
    <meta property="og:description" content="${desc}"/>
    <meta property="og:type" content="profile"/>
    <meta property="og:url" content="https://bubblescafe.space/about"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:secure_url" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${title}"/>
    <meta name="twitter:description" content="${desc}"/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
  </head>
  <body>
    <div id="root"><div style="padding:16px;font-family:system-ui">Loading…</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body></html>`;

  res.status(200).end(html);
}

