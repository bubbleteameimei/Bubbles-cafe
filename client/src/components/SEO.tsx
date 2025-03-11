
import React from 'react';
import { Helmet } from 'react-helmet';

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
  title = 'Horror Stories',
  description = 'Explore original horror stories, dark fiction, and supernatural tales.',
  canonical,
  image,
  type = 'website',
  author,
  published,
  modified,
  keywords = ['horror', 'stories', 'fiction', 'supernatural', 'dark fiction']
}: SEOProps) {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const pageUrl = canonical ? `${siteUrl}${canonical}` : '';
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : '';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {canonical && <link rel="canonical" href={pageUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {author && <meta property="article:author" content={author} />}
      {published && <meta property="article:published_time" content={published} />}
      {modified && <meta property="article:modified_time" content={modified} />}
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      
      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
    </Helmet>
  );
}
