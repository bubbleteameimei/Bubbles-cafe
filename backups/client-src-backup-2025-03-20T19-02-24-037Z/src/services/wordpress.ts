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
  // Step 1: Strip all WordPress-specific content and metadata
  let sanitized = content
    // Remove WordPress blocks completely (not just markers)
    .replace(/<!-- wp:[^>]*?-->([\s\S]*?)<!-- \/wp:[^>]*?-->/g, '')
    // Remove any remaining WordPress comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove all shortcodes
    .replace(/\[[^\]]+\]/g, '')
    // Remove header/footer sections
    .replace(/<header[^>]*>[\s\S]*?<\/header>/g, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, '')
    // Remove all links and buttons
    .replace(/<a[^>]*>[\s\S]*?<\/a>/g, '')
    .replace(/<button[^>]*>[\s\S]*?<\/button>/g, '')
    // Remove meta information
    .replace(/<meta[^>]*>/g, '')
    // Remove images and media
    .replace(/<(?:img|figure|video|audio|iframe|embed|object)[^>]*>[\s\S]*?<\/(?:img|figure|video|audio|iframe|embed|object)>/g, '')
    // Remove SVG elements
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, '')
    // Remove all social/share/navigation elements
    .replace(/<div[^>]*class="[^"]*(?:social|share|follow|navigation|related|comments|wp-block-|jp-|sharedaddy)[^"]*"[^>]*>[\s\S]*?<\/div>/g, '');

  // Step 2: Convert remaining structural elements to paragraphs
  sanitized = sanitized
    .replace(/<(div|section|article|aside)[^>]*>([\s\S]*?)<\/\1>/g, '$2')
    .replace(/<(?:br|hr)[^>]*\/?>/g, '\n');

  // Step 3: Keep only basic text formatting
  const allowedTags = 'p|strong|em|i|b|h[1-6]|blockquote';
  sanitized = sanitized
    .replace(new RegExp(`<(?!\/?(?:${allowedTags})\\b)[^>]+>`, 'g'), '')
    .replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/g, (_, tag, content) => `\n\n${content}\n\n`)
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<p>\s*<\/p>/g, '');

  // Step 4: Clean up special characters and formatting
  sanitized = sanitized
    // Basic HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    // Typography symbols
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8230;|&hellip;/g, '…')
    // Remove excess whitespace
    .replace(/[\t\r\f\v]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Step 5: Final formatting
  return sanitized
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
};

// Local storage keys
const WP_POSTS_CACHE_KEY = 'cached_wordpress_posts';
const WP_LAST_UPDATED_KEY = 'wordpress_posts_last_updated';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Save WordPress posts to local storage cache
 */
function savePostsToLocalStorage(posts: WordPressPost[]): void {
  try {
    // Get any existing cached posts
    const existingCache = getPostsFromLocalStorage();
    
    // Create a map of existing posts by ID for quick lookup
    const existingPostsMap = new Map();
    existingCache.forEach(post => existingPostsMap.set(post.id, post));
    
    // Merge new posts with existing cache, prioritizing newer posts
    posts.forEach(post => existingPostsMap.set(post.id, post));
    
    // Convert map back to array and sort by date (newest first)
    const mergedPosts = Array.from(existingPostsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Save to localStorage
    localStorage.setItem(WP_POSTS_CACHE_KEY, JSON.stringify(mergedPosts));
    localStorage.setItem(WP_LAST_UPDATED_KEY, new Date().toISOString());
    
    console.log(`[WordPress Service] Cached ${mergedPosts.length} posts to local storage`);
  } catch (error) {
    console.error('[WordPress Service] Error saving posts to local storage:', error);
  }
}

/**
 * Retrieve WordPress posts from local storage cache
 */
function getPostsFromLocalStorage(): WordPressPost[] {
  try {
    const cachedData = localStorage.getItem(WP_POSTS_CACHE_KEY);
    if (!cachedData) return [];
    
    const cachedPosts = JSON.parse(cachedData) as WordPressPost[];
    const lastUpdated = localStorage.getItem(WP_LAST_UPDATED_KEY);
    
    // Check if cache is still valid
    if (lastUpdated) {
      const lastUpdatedTime = new Date(lastUpdated).getTime();
      const currentTime = new Date().getTime();
      
      if (currentTime - lastUpdatedTime > CACHE_EXPIRY_TIME) {
        console.log('[WordPress Service] Cache expired, should fetch fresh data');
      } else {
        console.log(`[WordPress Service] Using valid cache of ${cachedPosts.length} posts`);
      }
    }
    
    return cachedPosts;
  } catch (error) {
    console.error('[WordPress Service] Error retrieving posts from local storage:', error);
    return [];
  }
}

/**
 * Get paginated posts from local storage
 */
function getPaginatedPostsFromCache(page: number, perPage: number): WordPressPost[] {
  const allCachedPosts = getPostsFromLocalStorage();
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  
  return allCachedPosts.slice(startIndex, endIndex);
}

export async function fetchWordPressPosts(page = 1): Promise<WordPressPost[]> {
  try {
    console.log(`[WordPress Service] Fetching posts for page ${page}`);
    
    // Create simpler URL parameters for basic fetch
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '5', // Reduced to 5 to troubleshoot
      orderby: 'date',
      order: 'desc'
    });

    // Create complete URL
    const url = `${WORDPRESS_API_URL}?${params}`;
    console.log(`[WordPress Service] Request URL: ${url}`);
    
    // Set fetch options including timeout
    const options = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      // Note: native fetch doesn't support timeout option, AbortController should be used instead
    };
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 second timeout
    
    try {
      // Fetch with more detailed logging and timeout handling
      console.log(`[WordPress Service] Sending request to WordPress API...`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId); // Clear timeout if request completes
      console.log(`[WordPress Service] Received response: ${response.status} ${response.statusText}`);
      
      // Return early if the content type is not JSON
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        console.error(`[WordPress Service] Invalid content type: ${contentType}`);
        throw new Error(`API returned non-JSON content type: ${contentType}`);
      }

      // Handle non-OK responses
      if (!response.ok) {
        console.error(`[WordPress Service] API Error: ${response.status} ${response.statusText}`);
        
        // Log response headers for debugging
        const headers: Record<string, string> = {};
        response.headers.forEach((value: string, key: string) => {
          headers[key] = value;
        });
        console.log(`[WordPress Service] Response headers:`, headers);
        
        throw new Error(`API returned error status: ${response.status}`);
      }

      // Parse response
      const posts = await response.json() as WordPressPost[];
      console.log(`[WordPress Service] Received ${Array.isArray(posts) ? posts.length : 'non-array'} response`);

      // Validate response format
      if (!Array.isArray(posts)) {
        console.error('[WordPress Service] Invalid response format (not an array):', typeof posts);
        throw new Error('API returned non-array response');
      }

      // Cache successful results to local storage
      savePostsToLocalStorage(posts);
      
      // Return successfully parsed posts
      return posts;
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear timeout if fetch fails
      console.error('[WordPress Service] Fetch operation failed:', fetchError);
      
      // Return cached data if available
      const cachedPosts = getPaginatedPostsFromCache(page, 5);
      if (cachedPosts.length > 0) {
        console.log(`[WordPress Service] Returning ${cachedPosts.length} cached posts as fallback`);
        return cachedPosts;
      }
      
      // Return empty array if no cache is available
      console.log('[WordPress Service] No cached posts available, returning empty array');
      return [];
    }
  } catch (error) {
    console.error('[WordPress Service] Fetch error:', error);
    
    // Return cached data in case of network errors
    const cachedPosts = getPaginatedPostsFromCache(page, 5);
    if (cachedPosts.length > 0) {
      console.log(`[WordPress Service] Returning ${cachedPosts.length} cached posts after fetch error`);
      return cachedPosts;
    }
    
    // Return empty array if no cache available
    return [];
  }
}

