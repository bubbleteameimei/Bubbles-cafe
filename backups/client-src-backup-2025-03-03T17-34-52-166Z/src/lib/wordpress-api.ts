import { z } from "zod";

// WordPress post schema
export const wpPostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.object({
    rendered: z.string()
  }),
  content: z.object({
    rendered: z.string()
  }),
  excerpt: z.object({
    rendered: z.string()
  }),
  date: z.string(),
  modified: z.string(),
  author: z.number(),
});

export type WordPressPost = z.infer<typeof wpPostSchema>;

const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

export async function fetchPosts(page = 1, perPage = 10) {
  console.log(`Fetching WordPress posts - page: ${page}, perPage: ${perPage}`);
  try {
    const response = await fetch(
      `${WP_API_URL}/posts?page=${page}&per_page=${perPage}&_embed`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch posts from WordPress: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`Successfully fetched ${posts.length} posts from WordPress`);

    const totalPages = Number(response.headers.get('X-WP-TotalPages') || 1);

    const parsedPosts = z.array(wpPostSchema).parse(posts);
    return {
      posts: parsedPosts,
      hasMore: page < totalPages
    };
  } catch (error) {
    console.error('Error fetching WordPress posts:', error);
    throw error;
  }
}

export async function fetchPost(slug: string) {
  console.log(`Fetching WordPress post with slug: ${slug}`);
  try {
    const response = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed`);

    if (!response.ok) {
      throw new Error(`Failed to fetch post from WordPress: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`Found ${posts.length} posts matching slug: ${slug}`);

    if (!posts.length) {
      return null;
    }

    const parsedPost = wpPostSchema.parse(posts[0]);
    return parsedPost;
  } catch (error) {
    console.error(`Error fetching WordPress post with slug ${slug}:`, error);
    throw error;
  }
}