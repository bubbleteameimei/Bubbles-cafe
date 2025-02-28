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

export async function fetchWordPressPosts(page = 1, perPage = 10): Promise<WordPressPost[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_URL}?page=${page}&per_page=${perPage}`);
    if (!response.ok) {
      throw new Error('Failed to fetch WordPress posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    throw error;
  }
}

export function convertWordPressPost(wpPost: WordPressPost): Partial<Post> {
  return {
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    excerpt: wpPost.excerpt.rendered,
    slug: wpPost.slug,
    createdAt: new Date(wpPost.date),
    metadata: {
      wordpressId: wpPost.id,
      modified: wpPost.modified,
      status: wpPost.status,
      type: wpPost.type,
      originalAuthor: wpPost.author,
      featuredMedia: wpPost.featured_media,
      categories: wpPost.categories,
    }
  };
}
