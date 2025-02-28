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

export async function fetchWordPressPosts(page = 1, perPage = POSTS_PER_PAGE): Promise<WordPressPost[]> {
  try {
    console.log(`[WordPress] Fetching posts - page: ${page}, per_page: ${perPage}`);

    // Add parameters for sorting and status
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      orderby: 'date',
      order: 'desc', // Newest first
      status: 'publish'
    });

    const response = await fetch(`${WORDPRESS_API_URL}?${params}`);

    // Handle rate limits and errors
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`[WordPress] Rate limited. Retry after ${retryAfter} seconds`);
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!response.ok) {
      console.error(`[WordPress] API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch WordPress posts: ${response.statusText}`);
    }

    // Get total pages and posts from headers
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    console.log(`[WordPress] Total pages: ${totalPages}, Total posts: ${totalPosts}`);

    const posts = await response.json();
    console.log(`[WordPress] Fetched ${posts.length} posts from page ${page}`);

    // Validate response data
    if (!Array.isArray(posts)) {
      console.error('[WordPress] Invalid response format:', posts);
      throw new Error('Invalid response format from WordPress API');
    }

    // Log the first post's title and date for debugging
    if (posts.length > 0) {
      console.log(`[WordPress] Latest post: "${posts[0].title.rendered}" (${posts[0].date})`);
    }

    // If we have more pages and haven't reached the maximum, fetch them recursively
    if (page < totalPages && page * perPage < MAX_POSTS) {
      console.log(`[WordPress] Fetching next page ${page + 1}`);
      const nextPosts = await fetchWordPressPosts(page + 1, perPage);
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

    // Validate required fields
    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      throw new Error(`Invalid post data: Missing required fields for post ${wpPost.id}`);
    }

    // Enhanced sanitization of content
    const sanitizedContent = wpPost.content.rendered
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/g, '') // Remove inline event handlers
      .replace(/javascript:[^\s>]*/g, '') // Remove javascript: URLs
      .trim();

    // Use excerpt if available, otherwise create one from content
    const excerpt = wpPost.excerpt.rendered 
      ? wpPost.excerpt.rendered.replace(/<[^>]+>/g, '').trim()
      : sanitizedContent.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

    console.log(`[WordPress] Converted post ID ${wpPost.id} successfully`);

    return {
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