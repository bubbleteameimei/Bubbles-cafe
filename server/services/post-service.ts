import { db } from "../db";
import { posts, users } from "../../shared/schema";
import { eq, sql, desc, like } from "drizzle-orm";

import { postLogger } from '../utils/debug-logger';
import { handleDatabaseError } from '../utils/error-handler';

// Define proper return types for different query contexts
type PostWithAuthor = {
  id: number;
  title: string;
  content: string;
  excerpt: string | null;
  slug: string;
  authorId: number;
  isSecret: boolean;
  isAdminPost: boolean | null;
  matureContent: boolean;
  themeCategory: string | null;
  readingTimeMinutes: number | null;
  likesCount: number | null;
  dislikesCount: number | null;
  metadata: unknown;
  createdAt: Date;
  authorName: string | null;
  authorEmail: string | null;
};

type PostSummaryWithAuthor = Omit<PostWithAuthor, 'content'> & {
  content?: string;
};

interface GetPostsOptions {
  page?: number;
  limit?: number;
  authorId?: number;
  isSecret?: boolean;
  includeContent?: boolean;
  category?: string;
  search?: string;
}

export class PostService {
  // Get post by ID with optional content inclusion
  async getPostById(id: number, includeContent: boolean = true): Promise<PostWithAuthor | PostSummaryWithAuthor | null> {
    try {
      const selectFields = {
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        authorId: posts.authorId,
        isSecret: posts.isSecret,
        isAdminPost: posts.isAdminPost,
        matureContent: posts.matureContent,
        themeCategory: posts.themeCategory,
        readingTimeMinutes: posts.readingTimeMinutes,
        likesCount: posts.likesCount,
        dislikesCount: posts.dislikesCount,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        authorName: users.username,
        authorEmail: users.email,
        ...(includeContent ? { content: posts.content } : {})
      };

      const [post] = await db.select(selectFields)
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.id, id))
        .limit(1);

      if (!post) return null;

