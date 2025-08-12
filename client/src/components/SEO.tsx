
import { useEffect } from 'react';

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
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

const DEFAULT_SITE_CONFIG = {
  siteName: 'Bubbles Cafe',
  defaultTitle: 'Bubbles Cafe - Immersive Horror Storytelling Platform',
  defaultDescription: 'Discover spine-chilling horror stories, immersive fiction, and creative writing. Join our community of storytellers and readers.',
  defaultImage: '/images/og-default.jpg',
  siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  locale: 'en_US',
  twitterSite: '@bubblescafe',
  twitterCreator: '@bubblescafe'
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
  keywords = ['horror stories', 'fiction', 'creative writing', 'storytelling', 'immersive fiction', 'dark tales'],
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
  robots,
  breadcrumbs = []
}: SEOProps) {
  const siteUrl = DEFAULT_SITE_CONFIG.siteUrl;
  const pageUrl = canonical ? `${siteUrl}${canonical}` : (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}${DEFAULT_SITE_CONFIG.defaultImage}`;
  const fullTitle = title ? `${title} | ${siteName}` : DEFAULT_SITE_CONFIG.defaultTitle;
  
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
    setMetaTag('keywords', keywords.concat(tags).join(', '));
    
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
    setMetaTag('og:image:alt', `${title || DEFAULT_SITE_CONFIG.defaultTitle} - Preview Image`, true);
    setMetaTag('og:site_name', siteName, true);
    setMetaTag('og:locale', locale, true);
    
    // Article-specific Open Graph tags
    if (type === 'article') {
      if (author) setMetaTag('article:author', author, true);
      if (published) setMetaTag('article:published_time', published, true);
      if (modified) setMetaTag('article:modified_time', modified, true);
      if (category) setMetaTag('article:section', category, true);
      tags.forEach(tag => {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'article:tag');
        meta.setAttribute('content', tag);
        document.head.appendChild(meta);
      });
    }
    
    // Twitter Card tags
    setMetaTag('twitter:card', type === 'article' ? 'summary_large_image' : 'summary');
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
    
    // Favicon and app icons
    setLinkTag('icon', '/favicon.ico', { sizes: 'any' });
    setLinkTag('icon', '/favicon.svg', { type: 'image/svg+xml' });
    setLinkTag('apple-touch-icon', '/apple-touch-icon.png');
    setLinkTag('manifest', '/manifest.json');
    
    // Generate and set JSON-LD structured data
    const generateStructuredData = () => {
      const baseSchema = {
        '@context': 'https://schema.org',
        '@type': type === 'article' ? 'Article' : 'WebSite',
        name: title || DEFAULT_SITE_CONFIG.defaultTitle,
        headline: title,
        description: description,
        url: pageUrl,
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
            url: `${siteUrl}/images/logo.png`,
            alt: `${siteName} Logo`
          }
        }
      };

      // Add article-specific schema
      if (type === 'article' && author) {
        Object.assign(baseSchema, {
          author: {
            '@type': 'Person',
            name: author
          },
          datePublished: published,
          dateModified: modified || published,
          wordCount: wordCount,
          timeRequired: readingTime ? `PT${readingTime}M` : undefined,
          articleSection: category,
          keywords: keywords.concat(tags),
          inLanguage: locale.split('_')[0]
        });
      }

      // Add breadcrumb schema
      if (breadcrumbs.length > 0) {
        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${siteUrl}${crumb.url}`
          }))
        };

        return [baseSchema, breadcrumbSchema];
      }

      return baseSchema;
    };

    // Set JSON-LD structured data
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = generateStructuredData();
    jsonLdScript.textContent = JSON.stringify(structuredData, null, 2);
    
    // Performance hints
    if (type === 'article' && readingTime && readingTime > 5) {
      // For long articles, hint that users might want to save for later
      setMetaTag('article:reading_time', `${readingTime} minutes`);
    }
    
    // Cleanup function to remove custom tags when component unmounts
    return () => {
      // Remove custom JSON-LD scripts
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        if (script.textContent?.includes('"@context":"https://schema.org"')) {
          script.remove();
        }
      });
    };
  }, [
    fullTitle, description, canonical, imageUrl, type, author, published, modified, 
    keywords, category, tags, readingTime, wordCount, locale, siteName, 
    twitterCreator, twitterSite, noindex, nofollow, robots, breadcrumbs, 
    siteUrl, pageUrl
  ]);
  
  // This component doesn't render anything visible
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
