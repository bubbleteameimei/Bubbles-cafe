import { Router, Request, Response } from 'express';
import { db } from '../db';
import { comments } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

export function registerCommentsRoutes() {
  const router = Router();

  /**
   * GET /api/comments?postId=:postId
   * Get comments for a post
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.query.postId as string);
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
   * POST /api/comments
   * Create new comment
   */
  router.post('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { postId, content, parentId } = req.body;

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

  /**
   * PATCH /api/comments/:id
   * Update comment
   */
  router.patch('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

      if (!comment.length) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment[0].userId !== userId && !(req as any).user.isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const updated = await db
        .update(comments)
        .set({
          content: content ?? comment[0].content,
          edited: true,
          editedAt: new Date(),
        })
        .where(eq(comments.id, commentId))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  });

  /**
   * DELETE /api/comments/:id
   * Delete comment
   */
  router.delete('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const commentId = parseInt(req.params.id);

      const comment = await db
        .select()
        .from(comments)
        .where(eq(comments.id, commentId))
        .limit(1);

      if (!comment.length) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment[0].userId !== userId && !(req as any).user.isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await db.delete(comments).where(eq(comments.id, commentId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  return router;
}
