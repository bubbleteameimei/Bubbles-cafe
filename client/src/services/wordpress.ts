import { Post } from '@shared/schema';

export interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
}

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
const MAX_POSTS = 1000;
const POSTS_PER_PAGE = 100;

const sanitizeHTML = (content: string): string => {
  console.log('[WordPress] Starting content sanitization');

  let sanitized = content
    // Remove unsafe elements
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:[^\s>]*/g, '')

    // Clean up any empty elements and whitespace
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Final cleanup of whitespace and empty lines
  sanitized = sanitized
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');

  console.log('[WordPress] Content sanitization complete');
  return sanitized;
};

export async function fetchWordPressPosts(page = 1): Promise<WordPressPost[]> {
  try {
    console.log(`[WordPress] Fetching posts - page: ${page}`);

    const params = new URLSearchParams({
      page: page.toString(),
      per_page: POSTS_PER_PAGE.toString(),
      orderby: 'date',
      order: 'desc',
      _fields: 'id,date,title,content,excerpt,slug' // Only fetch fields we need
    });

    const response = await fetch(`${WORDPRESS_API_URL}?${params}`);

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`[WordPress] Rate limited. Retry after ${retryAfter} seconds`);
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!response.ok) {
      console.error(`[WordPress] API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch WordPress posts: ${response.statusText}`);
    }

    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    console.log(`[WordPress] Total pages: ${totalPages}, Total posts: ${totalPosts}`);

    const posts = await response.json();

    if (!Array.isArray(posts)) {
      console.error('[WordPress] Invalid response format:', posts);
      throw new Error('Invalid response format from WordPress API');
    }

    if (posts.length > 0) {
      console.log(`[WordPress] Latest post: "${posts[0].title.rendered}" (${posts[0].date})`);
    }

    if (page < totalPages && page * POSTS_PER_PAGE < MAX_POSTS) {
      console.log(`[WordPress] Fetching next page ${page + 1}`);
      const nextPosts = await fetchWordPressPosts(page + 1);
      return [...posts, ...nextPosts].slice(0, MAX_POSTS);
    }

    return posts;
  } catch (error) {
    console.error('[WordPress] Error fetching posts:', error);
    throw error;
  }
}

export function convertWordPressPost(wpPost: WordPressPost): Partial<Post> {
  try {
    console.log(`[WordPress] Converting post: "${wpPost.title.rendered}"`);

    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      throw new Error(`Invalid post data: Missing required fields for post ${wpPost.id}`);
    }

    const sanitizedContent = sanitizeHTML(wpPost.content.rendered);
    const excerpt = wpPost.excerpt.rendered
      ? sanitizeHTML(wpPost.excerpt.rendered).replace(/<[^>]+>/g, '').trim()
      : sanitizedContent.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

    return {
      id: wpPost.id,
      title: wpPost.title.rendered.trim(),
      content: sanitizedContent,
      excerpt,
      slug: wpPost.slug,
      createdAt: new Date(wpPost.date)
    };
  } catch (error) {
    console.error(`[WordPress] Error converting post ${wpPost.id}:`, error);
    throw error;
  }
}