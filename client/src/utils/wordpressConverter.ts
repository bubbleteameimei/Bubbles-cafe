
import type { ExtendedPost as Post } from '@shared/types/public';
import { WordPressPost } from '../services/wordpress';

export function sanitizeHtmlContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/\s(xlink:href|href|src)="\s*(javascript:|vbscript:)[^"]*"/gi, '')
    .replace(/\sstyle="[^"]*expression\(/gi, '')
    .replace(/\s(xlink:href|href|src)="\s*data:[^"]*"/gi, '')
    .replace(/javascript:[^\s>]*/g, '');
}

export function convertWordPressPost(wpPost: WordPressPost): Post {
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    excerpt: wpPost.excerpt.rendered,
    slug: wpPost.slug,
    metadata: {
      wordpressId: (wpPost as any).id,
      modified: (wpPost as any).modified,
      status: (wpPost as any).status as 'publish',
      type: (wpPost as any).type,
      originalAuthor: (wpPost as any).author,
      featuredMedia: (wpPost as any).featured_media,
      categories: (wpPost as any).categories,
    },
    createdAt: new Date(wpPost.date).toISOString(),
  };
}

export function validateWordPressPost(_post: Partial<Post>): boolean {
  return true;
}