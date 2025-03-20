/**
 * WordPress API Integration
 * 
 * This module provides a robust interface for interacting with the WordPress API,
 * with comprehensive error handling, validation, and fallback mechanisms.
 * 
 * Features:
 * - Enhanced error detection and handling
 * - Local storage cache with fallback support 
 * - Automatic retries for intermittent failures
 * - Rich logging for debugging
 */

import { z } from 'zod';
import { ErrorCategory, ErrorSeverity, handleError, handleValidationError } from './error-handler';

// Base URL for WordPress API - using the WordPress.com REST API for your site
const WORDPRESS_API_BASE = import.meta.env.VITE_WORDPRESS_API_URL || 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

// Fallback to server API if WordPress is unavailable
const SERVER_FALLBACK_API = '/api/posts';

// Cache configuration
const CACHE_KEY_PREFIX = 'wp_cache_';
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const LAST_ERROR_KEY = 'wp_last_error';

// WordPress post schema with relaxed validation - allows more flexibility for parsing
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
}).passthrough(); // Allow additional properties

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
  skipCache?: boolean;
  maxRetries?: number;
}

// Cache management utilities
const cacheUtils = {
  getCacheKey(options: FetchPostsOptions): string {
    // Create a unique key based on request options
    const { page = 1, perPage = 10, categories, tags, search, slug } = options;
    const optionsKey = JSON.stringify({ page, perPage, categories, tags, search, slug });
    return `${CACHE_KEY_PREFIX}${btoa(optionsKey)}`;
  },
  
  saveToCache(key: string, data: any): void {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`[WordPress] Cache saved: ${key}`);
    } catch (error) {
      console.warn(`[WordPress] Failed to save cache: ${error}`);
    }
  },
  
  getFromCache(key: string): any {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const cacheItem = JSON.parse(item);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - cacheItem.timestamp > CACHE_DURATION_MS) {
        console.log(`[WordPress] Cache expired: ${key}`);
        localStorage.removeItem(key);
        return null;
      }
      
      console.log(`[WordPress] Cache hit: ${key}`);
      return cacheItem.data;
    } catch (error) {
      console.warn(`[WordPress] Failed to retrieve cache: ${error}`);
      return null;
    }
  },
  
  saveError(error: any): void {
    try {
      localStorage.setItem(LAST_ERROR_KEY, JSON.stringify({
        message: error?.message || 'Unknown error',
        timestamp: Date.now(),
        details: error
      }));
    } catch (e) {
      console.error(`[WordPress] Failed to save error details: ${e}`);
    }
  },
  
  getLastError(): any {
    try {
      const data = localStorage.getItem(LAST_ERROR_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
};

/**
 * Safely parse JSON with extensive error handling
 */
function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(`[WordPress] JSON parse error: ${error}`);
    console.log(`[WordPress] Problematic JSON content: ${text.substring(0, 100)}...`);
    throw new Error('Invalid JSON response');
  }
}

/**
 * Fetch posts from WordPress API with enhanced reliability
 */
