import { Request, Response } from 'express';

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
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png"/>
    <meta name="description" content="A home for dark, psychological and experimental short fiction — stories that explore the quiet violence beneath ordinary life."/>
    <meta property="og:title" content="Bubble’s Cafe"/>
    <meta property="og:description" content="Dark, psychological and experimental short fiction."/>
    <meta property="og:type" content="website"/>
    <meta property="og:image" content="/icons/icon-512x512.png"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="Bubble’s Cafe"/>
    <meta name="twitter:description" content="Dark, psychological and experimental short fiction."/>
    <meta name="twitter:image" content="/icons/icon-512x512.png"/>
  </head><body>`);

  res.write(`<div id="root">`);
  // Skeleton shell
  res.write(`<div style="padding:16px;font-family:system-ui">Loading…</div>`);
  res.write(`</div>`);
  // Hydration script placeholder; client will mount
  res.write(`<script type="module" src="/src/main.tsx"></script>`);
  res.end(`</body></html>`);
}

