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
      },
      timeout: 10000 // 10 second timeout
    };
    
    // Fetch with more detailed logging
    console.log(`[WordPress Service] Sending request to WordPress API...`);
    const response = await fetch(url, options);
    console.log(`[WordPress Service] Received response: ${response.status} ${response.statusText}`);

    // Handle non-OK responses
    if (!response.ok) {
      console.error(`[WordPress Service] API Error: ${response.status} ${response.statusText}`);
      
      // Log response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log(`[WordPress Service] Response headers:`, headers);
      
      // Return fallback data so the site continues to function
      return [];
    }

    // Parse response
    const posts = await response.json();
    console.log(`[WordPress Service] Received ${Array.isArray(posts) ? posts.length : 'non-array'} response`);

    // Validate response format
    if (!Array.isArray(posts)) {
      console.error('[WordPress Service] Invalid response format (not an array):', typeof posts);
      return [];
    }

    // Return successfully parsed posts
    return posts;
  } catch (error) {
    console.error('[WordPress Service] Fetch error:', error);
    // Return empty array so UI doesn't break
    return [];
  }
}

export function convertWordPressPost(wpPost: WordPressPost): Partial<Post> {
  try {
    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      console.error(`[WordPress Service] Invalid post data: Missing required fields for post ${wpPost.id}`);
      return {
        id: wpPost.id || Math.floor(Math.random() * 10000),
        title: wpPost.title?.rendered?.trim() || 'Untitled Story',
        content: wpPost.content?.rendered || 'Content unavailable',
        excerpt: 'No excerpt available',
        slug: wpPost.slug || `untitled-${Date.now()}`,
        createdAt: wpPost.date ? new Date(wpPost.date) : new Date()
      };
    }

    const sanitizedContent = sanitizeHTML(wpPost.content.rendered);
    const excerpt = wpPost.excerpt?.rendered
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