      if (includeContent) {
        return post as PostWithAuthor;
      } else {
        return post as PostSummaryWithAuthor;
      }
    } catch (error) {
      postLogger.error('Error fetching post by ID', { postId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get post by slug
  async getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
    try {
      const [post] = await db.select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        excerpt: posts.excerpt,
        slug: posts.slug,
        authorId: posts.authorId,
        isSecret: posts.isSecret,
        isAdminPost: posts.isAdminPost,
        matureContent: posts.matureContent,
        themeCategory: posts.themeCategory,
        readingTimeMinutes: posts.readingTimeMinutes,
        likesCount: posts.likesCount,
        dislikesCount: posts.dislikesCount,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        authorName: users.username,
        authorEmail: users.email
      })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.slug, slug))
        .limit(1);

      return post || null;
    } catch (error) {
      postLogger.error('Error fetching post by slug', { slug, error });
      throw handleDatabaseError(error);
    }
  }

  // Get posts with proper typing
  async getPosts(options: GetPostsOptions = {}): Promise<{ posts: PostSummaryWithAuthor[]; total: number; hasMore: boolean }> {
    try {
      const { page = 1, limit = 10, authorId, isSecret, includeContent = false, category, search } = options;
      const offset = (page - 1) * limit;

      // Build WHERE conditions
      const conditions = [];
      if (authorId !== undefined) {
        conditions.push(eq(posts.authorId, authorId));
      }
      if (isSecret !== undefined) {
        conditions.push(eq(posts.isSecret, isSecret));
      }
      if (category) {
        conditions.push(eq(posts.themeCategory, category));
      }
      if (search) {
        conditions.push(
          like(posts.title, `%${search}%`),
          like(posts.content, `%${search}%`),
          like(posts.excerpt, `%${search}%`)
        );
      }

      const selectFields = {
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        authorId: posts.authorId,
        isSecret: posts.isSecret,
        isAdminPost: posts.isAdminPost,
        matureContent: posts.matureContent,
        themeCategory: posts.themeCategory,
        readingTimeMinutes: posts.readingTimeMinutes,
        likesCount: posts.likesCount,
        dislikesCount: posts.dislikesCount,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        authorName: users.username,
        ...(includeContent ? { content: posts.content } : {})
      };

      // Get posts
      let query = db.select(selectFields)
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .orderBy(desc(posts.createdAt));

      if (conditions.length > 0) {
        query = query.where(sql`(${sql.join(conditions, sql` OR `)})`) as any;
      }

      const postsData = await query
        .limit(limit)
        .offset(offset);

      // Get total count
      let countQuery = db.select({ count: sql<number>`count(*)` }).from(posts);
      if (conditions.length > 0) {
        countQuery = countQuery.where(sql`(${sql.join(conditions, sql` OR `)})`) as any;
      }
      const [{ count }] = await countQuery;

      return {
        posts: postsData as PostSummaryWithAuthor[],
        total: count,
        hasMore: offset + limit < count
      };
    } catch (error) {
      postLogger.error('Error fetching posts', { options, error });
      throw handleDatabaseError(error);
    }
  }

  // Create post
  async createPost(postData: any): Promise<PostWithAuthor> {
    try {
      const [newPost] = await db.insert(posts)
        .values(postData)
        .returning();

      // Fetch the complete post with author information
      const completePost = await this.getPostById(newPost.id, true);
      if (!completePost) {
        throw new Error('Failed to fetch created post');
      }

      postLogger.info('Post created successfully', { postId: newPost.id, title: postData.title });
      return completePost as PostWithAuthor;
    } catch (error) {
      postLogger.error('Error creating post', { postData, error });
      throw handleDatabaseError(error);
    }
  }

  // Update post
  async updatePost(id: number, postData: Partial<any>): Promise<PostWithAuthor | null> {
    try {
      // Get existing post to merge metadata properly
      const existingPost = await this.getPostById(id, true);
      if (!existingPost) {
        return null;
      }

      // Merge metadata if provided
      const updatedData = {
        ...postData,
        metadata: postData.metadata ? 
          { ...(existingPost.metadata as Record<string, unknown> || {}), ...postData.metadata } : 
          existingPost.metadata
      };

      const [updatedPost] = await db.update(posts)
        .set(updatedData)
        .where(eq(posts.id, id))
        .returning();

      if (!updatedPost) {
        return null;
      }

      // Fetch the complete updated post with author information
      const completePost = await this.getPostById(id, true);
      postLogger.info('Post updated successfully', { postId: id });
      return completePost as PostWithAuthor;
    } catch (error) {
      postLogger.error('Error updating post', { postId: id, postData, error });
      throw handleDatabaseError(error);
    }
  }

  // Delete post
  async deletePost(id: number): Promise<boolean> {
    try {
      const [deletedPost] = await db.delete(posts)
        .where(eq(posts.id, id))
        .returning({ id: posts.id });

      const success = !!deletedPost;
      if (success) {
        postLogger.info('Post deleted successfully', { postId: id });
      }

      return success;
    } catch (error) {
      postLogger.error('Error deleting post', { postId: id, error });
      throw handleDatabaseError(error);
    }
  }

  // Get popular posts
  async getPopularPosts(limit: number = 10): Promise<PostSummaryWithAuthor[]> {
    try {
      const popularPosts = await db.select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        authorId: posts.authorId,
        isSecret: posts.isSecret,
        isAdminPost: posts.isAdminPost,
        matureContent: posts.matureContent,
        themeCategory: posts.themeCategory,
        readingTimeMinutes: posts.readingTimeMinutes,
        likesCount: posts.likesCount,
        dislikesCount: posts.dislikesCount,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        authorName: users.username
      })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.isSecret, false))
        .orderBy(desc(posts.likesCount))
        .limit(limit);

      return popularPosts as PostSummaryWithAuthor[];
    } catch (error) {
      postLogger.error('Error fetching popular posts', { limit, error });
      throw handleDatabaseError(error);
    }
  }

  // Get related posts
  async getRelatedPosts(postId: number, themeCategory: string | null, limit: number = 5): Promise<PostSummaryWithAuthor[]> {
    try {
      const conditions = [
        eq(posts.isSecret, false),
        sql`${posts.id} != ${postId}`
      ];

      if (themeCategory) {
        conditions.push(eq(posts.themeCategory, themeCategory));
      }

      const relatedPosts = await db.select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        slug: posts.slug,
        authorId: posts.authorId,
        isSecret: posts.isSecret,
        isAdminPost: posts.isAdminPost,
        matureContent: posts.matureContent,
        themeCategory: posts.themeCategory,
        readingTimeMinutes: posts.readingTimeMinutes,
        likesCount: posts.likesCount,
        dislikesCount: posts.dislikesCount,
        metadata: posts.metadata,
        createdAt: posts.createdAt,
        authorName: users.username
      })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(sql`(${sql.join(conditions, sql` AND `)})`)
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      return relatedPosts as PostSummaryWithAuthor[];
    } catch (error) {
      postLogger.error('Error fetching related posts', { postId, themeCategory, error });
      throw handleDatabaseError(error);
    }
  }

  // Get post count by author
  async getPostCountByAuthor(authorId: number): Promise<number> {
    try {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.authorId, authorId));

      return count;
    } catch (error) {
      postLogger.error('Error fetching post count by author', { authorId, error });
      throw handleDatabaseError(error);
    }
  }

  // Get posts by theme category
  async getPostsByCategory(category: string, page: number = 1, limit: number = 10): Promise<{ posts: PostSummaryWithAuthor[]; total: number; hasMore: boolean }> {
    return this.getPosts({ page, limit, category, isSecret: false });
  }

  // Search posts
  async searchPosts(query: string, page: number = 1, limit: number = 10): Promise<{ posts: PostSummaryWithAuthor[]; total: number; hasMore: boolean }> {
    return this.getPosts({ page, limit, search: query, isSecret: false });
  }
}

// Export a singleton instance
export const postService = new PostService();