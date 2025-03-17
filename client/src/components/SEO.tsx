
import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  published?: string;
  modified?: string;
  keywords?: string[];
}

export default function SEO({
  title = 'Stories',
  description = 'Explore original stories and immersive fiction.',
  canonical,
  image,
  type = 'website',
  author,
  published,
  modified,
  keywords = ['stories', 'fiction', 'immersive', 'reading']
}: SEOProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = canonical ? `${siteUrl}${canonical}` : '';
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : '';
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper function to create or update meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      let meta = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Set basic meta tags
    setMetaTag('description', description);
    if (keywords.length > 0) {
      setMetaTag('keywords', keywords.join(', '));
    }
    
    // Set Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);
    
    if (pageUrl) {
      setMetaTag('og:url', pageUrl, true);
    }
    
    if (imageUrl) {
      setMetaTag('og:image', imageUrl, true);
    }
    
    if (author) {
      setMetaTag('article:author', author, true);
    }
    
    if (published) {
      setMetaTag('article:published_time', published, true);
    }
    
    if (modified) {
      setMetaTag('article:modified_time', modified, true);
    }
    
    // Set Twitter tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    
    if (imageUrl) {
      setMetaTag('twitter:image', imageUrl);
    }
    
    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', pageUrl);
    } else if (canonicalLink) {
      canonicalLink.remove();
    }
    
    // Set JSON-LD script for Schema.org
    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    
    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebSite',
      headline: title,
      description: description,
      image: imageUrl,
      url: pageUrl,
      ...(type === 'article' && author ? {
        author: {
          '@type': 'Person',
          name: author
        }
      } : {}),
      ...(type === 'article' && published ? {
        datePublished: published
      } : {}),
      ...(type === 'article' && modified ? {
        dateModified: modified
      } : {})
    };
    
    jsonLdScript.textContent = JSON.stringify(jsonLdData);
    
    // Cleanup function to remove custom tags when component unmounts
    return () => {
      if (jsonLdScript) {
        jsonLdScript.remove();
      }
    };
  }, [title, description, canonical, image, type, author, published, modified, keywords, siteUrl, pageUrl, imageUrl]);
  
  // This component doesn't render anything visible
  return null;
}
