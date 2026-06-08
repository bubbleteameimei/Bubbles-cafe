import { Router, Request, Response } from 'express';
import { db } from '../db';
import { postLikes, posts } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

export function registerLikesRoutes() {
  const router = Router();

  /**
   * GET /api/posts/:id/like-status
   * Get current user's like status for a post
   */
  router.get('/:id/like-status', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);

      const existing = await db
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1);

      res.json({
        liked: existing.length > 0 && existing[0].isLike === true,
        disliked: existing.length > 0 && existing[0].isLike === false,
      });
    } catch (error) {
      console.error('Error fetching like status:', error);
      res.status(500).json({ error: 'Failed to fetch like status' });
    }
  });

  /**
   * POST /api/posts/:id/like
   * Toggle like on a post
   */
  router.post('/:id/like', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);

      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length) return res.status(404).json({ error: 'Post not found' });

      const existing = await db
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1);

      let likesCount = post[0].likesCount ?? 0;
      let dislikesCount = post[0].dislikesCount ?? 0;
      let isLiked = false;

      if (existing.length > 0) {
        if (existing[0].isLike) {
          // Remove like (toggle off)
          await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
          likesCount = Math.max(0, likesCount - 1);
          isLiked = false;
        } else {
          // Switch from dislike to like
          await db.update(postLikes).set({ isLike: true }).where(eq(postLikes.id, existing[0].id));
          likesCount += 1;
          dislikesCount = Math.max(0, dislikesCount - 1);
          isLiked = true;
        }
      } else {
        // New like
        await db.insert(postLikes).values({ postId, userId, isLike: true });
        likesCount += 1;
        isLiked = true;
      }

      await db.update(posts).set({ likesCount, dislikesCount }).where(eq(posts.id, postId));
      res.json({ likesCount, dislikesCount, isLiked, isDisliked: false });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  });

  /**
   * POST /api/posts/:id/dislike
   * Toggle dislike on a post
   */
  router.post('/:id/dislike', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const postId = parseInt(req.params.id);

      const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post.length) return res.status(404).json({ error: 'Post not found' });

      const existing = await db
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1);

      let likesCount = post[0].likesCount ?? 0;
      let dislikesCount = post[0].dislikesCount ?? 0;
      let isDisliked = false;

      if (existing.length > 0) {
        if (!existing[0].isLike) {
          // Remove dislike (toggle off)
          await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
          dislikesCount = Math.max(0, dislikesCount - 1);
          isDisliked = false;
        } else {
          // Switch from like to dislike
          await db.update(postLikes).set({ isLike: false }).where(eq(postLikes.id, existing[0].id));
          dislikesCount += 1;
          likesCount = Math.max(0, likesCount - 1);
          isDisliked = true;
        }
      } else {
        // New dislike
        await db.insert(postLikes).values({ postId, userId, isLike: false });
        dislikesCount += 1;
        isDisliked = true;
      }

      await db.update(posts).set({ likesCount, dislikesCount }).where(eq(posts.id, postId));
      res.json({ likesCount, dislikesCount, isLiked: false, isDisliked });
    } catch (error) {
      console.error('Error toggling dislike:', error);
      res.status(500).json({ error: 'Failed to toggle dislike' });
    }
  });

  return router;
}
