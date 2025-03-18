/**
 * WordPress API Integration
 * 
 * This module provides a clean interface for interacting with the WordPress API,
 * including proper error handling and data validation.
 */

import { z } from 'zod';
import { ErrorCategory, ErrorSeverity, handleError, handleValidationError } from './error-handler';

// Base URL for WordPress API
const WORDPRESS_API_BASE = import.meta.env.VITE_WORDPRESS_API_URL || 'https://bubbleteameimei.wordpress.com/wp-json/wp/v2';

// Fallback to server API if WordPress is unavailable
const SERVER_FALLBACK_API = '/api/posts';

// WordPress post schema for validation
export const wordpressPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  modified: z.string().optional(),
  slug: z.string(),
  status: z.string().optional(),
  type: z.string().optional(),
  link: z.string().optional(),
  title: z.object({
    rendered: z.string()
  }),
  content: z.object({
    rendered: z.string(),
    protected: z.boolean().optional()
  }),
  excerpt: z.object({
    rendered: z.string()
  }).optional(),
  author: z.number().optional(),
  featured_media: z.number().optional(),
  categories: z.array(z.number()).optional(),
  tags: z.array(z.number()).optional(),
  meta: z.record(z.any()).optional()
});

// WordPress post type
export type WordPressPost = z.infer<typeof wordpressPostSchema>;

// Options for fetching posts
export interface FetchPostsOptions {
  page?: number;
  perPage?: number;
  categories?: number[];
  tags?: number[];
  search?: string;
  slug?: string;
  includeContent?: boolean;
}

/**
 * Fetch posts from WordPress API with validation and error handling
 */
export async function fetchWordPressPosts(options: FetchPostsOptions = {}) {
  const {
    page = 1,
    perPage = 10,
    categories,
    tags,
    search,
    slug,
    includeContent = true
  } = options;

  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      _embed: 'true', // Include featured images and author info
    });

    // Add optional filters
    if (categories?.length) {
      params.append('categories', categories.join(','));
    }

    if (tags?.length) {
      params.append('tags', tags.join(','));
    }

    if (search) {
      params.append('search', search);
    }

    if (slug) {
      params.append('slug', slug);
    }

    // Set content fields based on whether we need the full content
    if (!includeContent) {
      params.append('_fields', 'id,date,title,excerpt,slug,featured_media,_embedded');
    }

    // Fetch data from WordPress API
    const response = await fetch(`${WORDPRESS_API_BASE}/posts?${params.toString()}`);

    if (!response.ok) {
      throw {
        message: `WordPress API error: ${response.statusText}`,
        status: response.status
      };
    }

    // Parse and validate response data
    const postsData = await response.json();
    
    // Check if we have an array of posts
    if (!Array.isArray(postsData)) {
      throw new Error('Invalid response format from WordPress API');
    }

    // Validate each post using zod
    const validatedPosts = postsData.map(post => {
      const result = wordpressPostSchema.safeParse(post);
      
      if (!result.success) {
        // Log validation errors but continue with partial data
        handleValidationError(result.error);
        
        // Return a basic valid structure with available data
        return {
          id: post.id || 0,
          date: post.date || new Date().toISOString(),
          slug: post.slug || 'untitled',
          title: { rendered: post.title?.rendered || 'Untitled' },
          content: { rendered: post.content?.rendered || 'Content unavailable' },
          excerpt: { rendered: post.excerpt?.rendered || 'No excerpt available' }
        };
      }
      
      return result.data;
    });

    return {
      posts: validatedPosts,
      totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1'),
      total: parseInt(response.headers.get('X-WP-Total') || '0')
    };
  } catch (error) {
    // Handle and format the error
    const formattedError = handleError(error, {
      category: ErrorCategory.WORDPRESS,
      showToast: true
    });

    // Return empty result with error information
    return {
      posts: [],
      totalPages: 0,
      total: 0,
      error: formattedError
    };
  }
}

/**
 * Fetch a single post by slug
 */
export async function fetchWordPressPostBySlug(slug: string) {
  try {
    const result = await fetchWordPressPosts({ slug, perPage: 1 });
    
    if (result.posts.length === 0) {
      throw new Error(`Post not found with slug: ${slug}`);
    }
    
    return result.posts[0];
  } catch (error) {
    // Handle and format the error
    handleError(error, {
      category: ErrorCategory.WORDPRESS,
      showToast: true
    });
    
    // Re-throw to allow component error boundaries to catch
    throw error;
  }
}

/**
 * Convert WordPress HTML content to a more usable format
 * (sanitizes and processes WordPress-specific markup)
 */
export function processWordPressContent(content: string): string {
  if (!content) return '';
  
  // Replace WordPress-specific elements with standard HTML
  let processed = content
    // Fix WordPress captions
    .replace(/\[caption.*?\](.*?)\[\/caption\]/g, '<figure>$1</figure>')
    // Handle WordPress galleries
    .replace(/\[gallery.*?\]/g, '<div class="gallery-placeholder">Gallery content</div>')
    // Fix broken links
    .replace(/href="javascript:void\(0\)"/g, 'href="#"')
    // Clean up empty paragraphs
    .replace(/<p>&nbsp;<\/p>/g, '')
    // Replace WordPress embeds with placeholders
    .replace(/\[embed.*?\].*?\[\/embed\]/g, '<div class="embed-placeholder">Embedded content</div>');

  return processed;
}

/**
 * Extract and format an excerpt from WordPress content
 */
export function getExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Trim and truncate
  const trimmed = plainText.trim();
  
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  
  // Find a good breaking point
  const truncated = trimmed.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 
    ? `${truncated.substring(0, lastSpace)}...` 
    : `${truncated}...`;
}

/**
 * Calculate estimated reading time for content
 */
export function getReadingTime(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags
  const plainText = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Count words (roughly)
  const words = plainText.split(/\s+/).length;
  
  // Average reading speed: 200-250 words per minute
  const wordsPerMinute = 225;
  const minutes = Math.ceil(words / wordsPerMinute);
  
  // Return at least 1 minute
  return Math.max(1, minutes);
}

/**
 * Check if the WordPress API is available
 * Returns true if the API is reachable, false otherwise
 */
export async function checkWordPressApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${WORDPRESS_API_BASE}/posts?per_page=1`, {
      method: 'HEAD',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    handleError(error, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.WARNING,
      silent: true // Don't show toast for status check
    });
    
    return false;
  }
}