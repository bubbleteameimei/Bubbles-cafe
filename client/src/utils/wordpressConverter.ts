
import type { ExtendedPost as Post } from '@shared/types/public';
import { WordPressPost } from '../services/wordpress';

// Extend WordPressPost interface to include missing properties
// and convert into our UI-friendly Post type
export function convertWordPressPost(wpPost: WordPressPost): Post {
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    excerpt: wpPost.excerpt.rendered,
    slug: wpPost.slug,
    metadata: {
      wordpressId: wpPost.id,
      modified: wpPost.modified,
      status: wpPost.status as 'publish',
      type: wpPost.type,
      originalAuthor: wpPost.author,
      featuredMedia: wpPost.featured_media,
      categories: wpPost.categories,
    },
    createdAt: new Date(wpPost.date).toISOString(),
  };
}

// Validate post data before saving (client-safe noop)
export function validateWordPressPost(_post: Partial<Post>): boolean {
  return true;
}