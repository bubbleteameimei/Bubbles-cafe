
import { useEffect, useMemo } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'book' | 'video' | 'product';
  author?: string;
  published?: string;
  modified?: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
  readingTime?: number;
  wordCount?: number;
  locale?: string;
  siteName?: string;
  twitterCreator?: string;
  twitterSite?: string;
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
}

const DEFAULT_SITE_CONFIG = {
  siteName: 'Bubble’s Cafe',
  defaultTitle: 'Bubble’s Cafe',
  defaultDescription: 'Bubble’s Cafe publishes dark, psychological and experimental short fiction — intimate stories of identity, obsessions, decay, and the violence of the human mind.',
  // Use a stable icon path for default social previews
  // Use a rectangular OG image for previews so it isn't rounded/cropped like a favicon
  // Add version param to force refresh after updates
  defaultImage: '/og-image-1200x630.png?v=4',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : 'https://bubblescafe.space',
  locale: 'en_US',
  twitterSite: '@bubblescafe',
  twitterCreator: '@bubblescafe',
  // Site-wide default keywords
  defaultKeywords: [
    'dark','fiction','stories','short','psychological','horror','literary','online','writing','reading','experimental','creative','storytelling','prose','narrative',
    'madness','obsession','decay','identity','violence','love','death','memory','loneliness','isolation','fear','dreams','devotion','mind','soul',
    'magazine','journal','publishing','authors','writers','submissions','fictionhub','literature','readers','community',
    'gothic','darkness','melancholy','emotion','surreal','haunting','literaryfiction','experimentalwriting','aesthetic','atmosphere','introspective','contemporary','digitalmagazine','shortfiction'
  ]
};

