
import { WordPressPost } from '../services/wordpress';
import { format } from 'date-fns';

export interface AppPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  createdAt: string;
  metadata: {
    wordpressId?: number;
    importSource?: string;
  };
}

export function convertWordPressPostToAppFormat(wpPost: WordPressPost): AppPost {
  // Clean HTML content - strip WordPress specific elements
  const cleanContent = wpPost.content.rendered
    .replace(/<!-- wp:([^>])*?-->/g, '')
    .replace(/<!-- \/wp:([^>])*?-->/g, '')
    .replace(/<ul class="wp-block[^>]*>[\s\S]*?<\/ul>/g, '')
    .replace(/<div class="wp-block[^>]*>[\s\S]*?<\/div>/g, '');

  // Format date properly
  const pubDate = new Date(wpPost.date);
  
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: cleanContent,
    excerpt: wpPost.excerpt.rendered
      ? wpPost.excerpt.rendered.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 200) + '...'
      : cleanContent.replace(/<\/?[^>]+(>|$)/g, '').substring(0, 200) + '...',
    slug: wpPost.slug,
    createdAt: format(pubDate, 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
    metadata: {
      wordpressId: wpPost.id,
      importSource: 'wordpress-api',
    }
  };
}
