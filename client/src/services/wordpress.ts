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
  // Step 1: Remove all WordPress blocks and unwanted content
  let sanitized = content
    // Remove all variations of latest posts and query blocks
    .replace(/<!-- wp:(?:latest-posts|query|post-template|post-content|post-excerpt|post-title|post-date|post-terms)[^>]*?-->([\s\S]*?)<!-- \/wp:(?:latest-posts|query|post-template|post-content|post-excerpt|post-title|post-date|post-terms) -->/g, '')
    .replace(/<(?:div|ul|ol|section|nav)[^>]*?(?:latest|recent|blog)-(?:posts|entries|articles)[^>]*?>[\s\S]*?<\/(?:div|ul|ol|section|nav)>/g, '')
    .replace(/<(?:div|ul|ol)[^>]*?post-(?:grid|list|carousel|template)[^>]*?>[\s\S]*?<\/(?:div|ul|ol)>/g, '')

    // Remove all variations of social/sharing blocks
    .replace(/<!-- wp:(?:social|share|follow)[^>]*?-->([\s\S]*?)<!-- \/wp:(?:social|share|follow) -->/g, '')
    .replace(/<(?:div|ul|nav)[^>]*?(?:social|share|follow)-(?:links|icons|buttons|nav)[^>]*?>[\s\S]*?<\/(?:div|ul|nav)>/g, '')
    .replace(/<div[^>]*?(?:sharedaddy|jetpack-sharing|jp-sharing|jp-relatedposts)[^>]*?>[\s\S]*?<\/div>/g, '')

    // Remove any remaining WordPress blocks and shortcodes
    .replace(/<!-- wp:[^>]*?-->([\s\S]*?)<!-- \/wp:[^>]*? -->/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[[^\]]+\]/g, '');

  // Step 2: Remove all non-story HTML elements
  sanitized = sanitized
    // Remove all container elements except paragraphs
    .replace(/<(?:div|section|article|aside|nav|header|footer)[^>]*?>[\s\S]*?<\/(?:div|section|article|aside|nav|header|footer)>/g, '')
    // Remove media elements
    .replace(/<(?:img|figure|video|audio|iframe|embed|object)[^>]*?>[\s\S]*?<\/(?:img|figure|video|audio|iframe|embed|object)>/g, '')
    // Remove links and interactive elements
    .replace(/<(?:a|button|input|select|textarea)[^>]*?>[\s\S]*?<\/(?:a|button|input|select|textarea)>/g, '')
    // Remove decorative elements
    .replace(/<(?:svg|i|span)[^>]*?>[\s\S]*?<\/(?:svg|i|span)>/g, '');

  // Step 3: Keep only essential story formatting
  const allowedTags = ['p', 'strong', 'em', 'i', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
  sanitized = sanitized
    .replace(new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\\b)[^>]+>`, 'g'), '')
    .replace(/<(h[1-6])[^>]*>(.*?)<\/\1>/g, '\n\n$2\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<p>\s*<\/p>/g, '');

  // Step 4: Clean up special characters and whitespace
  sanitized = sanitized
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '—')
    .replace(/&#8216;|&lsquo;/g, "'")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&#8230;|&hellip;/g, '...')
    .replace(/[\t\r\f\v]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();

  // Final formatting
  return sanitized
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
};

export async function fetchWordPressPosts(page = 1): Promise<WordPressPost[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: POSTS_PER_PAGE.toString(),
      orderby: 'date',
      order: 'desc',
      _fields: 'id,date,title,content,excerpt,slug',
      exclude_blocks: [
        'core/query',
        'core/post-template',
        'core/post-content',
        'core/post-excerpt',
        'core/post-title',
        'core/post-date',
        'core/post-terms',
        'core/latest-posts',
        'core/social-links',
        'core/social-icons',
        'core/sharing',
        'core/follow',
        'core/buttons',
        'core/media-text',
        'core/image',
        'core/gallery',
        'core/embed',
        'core/navigation',
        'core/site-logo',
        'core/post-navigation',
        'core/comments',
        'core/related-posts'
      ].join(',')
    });

    const response = await fetch(`${WORDPRESS_API_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch WordPress posts: ${response.status}`);
    }

    const posts = await response.json();
    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format from WordPress API');
    }

    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    if (page < totalPages && page * POSTS_PER_PAGE < MAX_POSTS) {
      const nextPosts = await fetchWordPressPosts(page + 1);
      return [...posts, ...nextPosts].slice(0, MAX_POSTS);
    }

    return posts;
  } catch (error) {
    throw error;
  }
}

export function convertWordPressPost(wpPost: WordPressPost): Partial<Post> {
  try {
    if (!wpPost.title?.rendered || !wpPost.content?.rendered || !wpPost.slug) {
      throw new Error(`Invalid post data: Missing required fields for post ${wpPost.id}`);
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
    throw error;
  }
}