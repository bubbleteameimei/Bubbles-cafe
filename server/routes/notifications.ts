import { Router, Request, Response } from 'express';
import { db } from '../db';
import { userNotifications } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyAuthToken } from '../auth-google';

export function registerNotificationsRoutes() {
  const router = Router();

  /**
   * GET /api/notifications
   * Get notifications for the authenticated user
   */
  router.get('/', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const unreadOnly = req.query.unread === 'true';

      const whereClause = unreadOnly
        ? and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false))
        : eq(userNotifications.userId, userId);

      const notifications = await db
        .select()
        .from(userNotifications)
        .where(whereClause)
        .orderBy(desc(userNotifications.createdAt))
        .limit(limit);

      // Count unread
      const allNotifs = await db
        .select({ id: userNotifications.id, isRead: userNotifications.isRead })
        .from(userNotifications)
        .where(eq(userNotifications.userId, userId));

      const unreadCount = allNotifs.filter(n => !n.isRead).length;

      res.json({ notifications, unreadCount });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  router.patch('/:id/read', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const notifId = parseInt(req.params.id);

      const notif = await db
        .select()
        .from(userNotifications)
        .where(eq(userNotifications.id, notifId))
        .limit(1);

      if (!notif.length) return res.status(404).json({ error: 'Notification not found' });
      if (notif[0].userId !== userId) return res.status(403).json({ error: 'Not authorized' });

      const updated = await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(eq(userNotifications.id, notifId))
        .returning();

      res.json(updated[0]);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  });

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read
   */
  router.post('/read-all', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;

      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  });

  /**
   * DELETE /api/notifications/:id
   * Delete a notification
   */
  router.delete('/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const notifId = parseInt(req.params.id);

      const notif = await db.select().from(userNotifications).where(eq(userNotifications.id, notifId)).limit(1);
      if (!notif.length) return res.status(404).json({ error: 'Notification not found' });
      if (notif[0].userId !== userId) return res.status(403).json({ error: 'Not authorized' });

      await db.delete(userNotifications).where(eq(userNotifications.id, notifId));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });

  return router;
}
