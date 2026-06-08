import { Router, Request, Response } from 'express';
import { db } from '../db';
import { bookmarks, posts, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

export function registerBookmarksRoutes() {
  const router = Router();

  /**
   * GET /api/bookmarks
   * Get all bookmarks for the authenticated user
   */
  router.get('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      const userBookmarks = await db
        .select({
          id: bookmarks.id,
          postId: bookmarks.postId,
          notes: bookmarks.notes,
          lastPosition: bookmarks.lastPosition,
          tags: bookmarks.tags,
          createdAt: bookmarks.createdAt,
          post: {
            id: posts.id,
            title: posts.title,
            excerpt: posts.excerpt,
            slug: posts.slug,
            themeCategory: posts.themeCategory,
            createdAt: posts.createdAt,
            readingTimeMinutes: posts.readingTimeMinutes,
          },
        })
        .from(bookmarks)
        .leftJoin(posts, eq(bookmarks.postId, posts.id))
        .where(eq(bookmarks.userId, userId))
        .orderBy(desc(bookmarks.createdAt));

      res.json({ bookmarks: userBookmarks });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  });

  /**
   * GET /api/bookmarks/check/:postId
   * Check if a post is bookmarked
   */
  router.get('/check/:postId', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.postId);

      const existing = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
        .limit(1);

      res.json({ bookmarked: existing.length > 0, bookmark: existing[0] || null });
    } catch (error) {
      console.error('Error checking bookmark:', error);
      res.status(500).json({ error: 'Failed to check bookmark' });
    }
  });

  /**
   * POST /api/bookmarks
   * Add a bookmark
   */
  router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { postId, notes, tags } = req.body;

      if (!postId) return res.status(400).json({ error: 'postId is required' });

      // Check if already bookmarked
      const existing = await db
        .select()
        .from(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Already bookmarked', bookmark: existing[0] });
      }

      const newBookmark = await db
        .insert(bookmarks)
        .values({ userId, postId, notes: notes || null, tags: tags || null, lastPosition: '0' })
        .returning();

      res.status(201).json(newBookmark[0]);
    } catch (error) {
      console.error('Error creating bookmark:', error);
      res.status(500).json({ error: 'Failed to create bookmark' });
    }
  });

  /**
   * PATCH /api/bookmarks/:id
   * Update a bookmark (notes, tags, position)
   */
  router.patch('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const bookmarkId = parseInt(req.params.id);
      const { notes, tags, lastPosition } = req.body;

      const bookmark = await db.select().from(bookmarks).where(eq(bookmarks.id, bookmarkId)).limit(1);
      if (!bookmark.length) return res.status(404).json({ error: 'Bookmark not found' });
      if (bookmark[0].userId !== userId) return res.status(403).json({ error: 'Not authorized' });

      const updated = await db
        .update(bookmarks)
        .set({
          notes: notes !== undefined ? notes : bookmark[0].notes,
          tags: tags !== undefined ? tags : bookmark[0].tags,
          lastPosition: lastPosition !== undefined ? lastPosition : bookmark[0].lastPosition,
        })
        .where(eq(bookmarks.id, bookmarkId))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating bookmark:', error);
      res.status(500).json({ error: 'Failed to update bookmark' });
    }
  });

  /**
   * DELETE /api/bookmarks/:id
   * Remove a bookmark by ID
   */
  router.delete('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const bookmarkId = parseInt(req.params.id);

      const bookmark = await db.select().from(bookmarks).where(eq(bookmarks.id, bookmarkId)).limit(1);
      if (!bookmark.length) return res.status(404).json({ error: 'Bookmark not found' });
      if (bookmark[0].userId !== userId) return res.status(403).json({ error: 'Not authorized' });

      await db.delete(bookmarks).where(eq(bookmarks.id, bookmarkId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      res.status(500).json({ error: 'Failed to delete bookmark' });
    }
  });

  /**
   * DELETE /api/bookmarks/post/:postId
   * Remove a bookmark by postId
   */
  router.delete('/post/:postId', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.postId);

      await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      res.status(500).json({ error: 'Failed to delete bookmark' });
    }
  });

  return router;
}