// Store converted posts for easy retrieval
const CONVERTED_POSTS_CACHE_KEY = 'converted_wordpress_posts';

/**
 * Save converted posts to localStorage for quick access
 */
function saveParsedPostToLocalStorage(post: Partial<Post>): void {
  try {
    // Get existing converted posts
    const existingPosts = getConvertedPostsFromLocalStorage();
    
    // Create map for quick lookup
    const postsMap = new Map();
    existingPosts.forEach(p => postsMap.set(p.id, p));
    
    // Add new post
    postsMap.set(post.id, post);
    
    // Convert map back to array
    const mergedPosts = Array.from(postsMap.values());
    
    // Save to localStorage
    localStorage.setItem(CONVERTED_POSTS_CACHE_KEY, JSON.stringify(mergedPosts));
  } catch (error) {
    console.error('[WordPress Service] Error saving converted post to local storage:', error);
  }
}

/**
 * Get all converted posts from localStorage
 */
function getConvertedPostsFromLocalStorage(): Partial<Post>[] {
  try {
    const data = localStorage.getItem(CONVERTED_POSTS_CACHE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Partial<Post>[];
  } catch (error) {
    console.error('[WordPress Service] Error retrieving converted posts from local storage:', error);
    return [];
  }
}

/**
 * Get a single converted post by slug from localStorage
 */
export function getConvertedPostBySlug(slug: string): Partial<Post> | undefined {
  try {
    const posts = getConvertedPostsFromLocalStorage();
    return posts.find(post => post.slug === slug);
  } catch (error) {
    console.error('[WordPress Service] Error retrieving post by slug from local storage:', error);
    return undefined;
  }
}

export function convertWordPressPost(wpPost: WordPressPost): Partial<Post> {
  try {
    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      console.error(`[WordPress Service] Invalid post data: Missing required fields for post ${wpPost.id}`);
      const fallbackPost = {
        id: wpPost.id || Math.floor(Math.random() * 10000),
        title: wpPost.title?.rendered?.trim() || 'Untitled Story',
        content: wpPost.content?.rendered || 'Content unavailable',
        excerpt: 'No excerpt available',
        slug: wpPost.slug || `untitled-${Date.now()}`,
        createdAt: wpPost.date ? new Date(wpPost.date) : new Date()
      };
      return fallbackPost;
    }

    const sanitizedContent = sanitizeHTML(wpPost.content.rendered);
    const excerpt = wpPost.excerpt?.rendered
      ? sanitizeHTML(wpPost.excerpt.rendered).replace(/<[^>]+>/g, '').trim()
      : sanitizedContent.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

    const convertedPost = {
      id: wpPost.id,
      title: wpPost.title.rendered.trim(),
      content: sanitizedContent,
      excerpt,
      slug: wpPost.slug,
      createdAt: new Date(wpPost.date)
    };
    
    // Cache the converted post
    saveParsedPostToLocalStorage(convertedPost);
    
    return convertedPost;
  } catch (error) {
    console.error('[WordPress Service] Error converting post:', error);
    return {
      id: Math.floor(Math.random() * 10000),
      title: 'Error Loading Story',
      content: 'There was an error loading this story. Please try again later.',
      excerpt: 'Error loading content',
      slug: `error-${Date.now()}`,
      createdAt: new Date()
    };
  }
}