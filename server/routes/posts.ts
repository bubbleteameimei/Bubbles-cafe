import { Router, Request, Response } from 'express';
import { db } from '../db';
import { posts, users, analytics, comments } from '@shared/schema';
import { eq, desc, and, asc, sql } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

// Admin "unpublish"/"hide" set metadata.status; keep those out of public listings.
const isPubliclyVisible = sql`coalesce(${posts.metadata}->>'status', 'publish') not in ('draft', 'hidden', 'pending')`;

const PUBLIC_LIST_CACHE = 'public, max-age=30, stale-while-revalidate=300';

export function registerPostsRoutes() {
  const router = Router();

  /**
   * GET /api/posts
   * List all published posts (non-secret)
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 500);
      const page = Math.max(parseInt(req.query.page as string) || 0, 0);
      const offset = page > 0 ? (page - 1) * limit : parseInt(req.query.offset as string) || 0;
      const sort = (req.query.sort as string) || 'date';
      const order = (req.query.order as string) || 'desc';

      let query = db.select().from(posts).where(and(eq(posts.isSecret, false), isPubliclyVisible));

      if (sort === 'likes') {
        query = query.orderBy(order === 'asc' ? asc(posts.likesCount) : desc(posts.likesCount)) as any;
      } else {
        query = query.orderBy(order === 'asc' ? asc(posts.createdAt) : desc(posts.createdAt)) as any;
      }

      // Fetch one extra row to know whether another page exists.
      const rows = await (query as any).limit(limit + 1).offset(offset);
      const hasMore = rows.length > limit;
      const allPosts = hasMore ? rows.slice(0, limit) : rows;
      // Public catalogue: let browsers reuse it briefly instead of refetching on every
      // navigation. New stories still show up within a minute.
      res.set('Cache-Control', PUBLIC_LIST_CACHE);
      res.json({ posts: allPosts, total: allPosts.length, page: page || 1, hasMore });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  /**
   * GET /api/posts/community
   * Community posts — user-created posts (not WordPress/admin imports)
   */
  router.get('/community', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 500);
      const page = parseInt(req.query.page as string) || 1;
      const offset = (page - 1) * limit;
      const sort = (req.query.sort as string) || 'date';
      const order = (req.query.order as string) || 'desc';
      const category = req.query.category as string;

      let baseWhere: any = and(
        eq(posts.isSecret, false),
        eq(posts.isAdminPost, false),
        isPubliclyVisible
      );

      if (category && category !== 'all') {
        baseWhere = and(baseWhere, eq(posts.themeCategory, category));
      }

      let query = db.select().from(posts).where(baseWhere);

      if (sort === 'likes') {
        query = query.orderBy(order === 'asc' ? asc(posts.likesCount) : desc(posts.likesCount)) as any;
      } else {
        query = query.orderBy(order === 'asc' ? asc(posts.createdAt) : desc(posts.createdAt)) as any;
      }

      const communityPosts = await (query as any).limit(limit).offset(offset);

      // Get total count for pagination
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(and(eq(posts.isSecret, false), eq(posts.isAdminPost, false), isPubliclyVisible));

      const totalPosts = Number(countResult[0]?.count || 0);

      res.json({
        posts: communityPosts,
        totalPosts,
        page,
        hasMore: offset + communityPosts.length < totalPosts,
      });
    } catch (error) {
      console.error('Error fetching community posts:', error);
      res.status(500).json({ error: 'Failed to fetch community posts' });
    }
  });

  /**
   * GET /api/posts/:id
   * Get single post by ID or slug
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const idOrSlug = req.params.id;
      const isNumeric = /^\d+$/.test(idOrSlug);

      const post = await db
        .select()
        .from(posts)
        .where(and(isNumeric ? eq(posts.id, parseInt(idOrSlug)) : eq(posts.slug, idOrSlug), isPubliclyVisible))
        .limit(1);

      if (!post.length) return res.status(404).json({ error: 'Post not found' });
      res.set('Cache-Control', PUBLIC_LIST_CACHE);
      res.json(post[0]);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  /**
   * POST /api/posts
   * Create new post (requires auth)
   */
  router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { title, content, excerpt, slug, themeCategory, matureContent, isSecret } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'title and content are required' });
      }

      // Auto-generate slug if not provided
      const finalSlug = slug || title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100) + '-' + Date.now();

      // Check slug uniqueness
      const existing = await db.select().from(posts).where(eq(posts.slug, finalSlug)).limit(1);
      if (existing.length) {
        return res.status(400).json({ error: 'Slug already exists, please use a different title.' });
      }

      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      const newPost = await db
        .insert(posts)
        .values({
          title,
          content,
          excerpt: excerpt || content.substring(0, 300).replace(/<[^>]+>/g, '') + '...',
          slug: finalSlug,
          authorId: userId,
          themeCategory: themeCategory || null,
          matureContent: matureContent || false,
          isSecret: isSecret || false,
          isAdminPost: false,
          readingTimeMinutes: readingTime,
          metadata: { source: 'user_created' },
        })
        .returning();

      res.status(201).json(newPost[0]);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  /**
   * PATCH /api/posts/:id
   * Update post (author or admin only)
   */
  router.patch('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);
      const { title, content, excerpt, themeCategory, matureContent, isSecret } = req.body;

      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length) return res.status(404).json({ error: 'Post not found' });
      if (post[0].authorId !== userId && !(req as any).user.isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updated = await db
        .update(posts)
        .set({
          title: title ?? post[0].title,
          content: content ?? post[0].content,
          excerpt: excerpt ?? post[0].excerpt,
          themeCategory: themeCategory ?? post[0].themeCategory,
          matureContent: matureContent ?? post[0].matureContent,
          isSecret: isSecret ?? post[0].isSecret,
        })
        .where(eq(posts.id, postId))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  });

  /**
   * DELETE /api/posts/:id
   * Delete post (author or admin only)
   */
  router.delete('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);

      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length) return res.status(404).json({ error: 'Post not found' });
      if (post[0].authorId !== userId && !(req as any).user.isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await db.delete(posts).where(eq(posts.id, postId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  });

  // Comment endpoints for posts live in routes/comments.ts (mounted at /api).

  return router;
}
