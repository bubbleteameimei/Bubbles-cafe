
import type { ExtendedPost as Post } from '@shared/types/public';
// TODO: validate on server; avoid server schema in client

import { WordPressPost } from '../services/wordpress';

// Extend WordPressPost interface to include missing properties
interface ExtendedWordPressPost extends WordPressPost {
  modified?: string;
  status?: string;
  type?: string;
  author?: number;
  featured_media?: number;
  categories?: number[];
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function sanitizeHtmlContent(html: string): string {
  // Enhanced sanitization - keep essential formatting but remove potentially harmful elements
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '') // Remove inline event handlers
    .replace(/\s(xlink:href|href|src)="\s*(javascript:|vbscript:)[^"]*"/gi, '') // Strip dangerous protocols
    .replace(/\sstyle="[^"]*expression\(/gi, '') // Strip CSS expressions
    .replace(/\s(xlink:href|href|src)="\s*data:[^"]*"/gi, '') // Strip data URIs in attributes
    .replace(/javascript:[^\s>]*/g, ''); // Remove javascript: URLs
}

export function extractExcerpt(content: string, maxLength = 200): string {
  // Remove HTML tags for excerpt
  const textContent = content.replace(/<[^>]+>/g, '');
  if (textContent.length <= maxLength) return textContent;

  // Find the last complete word within maxLength
  const truncated = textContent.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

export function convertToPost(wpPost: ExtendedWordPressPost): Partial<Post> {
  const sanitizedContent = sanitizeHtmlContent(wpPost.content.rendered);
  const excerpt = extractExcerpt(wpPost.excerpt.rendered || sanitizedContent);

  return {
    title: wpPost.title.rendered,
    content: sanitizedContent,
    excerpt,
    slug: wpPost.slug,
    authorId: 1, // Default author ID
    readingTimeMinutes: estimateReadingTime(sanitizedContent),
    isSecret: false,
    matureContent: false,
    themeCategory: 'horror', // Default category for horror blog
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

// Validate post data before saving
export function validateWordPressPost(post: Partial<Post>): boolean {
  try {
    insertPostSchema.parse(post);
    return true;
  } catch (error) {
    
    return false;
  }
}