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
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: POSTS_PER_PAGE.toString(),
      orderby: 'date',
      order: 'desc',
      _fields: 'id,date,title,content,excerpt,slug',
      exclude_blocks: [
        'core/paragraph', // Keep only raw paragraph content
        'core/social-links',
        'core/buttons',
        'core/media-text',
        'core/image',
        'core/gallery',
        'core/embed',
        'core/navigation',
        'core/site-logo',
        'core/post-navigation',
        'core/comments',
        'core/latest-posts',
        'core/archives',
        'core/categories',
        'core/file',
        'core/html',
        'core/preformatted',
        'core/pullquote',
        'core/table',
        'core/verse',
        'core/video',
        'core/audio',
        'core/cover',
        'core/columns',
        'core/group',
        'core/more',
        'core/nextpage',
        'core/separator',
        'core/spacer',
        'core/social',
        'core/sharing',
        'core/related-posts'
      ].join(',')
    });

    const response = await fetch(`${WORDPRESS_API_URL}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch WordPress posts: ${response.statusText}`);
    }

    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const posts = await response.json();

    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format from WordPress API');
    }

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