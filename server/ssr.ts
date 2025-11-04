import { Request, Response } from 'express';

const ICON_VERSION = 'v=3';
const OG_VERSIONED = 'https://bubblescafe.space/og-image-1200x630.png?v=5';

function getOrigin(req: Request): string {
  try {
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'https').split(',')[0].trim() || 'https';
    const host = String(req.headers['x-forwarded-host'] || req.get('host') || 'bubblescafe.space');
    return `${proto}://${host}`;
  } catch {
    return 'https://bubblescafe.space';
  }
}

export function ssrStreamHandler(req: Request, res: Response) {
  if (process.env.ENABLE_SSR !== 'true') {
    res.status(404).end('SSR disabled');
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  const origin = getOrigin(req);
  const canonical = `${origin}/`;
  const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
  const verificationMeta = gsc ? `<meta name="google-site-verification" content="${gsc}"/>` : '';

  // JSON-LD (Website + Organization) for generic SSR shell
  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Bubble's Cafe",
      url: origin,
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Bubble's Cafe",
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icons/icon-512x512.png`,
        width: 512,
        height: 512
      },
      sameAs: [
        'https://bubbleteameimei.wordpress.com/',
        'https://twitter.com/Bubbleteameimei',
        'https://www.instagram.com/Bubbleteameimei/'
      ]
    }
  ]);

  // Include favicon and social preview meta for SSR path as well
  res.write(`<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>Bubble’s Cafe - Dark, Psychological and Gothic Fiction</title>
    <link rel="canonical" href="${canonical}"/>
    ${verificationMeta}
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png?${ICON_VERSION}"/>
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png?${ICON_VERSION}"/>
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png?${ICON_VERSION}"/>
    <link rel="shortcut icon" href="/favicon.ico"/>
    <meta name="description" content="Bubble's Cafe publishes dark, psychological, and experimental fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind."/>
    <meta property="og:title" content="Bubble’s Cafe"/>
    <meta property="og:description" content="Bubble's Cafe publishes dark, psychological, and experimental fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind."/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="${origin}"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="Bubble’s Cafe"/>
    <meta name="twitter:description" content="Bubble's Cafe publishes dark, psychological, and experimental fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind."/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
    <script type="application/ld+json">${jsonLd}</script>
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

  const origin = getOrigin(req);
  const canonical = `${origin}/reader/${encodeURIComponent(slug)}`;
  const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
  const verificationMeta = gsc ? `<meta name="google-site-verification" content="${gsc}"/>` : '';

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Bubble's Cafe",
      url: origin,
      inLanguage: 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${origin}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Bubble's Cafe",
      url: origin,
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/icons/icon-512x512.png`,
        width: 512,
        height: 512
      },
      sameAs: [
        'https://bubbleteameimei.wordpress.com/',
        'https://twitter.com/Bubbleteameimei',
        'https://www.instagram.com/Bubbleteameimei/'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Reader', item: `${origin}/reader` },
        { '@type': 'ListItem', position: 3, name: decodeURIComponent(slug), item: canonical }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: decodeURIComponent(slug),
      description: "Read this story on Bubble’s Cafe.",
      mainEntityOfPage: canonical,
      url: canonical,
      image: { '@type': 'ImageObject', url: '${OG_VERSIONED}', width: 1200, height: 630 },
      publisher: { '@type': 'Organization', name: "Bubble's Cafe", url: origin }
    }
  ]);

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${safeTitle}</title>
    <link rel="canonical" href="${canonical}"/>
    ${verificationMeta}
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
    <meta property="og:url" content="${canonical}"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:secure_url" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${safeTitle}"/>
    <meta name="twitter:description" content="Read this story on Bubble’s Cafe."/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <div id="root"><div style="padding:16px;font-family:system-ui">Loading…</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body></html>`;

  res.status(200).end(html);
}

// Minimal server-side preview for Story alias pages (/story/:slug) for crawler OG tags.
export function storyPreviewHandler(req: Request, res: Response) {
  const slug = String(req.params.slug || '').trim();
  const safeTitle = slug ? `Read: ${decodeURIComponent(slug)} | Bubble’s Cafe` : 'Bubble’s Cafe';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const origin = getOrigin(req);
  // Canonical to reader path
  const canonical = `${origin}/reader/${encodeURIComponent(slug)}`;
  const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
  const verificationMeta = gsc ? `<meta name="google-site-verification" content="${gsc}"/>` : '';

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Bubble's Cafe",
      url: origin,
      inLanguage: 'en'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Bubble's Cafe",
      url: origin
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'Reader', item: `${origin}/reader` },
        { '@type': 'ListItem', position: 3, name: decodeURIComponent(slug), item: canonical }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: decodeURIComponent(slug),
      description: "Read this story on Bubble’s Cafe.",
      mainEntityOfPage: canonical,
      url: canonical,
      image: { '@type': 'ImageObject', url: '${OG_VERSIONED}', width: 1200, height: 630 },
      publisher: { '@type': 'Organization', name: "Bubble's Cafe", url: origin }
    }
  ]);

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${safeTitle}</title>
    <link rel="canonical" href="${canonical}"/>
    ${verificationMeta}
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
    <meta property="og:url" content="${canonical}"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:secure_url" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${safeTitle}"/>
    <meta name="twitter:description" content="Read this story on Bubble’s Cafe."/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <div id="root"><div style="padding:16px;font-family:system-ui">Loading…</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body></html>`;

  res.status(200).end(html);
}

export function aboutPreviewHandler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const origin = getOrigin(req);
  const title = 'About | Bubble’s Cafe';
  const desc = 'About Vanessa — writer, designer, and developer behind Bubble’s Cafe.';
  const canonical = `${origin}/about`;
  const gsc = process.env.GOOGLE_SITE_VERIFICATION || process.env.GSC_VERIFICATION;
  const verificationMeta = gsc ? `<meta name="google-site-verification" content="${gsc}"/>` : '';

  const jsonLd = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: "Bubble's Cafe",
      url: origin,
      inLanguage: 'en'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: "Bubble's Cafe",
      url: origin
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: 'About', item: canonical }
      ]
    }
  ]);

  const html = `<!doctype html><html><head>
    <meta charset="utf-8"/>
    <title>${title}</title>
    <link rel="canonical" href="${canonical}"/>
    ${verificationMeta}
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
    <meta property="og:url" content="${canonical}"/>
    <meta property="og:image" content="${OG_VERSIONED}"/>
    <meta property="og:image:secure_url" content="${OG_VERSIONED}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>

    <!-- Twitter card -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${title}"/>
    <meta name="twitter:description" content="${desc}"/>
    <meta name="twitter:image" content="${OG_VERSIONED}"/>
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body>
    <div id="root"><div style="padding:16px;font-family:system-ui">Loading…</div></div>
    <script type="module" src="/src/main.tsx"></script>
  </body></html>`;

  res.status(200).end(html);
}

