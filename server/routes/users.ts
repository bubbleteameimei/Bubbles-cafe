import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';
import bcrypt from 'bcryptjs';

export function registerUserRoutes() {
  const router = Router();

  /**
   * GET /api/users/:id
   * Get user profile
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Public endpoint: only expose public profile fields (no email or provider metadata).
      const meta = (user[0].metadata ?? {}) as Record<string, any>;
      res.json({
        id: user[0].id,
        username: user[0].username,
        displayName: meta.displayName || meta.fullName || null,
        bio: meta.bio || null,
        avatar: meta.photoURL || meta.avatar || null,
        createdAt: user[0].createdAt,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  /**
   * PATCH /api/users/:id
   * Update user profile (self or admin only)
   */
  router.patch('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const targetId = parseInt(req.params.id);
      const { username, metadata } = req.body;

      // Check authorization
      if (userId !== targetId && !(req as any).user.isAdmin) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, targetId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updated = await db
        .update(users)
        .set({
          username: username ?? user[0].username,
          // Merge so provider data (photoURL, socialId, ...) isn't wiped by partial updates.
          metadata: metadata && typeof metadata === 'object'
            ? { ...((user[0].metadata ?? {}) as Record<string, unknown>), ...metadata }
            : user[0].metadata,
        })
        .where(eq(users.id, targetId))
        .returning();

      const { password_hash, ...userWithoutPassword } = updated[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  /**
   * POST /api/users/:id/change-password
   * Change password (self only)
   */
  router.post('/:id/change-password', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const targetId = parseInt(req.params.id);
      const { currentPassword, newPassword } = req.body;

      // Check authorization
      if (userId !== targetId) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 10);

      await db
        .update(users)
        .set({ password_hash: newHash })
        .where(eq(users.id, userId));

      res.json({ success: true });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

  return router;
}