export default function SEO({
  title,
  description = DEFAULT_SITE_CONFIG.defaultDescription,
  canonical,
  image,
  type = 'website',
  author,
  published,
  modified,
  keywords = DEFAULT_SITE_CONFIG.defaultKeywords,
  category,
  tags = [],
  readingTime,
  wordCount,
  locale = DEFAULT_SITE_CONFIG.locale,
  siteName = DEFAULT_SITE_CONFIG.siteName,
  twitterCreator = DEFAULT_SITE_CONFIG.twitterCreator,
  twitterSite = DEFAULT_SITE_CONFIG.twitterSite,
  noindex = false,
  nofollow = false,
  robots
}: SEOProps) {
  const siteUrl = DEFAULT_SITE_CONFIG.siteUrl;
  const pageUrl = useMemo(() => canonical ? `${siteUrl}${canonical}` : (typeof window !== 'undefined' ? window.location.href : ''), [canonical, siteUrl]);
  const imageUrl = useMemo(() => image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}${DEFAULT_SITE_CONFIG.defaultImage}`, [image, siteUrl]);
  const fullTitle = useMemo(() => (title ? `${title} | ${siteName}` : DEFAULT_SITE_CONFIG.defaultTitle), [title, siteName]);
  const keywordsJoined = useMemo(
    () => Array.from(new Set([...(DEFAULT_SITE_CONFIG.defaultKeywords || []), ...(keywords || []), ...(tags || [])])).join(', '),
    [keywords, tags]
  );
  
  useEffect(() => {
    // Set document title with proper formatting
    document.title = fullTitle;
    
    // Helper function to create or update meta tags
    const setMetaTag = (name: string, content: string, property = false, nameAttr = 'name') => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[${nameAttr}="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute(nameAttr, name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Helper function to create or update link tags
    const setLinkTag = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
    };
    
    // Basic meta tags
    setMetaTag('description', description);
    setMetaTag('keywords', keywordsJoined);
    
    // Robots meta tag
    const robotsContent = robots || [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
      'max-snippet:-1',
      'max-image-preview:large',
      'max-video-preview:-1'
    ].join(', ');
    setMetaTag('robots', robotsContent);
    
    // Language and locale
    setMetaTag('language', locale.split('_')[0]);
    document.documentElement.lang = locale.split('_')[0];
    
    // Open Graph tags
    setMetaTag('og:title', title || DEFAULT_SITE_CONFIG.defaultTitle, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:url', pageUrl, true);
    setMetaTag('og:image', imageUrl, true);
    // Provide secure_url and explicit dimensions so platforms don't fall back to favicons
    const secureImageUrl = imageUrl.startsWith('http') ? imageUrl.replace('http://', 'https://') : imageUrl;
    setMetaTag('og:image:secure_url', secureImageUrl, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:alt', `${title || DEFAULT_SITE_CONFIG.defaultTitle} - Preview Image`, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:locale', locale, true);
    
    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title || DEFAULT_SITE_CONFIG.defaultTitle);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', imageUrl);
    setMetaTag('twitter:image:alt', `${title || DEFAULT_SITE_CONFIG.defaultTitle} - Preview Image`);
    if (twitterCreator) setMetaTag('twitter:creator', twitterCreator);
    if (twitterSite) setMetaTag('twitter:site', twitterSite);
    
    // Additional meta tags for better SEO
    setMetaTag('format-detection', 'telephone=no');
    setMetaTag('mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-capable', 'yes');
    setMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    setMetaTag('theme-color', '#000000');
    setMetaTag('msapplication-TileColor', '#000000');
    
    // Viewport meta tag for responsive design
    setMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover', false);
    
    // Canonical link
    if (canonical || pageUrl) {
      setLinkTag('canonical', pageUrl);
    }
    
    // Preconnect to external domains for performance
    setLinkTag('preconnect', 'https://fonts.googleapis.com');
    setLinkTag('preconnect', 'https://fonts.gstatic.com', { crossorigin: 'anonymous' });
    // Preconnect/dns-prefetch for WordPress stats pixel endpoint
    setLinkTag('preconnect', 'https://pixel.wp.com');
    setLinkTag('dns-prefetch', 'https://pixel.wp.com');
    
    // Favicon and app icons (use provided PNG favicon from client/public), add cache-bust
    setLinkTag('icon', '/favicon.png?v=3', { type: 'image/png', sizes: 'any' });
    setLinkTag('shortcut icon', '/favicon.ico');
    setLinkTag('apple-touch-icon', '/icons/apple-touch-icon.png?v=3');
    
    // Generate and set JSON-LD structured data
    const generateStructuredData = () => {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        alternateName: 'Bubble\'s Cafe',
        description: description || DEFAULT_SITE_CONFIG.defaultDescription,
        url: siteUrl || pageUrl,
        inLanguage: locale,
        keywords: Array.from(new Set([...(DEFAULT_SITE_CONFIG.defaultKeywords || []), ...(keywords || []), ...(tags || [])])).join(', '),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl || pageUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          url: siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icons/icon-512x512.png`,
            alt: `${siteName} Logo`
          },
          sameAs: [
            'https://bubbleteameimei.wordpress.com/',
            'https://twitter.com/Bubbleteameimei',
            'https://www.instagram.com/Bubbleteameimei/'
          ]
        }
      };

      const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icons/icon-512x512.png`,
          alt: `${siteName} Logo`
        },
        sameAs: [
          'https://bubbleteameimei.wordpress.com/',
          'https://twitter.com/Bubbleteameimei',
          'https://www.instagram.com/Bubbleteameimei/'
        ]
      };

      const navigationSchemas = [
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Stories',
          url: `${siteUrl}/stories`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'About',
          url: `${siteUrl}/about`
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SiteNavigationElement',
          name: 'Contact',
          url: `${siteUrl}/contact`
        }
      ];

      // Build BreadcrumbList JSON-LD from canonical or current path
      const buildBreadcrumbList = (baseUrl: string, canonicalPath?: string, pageTitle?: string) => {
        try {
          const pathOnly = (() => {
            if (!canonicalPath) return '';
            // canonical may be absolute or path
            try {
              const u = new URL(canonicalPath, baseUrl);
              return u.pathname || '';
            } catch {
              return canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
            }
          })();

          const segments = pathOnly.replace(/\/+$/, '').split('/').filter(Boolean);
          const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = [];

          // Always start with Home
          items.push({
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`
          });

          // Helper to title-case labels
          const toTitle = (s: string) =>
            s
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
              .replace(/_/g, ' ');

          let position = 2;
          let cumulative = '';

          for (let i = 0; i < segments.length; i++) {
            const seg = segments[i].toLowerCase();
            cumulative += `/${segments[i]}`;

            // Special handling: map "reader" to "Stories"
            if (seg === 'reader') {
              items.push({
                '@type': 'ListItem',
                position: position++,
                name: 'Stories',
                item: `${baseUrl}/stories`
              });
              continue;
            }

            // Final segment: use page title for story pages when present
            const isLast = i === segments.length - 1;
            const label =
              isLast && pageTitle
                ? pageTitle
                : toTitle(seg);

            items.push({
              '@type': 'ListItem',
              position: position++,
              name: label,
              item: `${baseUrl}${cumulative}`
            });
          }

          if (items.length < 2) {
            // Only "Home" present; skip breadcrumb
            return null;
          }

          return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items
          };
        } catch {
          return null;
        }
      };

      const breadcrumbs = buildBreadcrumbList(
        siteUrl,
        canonical || (typeof pageUrl === 'string' ? new URL(pageUrl, siteUrl).pathname : undefined),
        title
      );

      const schemas: any[] = [websiteSchema, organizationSchema, ...navigationSchemas, ...(breadcrumbs ? [breadcrumbs] : [])];

      if (type === 'article') {
        const articleSchema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          name: title || DEFAULT_SITE_CONFIG.defaultTitle,
          headline: title,
          description: description || DEFAULT_SITE_CONFIG.defaultDescription,
          url: pageUrl,
          mainEntityOfPage: pageUrl,
          image: {
            '@type': 'ImageObject',
            url: imageUrl,
            alt: `${title || DEFAULT_SITE_CONFIG.defaultTitle} - Preview Image`
          },
          publisher: {
            '@type': 'Organization',
            name: siteName,
            url: siteUrl,
            logo: {
              '@type': 'ImageObject',
              url: `${siteUrl}/icons/icon-512x512.png`,
              alt: `${siteName} Logo`
            }
          },
          author: author ? { '@type': 'Person', name: author } : undefined,
          datePublished: published,
          dateModified: modified || published,
          wordCount: wordCount,
          timeRequired: readingTime ? `PT${readingTime}M` : undefined,
          articleSection: category,
          keywords: keywords.concat(tags),
          inLanguage: locale.split('_')[0]
        };
        schemas.push(articleSchema);
      }

      

      return schemas;
    };

    let jsonLdScript = document.querySelector('script[type="application/ld+json"][data-seo-managed="1"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('data-seo-managed', '1');
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = generateStructuredData();
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
    
    if (type === 'article' && readingTime && readingTime > 5) {
      setMetaTag('article:reading_time', `${readingTime} minutes`);
    }
    
    return () => {
      const script = document.querySelector('script[type="application/ld+json"][data-seo-managed="1"]');
      if (script) {
        script.remove();
      }
    };
  }, [
    fullTitle,
    description,
    imageUrl,
    type,
    author,
    published,
    modified,
    locale,
    siteName,
    twitterCreator,
    twitterSite,
    noindex,
    nofollow,
    robots,
    siteUrl,
    pageUrl,
    keywordsJoined,
    category,
    readingTime,
    wordCount,
    title,
    canonical,
    keywords,
    tags
  ]);

  return null;
}

// Hook for generating SEO-friendly URLs
export const useSEOUrl = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Hook for reading time calculation
export const useReadingTime = (content: string): number => {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};
