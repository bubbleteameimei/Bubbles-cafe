import { Router, Request, Response } from 'express';
import { db } from '../db';
import { posts, users, analytics, comments } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

export function registerPostsRoutes() {
  const router = Router();

  /**
   * GET /api/posts
   * List all published posts
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      const allPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.isSecret, false))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({ posts: allPosts, total: allPosts.length });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  /**
   * GET /api/posts/:id
   * Get single post
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post.length) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json(post[0]);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  /**
   * POST /api/posts
   * Create new post (authenticated + admin or author)
   */
  router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { title, content, excerpt, slug, themeCategory, matureContent } = req.body;

      if (!title || !content || !slug) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check slug uniqueness
      const existing = await db
        .select()
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

      if (existing.length) {
        return res.status(400).json({ error: 'Slug already exists' });
      }

      const newPost = await db
        .insert(posts)
        .values({
          title,
          content,
          excerpt,
          slug,
          authorId: userId,
          themeCategory,
          matureContent: matureContent || false,
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
      const { title, content, excerpt, themeCategory, matureContent } = req.body;

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post.length) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check authorization
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

      const post = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId))
        .limit(1);

      if (!post.length) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check authorization
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

  /**
   * GET /api/posts/:id/comments
   * Get comments for a specific post
   */
  router.get('/:id/comments', async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
      }

      const postComments = await db
        .select()
        .from(comments)
        .where(eq(comments.postId, postId))
        .orderBy(desc(comments.createdAt));

      res.json({ comments: postComments });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  /**
   * POST /api/posts/:id/comments
   * Create new comment on a post
   */
  router.post('/:id/comments', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);
      const { content, parentId } = req.body;

      if (!postId || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newComment = await db
        .insert(comments)
        .values({
          postId,
          content,
          userId,
          parentId: parentId || null,
          is_approved: true,
          metadata: {},
        })
        .returning();

      res.status(201).json(newComment[0]);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  return router;
}
