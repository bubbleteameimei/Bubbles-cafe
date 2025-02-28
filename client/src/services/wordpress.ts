import { Post } from '@shared/schema';

export interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  categories: number[];
}

const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
const MAX_POSTS = 1000; // Maximum number of posts to fetch
const POSTS_PER_PAGE = 100; // Maximum allowed by WordPress API

// Preserve HTML formatting while removing unsafe content
const sanitizeHTML = (html: string): string => {
  console.log('[WordPress] Raw HTML content:', html.substring(0, 100) + '...');

  // Only remove unsafe elements and attributes, preserve formatting tags
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:[^\s>]*/g, '')
    .trim();

  console.log('[WordPress] Sanitized HTML content:', sanitized.substring(0, 100) + '...');
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
      status: 'publish'
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
      console.log('[WordPress] Sample content:', posts[0].content.rendered.substring(0, 100) + '...');
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
    console.log(`[WordPress] Converting post: "${wpPost.title.rendered}" (${wpPost.date})`);

    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      throw new Error(`Invalid post data: Missing required fields for post ${wpPost.id}`);
    }

    const sanitizedContent = sanitizeHTML(wpPost.content.rendered);
    const excerpt = wpPost.excerpt.rendered 
      ? sanitizeHTML(wpPost.excerpt.rendered).replace(/<[^>]+>/g, '').trim()
      : sanitizedContent.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

    console.log(`[WordPress] Converted post ID ${wpPost.id} successfully`);
    console.log('[WordPress] Content preview:', sanitizedContent.substring(0, 100) + '...');

    return {
      id: wpPost.id,
      title: wpPost.title.rendered.trim(),
      content: sanitizedContent,
      excerpt,
      slug: wpPost.slug,
      createdAt: new Date(wpPost.date),
      metadata: {
        wordpressId: wpPost.id,
        modified: wpPost.modified,
        status: wpPost.status as 'publish',
        type: wpPost.type,
        originalAuthor: wpPost.author,
        featuredMedia: wpPost.featured_media,
        categories: wpPost.categories,
      }
    };
  } catch (error) {
    console.error(`[WordPress] Error converting post ${wpPost.id}:`, error);
    throw error;
  }
}