export async function fetchWordPressPosts(options: FetchPostsOptions = {}) {
  console.log(`[WordPress] Fetching posts with options:`, options);
  
  const {
    page = 1,
    perPage = 10,
    categories,
    tags,
    search,
    slug,
    includeContent = true,
    skipCache = false,
    maxRetries = 2
  } = options;

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cacheKey = cacheUtils.getCacheKey(options);
    const cachedResult = cacheUtils.getFromCache(cacheKey);
    
    if (cachedResult) {
      console.log(`[WordPress] Using cached data for page ${page}`);
      return cachedResult;
    }
  }

  // If we had a previous fatal error within the last 5 minutes, use fallback immediately
  const lastErrorObj = cacheUtils.getLastError();
  const isFatalErrorRecent = lastErrorObj && 
                            (Date.now() - lastErrorObj.timestamp < 5 * 60 * 1000) && 
                            lastErrorObj.message.includes('fatal');
                            
  if (isFatalErrorRecent) {
    console.log(`[WordPress] Skipping API call due to recent fatal error: ${lastErrorObj.message}`);
    return await fallbackToServerAPI(options);
  }
  
  // Implement retry logic
  let retryCount = 0;
  let currentError: any = null;
  
  while (retryCount <= maxRetries) {
    try {
      if (retryCount > 0) {
        console.log(`[WordPress] Retry attempt ${retryCount}/${maxRetries}`);
      }
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
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
        params.append('_fields', 'id,date,title,excerpt,slug,featured_media');
      }
      
      // Construct the API URL
      const apiUrl = `${WORDPRESS_API_BASE}/posts?${params.toString()}`;
      console.log(`[WordPress] Request URL: ${apiUrl}`);
      
      // Set up timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        // Make the fetch request with timeout
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin
          },
          mode: 'cors',
          credentials: 'omit',
          signal: controller.signal
        });
        
        // Clear the timeout since request completed
        clearTimeout(timeoutId);
        
        // Check for HTTP errors
        if (!response.ok) {
          console.error(`[WordPress] HTTP Error: ${response.status} ${response.statusText}`);
          throw new Error(`API returned status ${response.status}`);
        }
        
        // Ensure we got JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`[WordPress] Wrong content type: ${contentType}`);
          throw new Error(`API returned non-JSON content type: ${contentType}`);
        }
        
        // Parse the response
        const responseText = await response.text();
        
        // Log the first part of the response for debugging
        console.log(`[WordPress] Response preview: ${responseText.substring(0, 100)}...`);
        
        // Parse JSON with error handling
        const postsData = safeJsonParse(responseText);
        
        // Verify array structure
        if (!Array.isArray(postsData)) {
          console.error(`[WordPress] Invalid response format (not an array):`, typeof postsData);
          throw new Error('API returned non-array response');
        }
        
        console.log(`[WordPress] Successfully fetched ${postsData.length} posts`);
        
        // Process and validate each post
        const validatedPosts = postsData.map(post => {
          // Use safe parsing to handle validation errors gracefully
          const result = wordpressPostSchema.safeParse(post);
          
          if (!result.success) {
            // Log validation errors but don't fail
            console.warn(`[WordPress] Post validation warnings for post ID ${post.id}:`, 
              result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; '));
            
            // Build a valid structure from available data
            return {
              id: post.id || Math.floor(Math.random() * 10000),
              date: post.date || new Date().toISOString(),
              slug: post.slug || `post-${post.id || Date.now()}`,
              title: { 
                rendered: post.title?.rendered || 'Untitled Post' 
              },
              content: { 
                rendered: post.content?.rendered || 'Content unavailable' 
              },
              excerpt: { 
                rendered: post.excerpt?.rendered || 'No excerpt available' 
              }
            };
          }
          
          return result.data;
        });
        
        // Construct result object with pagination info
        const result = {
          posts: validatedPosts,
          totalPages: parseInt(response.headers.get('X-WP-TotalPages') || '1'),
          total: parseInt(response.headers.get('X-WP-Total') || validatedPosts.length.toString())
        };
        
        // Cache successful results
        const cacheKey = cacheUtils.getCacheKey(options);
        cacheUtils.saveToCache(cacheKey, result);
        
        return result;
      } catch (fetchError: any) {
        // Clear timeout if fetch fails
        clearTimeout(timeoutId);
        
        // Handle timeout errors specifically
        if (fetchError.name === 'AbortError') {
          console.error(`[WordPress] Request timed out`);
          throw new Error('API request timed out');
        }
        
        // Re-throw the error for the retry logic
        throw fetchError;
      }
    } catch (error: any) {
      currentError = error;
      console.error(`[WordPress] Error attempt ${retryCount}:`, error);
      
      // Save error details for future reference
      cacheUtils.saveError(error);
      
      // Increment retry counter
      retryCount++;
      
      // If we have retries left, wait before trying again (exponential backoff)
      if (retryCount <= maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
        console.log(`[WordPress] Waiting ${delay}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we've exhausted retries, try the server API as fallback
  console.log(`[WordPress] Exhausted ${maxRetries} retries, using fallback`);
  return await fallbackToServerAPI(options, currentError);
}

/**
 * Attempt to fetch posts from the server API as a fallback
 * Now enhanced with local sync fallback support
 */
async function fallbackToServerAPI(options: FetchPostsOptions, error?: any) {
  console.log(`[WordPress] Attempting fallback to server API`);
  
  try {
    // First check for locally synced posts from auto-sync if available
    // This provides an additional layer of reliability
    if (!options.slug) {  // Local sync fallback only works for post listings, not single post by slug
      const localSyncedPosts = checkLocalSyncedPosts();
      
      if (localSyncedPosts && localSyncedPosts.posts.length > 0) {
        console.log(`[WordPress] Using ${localSyncedPosts.posts.length} locally synced posts as fallback`);
        
        // If we need to filter or paginate the sync posts, do it here
        const { page = 1, perPage = 10 } = options;
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedPosts = localSyncedPosts.posts.slice(startIndex, endIndex);
        
        return {
          posts: paginatedPosts,
          totalPages: Math.ceil(localSyncedPosts.posts.length / perPage),
          total: localSyncedPosts.posts.length,
          fromLocalSync: true,
          fromFallback: true
        };
      }
    }
    
    // If no local synced posts or we need a specific post by slug, use server API
    const { page = 1, perPage = 10 } = options;
    
    // Adjust fallback URL based on options
    let fallbackUrl = `${SERVER_FALLBACK_API}?page=${page}&limit=${perPage}`;
    
    // Add slug filter if provided
    if (options.slug) {
      fallbackUrl = `${SERVER_FALLBACK_API}/${options.slug}`;
    }
    
    console.log(`[WordPress] Fallback URL: ${fallbackUrl}`);
    
    // Fetch from server API
    const response = await fetch(fallbackUrl);
    
    if (!response.ok) {
      throw new Error(`Server API returned status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format response in WordPress-compatible format
    let formattedResult;
    
    if (options.slug) {
      // Single post response
      const post: any = data;
      formattedResult = {
        posts: [{
          id: post.id,
          date: post.createdAt,
          slug: post.slug,
          title: { rendered: post.title },
          content: { rendered: post.content },
          excerpt: { rendered: post.excerpt || post.content.substring(0, 150) + '...' }
        }],
        totalPages: 1,
        total: 1,
        fromFallback: true
      };
    } else {
      // Multiple posts response
      const posts = Array.isArray(data.posts) ? data.posts : [];
      formattedResult = {
        posts: posts.map((post: any) => ({
          id: post.id,
          date: post.createdAt,
          slug: post.slug,
          title: { rendered: post.title },
          content: { rendered: post.content },
          excerpt: { rendered: post.excerpt || post.content.substring(0, 150) + '...' }
        })),
        totalPages: data.hasMore ? page + 1 : page,
        total: posts.length,
        fromFallback: true
      };
    }
    
    console.log(`[WordPress] Fallback successful, retrieved ${formattedResult.posts.length} posts`);
    return formattedResult;
  } catch (fallbackError) {
    // Log both the original and fallback errors
    console.error('[WordPress] Both primary and fallback fetches failed:');
    console.error('- Original error:', error);
    console.error('- Fallback error:', fallbackError);
    
    // Format an empty response with error information
    return {
      posts: [],
      totalPages: 0,
      total: 0,
      error: handleError(error || fallbackError, {
        category: ErrorCategory.WORDPRESS,
        severity: ErrorSeverity.ERROR,
        showToast: true
      }),
      fromFallback: true
    };
  }
}

/**
 * Fetch a single post by slug with enhanced error handling
 * Now enhanced with local sync lookup capabilities
 */
export async function fetchWordPressPostBySlug(slug: string) {
  console.log(`[WordPress] Fetching post with slug: ${slug}`);
  
  try {
    // First try to find the post in local synced posts for immediate display
    const localSyncedPosts = checkLocalSyncedPosts();
    if (localSyncedPosts && localSyncedPosts.posts.length > 0) {
      // Search for the post by slug in the local synced collection
      const localPost = localSyncedPosts.posts.find((post: WordPressPost) => post.slug === slug);
      
      if (localPost) {
        console.log(`[WordPress] Found post "${slug}" in local sync storage`);
        
        // We found it locally, but still attempt to refresh from API in background
        // This ensures we always try to get the latest version when possible
        setTimeout(() => {
          fetchWordPressPosts({ 
            slug, 
            perPage: 1,
            skipCache: true,
            maxRetries: 1
          }).catch(e => console.warn('[WordPress] Background refresh failed:', e));
        }, 1000);
        
        return localPost;
      }
    }
    
    // Post not found locally or no local sync available, fetch from API
    const result = await fetchWordPressPosts({ 
      slug, 
      perPage: 1,
      maxRetries: 1 // Reduced retries for single post lookups
    });
    
    if (!result.posts || result.posts.length === 0) {
      console.error(`[WordPress] Post not found: ${slug}`);
      throw new Error(`Post not found with slug: ${slug}`);
    }
    
    console.log(`[WordPress] Successfully retrieved post: ${slug}`);
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
    // Remove WordPress block markers
    .replace(/<!-- wp:[^>]*?-->([\s\S]*?)<!-- \/wp:[^>]*?-->/g, '$1')
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
/**
 * Check if the WordPress API is available with improved reliability
 * - Implements multiple endpoints check
 * - Uses local storage to cache status for performance
 * - Implements progressive backoff for rechecking
 * - Handles network conditions gracefully
 */
export async function checkWordPressApiStatus(): Promise<boolean> {
  console.log('[WordPress] Checking API status');
  
  // First check if we have a cached status that's recent (last 5 minutes)
  const cachedStatus = localStorage.getItem('wp_api_status');
  const now = Date.now();
  
  if (cachedStatus) {
    try {
      const statusData = JSON.parse(cachedStatus);
      // If we have recent data (last 5 minutes), use it
      if (now - statusData.timestamp < 5 * 60 * 1000) {
        console.log(`[WordPress] Using cached API status: ${statusData.available ? 'Available' : 'Unavailable'}`);
        return statusData.available;
      }
    } catch (e) {
      // Invalid cache data, will proceed with live check
      localStorage.removeItem('wp_api_status');
    }
  }
  
  try {
    // Multiple endpoints to check, in order of reliability
    const endpoints = [
      '/posts?per_page=1',      // Main posts endpoint
      '/categories?per_page=1', // Categories as fallback
      '/tags?per_page=1'        // Tags as secondary fallback
    ];
    
    // Check endpoints in sequence until one succeeds
    for (const endpoint of endpoints) {
      try {
        // Use a controller to implement timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${WORDPRESS_API_BASE}${endpoint}`, {
          method: 'HEAD', // Use HEAD to be lightweight
          headers: {
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          // Cache the successful status
          localStorage.setItem('wp_api_status', JSON.stringify({
            available: true,
            timestamp: now,
            endpoint
          }));
          
          console.log(`[WordPress] API status check: Available (via ${endpoint})`);
          return true;
        }
      } catch (endpointError) {
        // This endpoint failed, try the next one
        console.warn(`[WordPress] Endpoint ${endpoint} failed:`, endpointError);
        continue;
      }
    }
    
    // All endpoints failed
    console.warn('[WordPress] All API endpoints failed');
    
    // Cache the failed status
    localStorage.setItem('wp_api_status', JSON.stringify({
      available: false,
      timestamp: now
    }));
    
    return false;
  } catch (error) {
    console.warn('[WordPress] API status check failed:', error);
    
    handleError(error, {
      category: ErrorCategory.NETWORK,
      silent: true // Don't show toast for status check
    });
    
    // Cache the error status
    localStorage.setItem('wp_api_status', JSON.stringify({
      available: false,
      timestamp: now,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    
    return false;
  }
}

/**
 * Check for and utilize locally synced posts from the sync service
 */
export function checkLocalSyncedPosts() {
  try {
    // This key should match the one in wordpress-sync.ts
    const LOCAL_POSTS_KEY = 'wp_local_posts';
    const data = localStorage.getItem(LOCAL_POSTS_KEY);
    
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    if (!parsedData.posts || !Array.isArray(parsedData.posts) || parsedData.posts.length === 0) {
      return null;
    }
    
    // Posts persist permanently, but we log the age for informational purposes
    const timestamp = parsedData.timestamp;
    const now = Date.now();
    const ageMs = now - timestamp;
    const ageHours = ageMs / (1000 * 60 * 60);
    
    // No timeout - posts will persist indefinitely
    // Just log how old they are for debugging purposes
    
    console.log(`[WordPress] Found ${parsedData.posts.length} locally synced posts from ${Math.round(ageHours * 10) / 10}h ago`);
    return {
      posts: parsedData.posts,
      totalPages: 1,
      total: parsedData.posts.length,
      fromLocalSync: true
    };
  } catch (error) {
    console.error('[WordPress] Error checking local synced posts:', error);
    return null;
  }
}

/**
 * Preload WordPress posts in the background for faster initial page load
 * Enhanced with better error handling, initialization, and local sync fallback
 */
export function preloadWordPressPosts(): Promise<void> {
  console.log('[WordPress] Starting background preload of posts');
  
  // Return a promise that resolves when the preload is complete
  return new Promise((resolve, reject) => {
    // First check for locally synced posts from auto-sync service
    const localSyncedPosts = checkLocalSyncedPosts();
    
    if (localSyncedPosts) {
      console.log(`[WordPress] Using ${localSyncedPosts.posts.length} locally synced posts for quick initial load`);
      resolve();
      
      // Still try to refresh from the API in the background
      setTimeout(() => {
        checkWordPressApiStatus()
          .then(refreshInBackground)
          .catch(error => console.warn('[WordPress] Background refresh failed:', error));
      }, 3000); // Wait 3 seconds before attempting a background refresh
      
      return;
    }
    
    // No local synced posts available, proceed with normal API check
    checkWordPressApiStatus()
      .then(refreshInBackground)
      .then(() => resolve())
      .catch(error => {
        console.warn('[WordPress] Preload failed:', error);
        // Still resolve the promise to prevent blocking
        resolve();
      });
  });
  
  // Helper function to refresh posts based on API availability
  function refreshInBackground(isAvailable: boolean) {
    if (!isAvailable) {
      console.log('[WordPress] API unavailable, using fallback directly');
      // Directly use server API to avoid unnecessary retries
      return fallbackToServerAPI({ perPage: 5 });
    }
    
    // API is available, fetch posts normally
    return fetchWordPressPosts({ 
      perPage: 5, 
      skipCache: true,
      maxRetries: 1  // Limit retries for initial load
    }).then(result => {
      console.log(`[WordPress] Preloaded ${result.posts?.length || 0} posts successfully`);
      return result;
    });
  }
}