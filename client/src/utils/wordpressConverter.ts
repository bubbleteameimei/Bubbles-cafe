import { Post, insertPostSchema } from '@shared/schema';
import { WordPressPost } from '../services/wordpress';

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function sanitizeHtmlContent(html: string): string {
  // Basic sanitization - remove scripts and potentially harmful tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

export function convertToPost(wpPost: WordPressPost): Partial<Post> {
  const sanitizedContent = sanitizeHtmlContent(wpPost.content.rendered);
  
  return {
    title: wpPost.title.rendered,
    content: sanitizedContent,
    excerpt: wpPost.excerpt.rendered || sanitizedContent.substring(0, 200) + '...',
    slug: wpPost.slug,
    authorId: 1, // Default author ID - you may want to map WordPress authors to your system
    readingTimeMinutes: estimateReadingTime(sanitizedContent),
    isSecret: false,
    matureContent: false,
    metadata: {
      wordpressId: wpPost.id,
      modified: wpPost.modified,
      status: wpPost.status as 'publish',
      type: wpPost.type,
      originalAuthor: wpPost.author,
      featuredMedia: wpPost.featured_media,
      categories: wpPost.categories,
    },
    createdAt: new Date(wpPost.date),
  };
}
