import { createSecureLogger } from '../utils/secure-logger';
import { AppError, ValidationError, NotFoundError, createError } from '../utils/error-handler';
import { db } from "../db";
import { posts, users, postLikes, type Post, type InsertPost } from "@shared/schema";
import { eq, sql, desc, asc, like, and, or } from "drizzle-orm";

const postLogger = createSecureLogger('PostService');

export interface GetPostsOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  authorId?: number;
  includeSecret?: boolean;
  sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}

export class PostService {
  async getPost(id: number, includeContent: boolean = true): Promise<Post | null> {
    try {
      const selectFields: any = {
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
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
      };

      const [post] = await db.select(selectFields)
        .from(posts)
        .where(eq(posts.id, id))
        .limit(1);

      return (post as unknown as Post) || null;
    } catch (error) {
      postLogger.error('Error fetching post by ID', { postId: id, error });
      throw handleDatabaseError(error);
    }
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
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
      })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      return post || null;
    } catch (error) {
      postLogger.error('Error fetching post by slug', { slug, error });
      throw handleDatabaseError(error);
    }
  }

  async getPosts(options: GetPostsOptions = {}): Promise<{ posts: Post[]; total: number; hasMore: boolean }> {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      authorId,
      includeSecret = false,
      sortBy = 'newest'
    } = options;

    const safeLimit = Math.min(limit, 50);
    const offset = (page - 1) * safeLimit;

    try {
      const conditions = [] as any[];
      if (!includeSecret) conditions.push(eq(posts.isSecret, false));
      if (category) conditions.push(eq(posts.themeCategory, category));
      if (search) {
        conditions.push(or(
          like(posts.title, `%${search}%`),
          like(posts.content, `%${search}%`),
          like(posts.excerpt, `%${search}%`)
        ));
      }
      if (authorId) conditions.push(eq(posts.authorId, authorId));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let orderClause;
      switch (sortBy) {
        case 'oldest':
          orderClause = asc(posts.createdAt);
          break;
        case 'popular':
          orderClause = desc(posts.likesCount);
          break;
        case 'trending':
          orderClause = desc(sql`${posts.likesCount} + EXTRACT(EPOCH FROM (NOW() - ${posts.createdAt})) / 86400`);
          break;
        default:
          orderClause = desc(posts.createdAt);
      }

      const [postsData, totalResult] = await Promise.all([
        db.select({
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
        })
          .from(posts)
          .where(whereClause)
          .orderBy(orderClause)
          .limit(safeLimit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(whereClause)
      ]);

      const total = totalResult[0].count;
      const hasMore = offset + safeLimit < total;

      postLogger.debug('Posts fetched successfully', { page, limit: safeLimit, total, hasMore, category, search: search ? '[SEARCH]' : undefined });

      return { posts: postsData, total, hasMore };
    } catch (error) {
      postLogger.error('Error fetching posts', { options, error });
      throw handleDatabaseError(error);
    }
  }

  async createPost(postData: InsertPost): Promise<Post> {
    try {
      // Generate slug if not provided
      if (!postData.slug) {
        postData.slug = this.generateSlug(postData.title);
      }

      // Ensure slug is unique
      postData.slug = await this.ensureUniqueSlug(postData.slug);

      // Estimate reading time if not provided
      if (!postData.readingTimeMinutes && postData.content) {
        postData.readingTimeMinutes = this.estimateReadingTime(postData.content);
      }

      const [newPost] = await db.insert(posts).values({
        ...postData,
        metadata: postData.metadata || {},
        likesCount: 0,
        dislikesCount: 0
      }).returning();

      postLogger.info('Post created successfully', { postId: newPost.id });
      return newPost;
    } catch (error) {
      postLogger.error('Error creating post', { error });
      throw handleDatabaseError(error);
    }
  }

  async updatePost(id: number, postData: Partial<InsertPost>): Promise<Post> {
    try {
      const existingPost = await this.getPost(id, false);
      if (!existingPost) {
        throw createError.notFound('Post not found');
      }
      if (postData.content && !postData.readingTimeMinutes) {
        postData.readingTimeMinutes = this.estimateReadingTime(postData.content);
      }
      const existingMetadata = (existingPost.metadata as Record<string, any>) || {};
      const mergedMetadata = postData.metadata ? { ...existingMetadata, ...(postData.metadata as any) } : existingMetadata;
      const [updatedPost] = await db.update(posts)
        .set({
          ...postData,
          metadata: mergedMetadata
        })
        .where(eq(posts.id, id))
        .returning();
      postLogger.info('Post updated successfully', { postId: id });
      return updatedPost as unknown as Post;
    } catch (error) {
      postLogger.error('Error updating post', { postId: id, error });
      throw handleDatabaseError(error);
    }
  }

  async deletePost(id: number): Promise<void> {
    try {
      const existingPost = await this.getPost(id, false);
      if (!existingPost) {
        throw createError.notFound('Post not found');
      }
      await db.delete(posts).where(eq(posts.id, id));
      postLogger.info('Post deleted successfully', { postId: id });
    } catch (error) {
      postLogger.error('Error deleting post', { postId: id, error });
      throw handleDatabaseError(error);
    }
  }

  async getPostCount(includeSecret: boolean = false): Promise<number> {
    try {
      const whereClause = includeSecret ? undefined : eq(posts.isSecret, false);
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(whereClause);
      return result.count;
    } catch (error) {
      postLogger.error('Error getting post count', { error });
      throw handleDatabaseError(error);
    }
  }

  async getPopularPosts(limit: number = 10): Promise<Post[]> {
    try {
      const popularPosts = await db.select({
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
      })
        .from(posts)
        .where(eq(posts.isSecret, false))
        .orderBy(desc(posts.likesCount))
        .limit(Math.min(limit, 20));

      return popularPosts;
    } catch (error) {
      postLogger.error('Error fetching popular posts', { error });
      throw handleDatabaseError(error);
    }
  }

  async getRelatedPosts(postId: number, limit: number = 5): Promise<Post[]> {
    try {
      const currentPost = await this.getPost(postId, false);
      if (!currentPost) return [];
      const relatedPosts = await db.select({
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
      })
        .from(posts)
        .where(
          and(
            eq(posts.isSecret, false),
            sql`${posts.id} != ${postId}`,
            or(
              eq(posts.themeCategory, currentPost.themeCategory || ''),
              eq(posts.authorId, currentPost.authorId)
            )
          )
        )
        .orderBy(desc(posts.createdAt))
        .limit(Math.min(limit, 10));

      return relatedPosts;
    } catch (error) {
      postLogger.error('Error fetching related posts', { postId, error });
      return [];
    }
  }

  async updatePostReaction(postId: number, isLike: boolean, increment: boolean = true): Promise<void> {
    try {
      const field = isLike ? 'likesCount' : 'dislikesCount';
      const operation = increment ? sql`${posts[field]} + 1` : sql`${posts[field]} - 1`;

      await db.update(posts)
        .set({ [field]: operation })
        .where(eq(posts.id, postId));

      postLogger.debug('Post reaction updated', { postId, isLike, increment });
    } catch (error) {
      postLogger.error('Error updating post reaction', { postId, error });
      throw handleDatabaseError(error);
    }
  }

  // Helper: Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  // Helper: Ensure slug is unique
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await db.select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existing.length === 0) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  estimateReadingTime(content: string): number {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }
}

// Export singleton instance
export const postService = new PostService();

// Shared DB error handler used by other services
export function handleDatabaseError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error('Database operation failed');
}