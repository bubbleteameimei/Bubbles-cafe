import { Router } from 'express';
import { db } from '../db';
import { userNotifications } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { createSecureLogger } from '../utils/secure-logger';

const router = Router();
const logger = createSecureLogger('UserNotificationsRoutes');

const createSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.record(z.unknown()).optional()
});

// GET /api/notifications - list notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const rows = await db.select().from(userNotifications)
      .where(eq(userNotifications.userId, Number(userId)))
      .orderBy(desc(userNotifications.createdAt))
      .limit(50);

    return res.json({ notifications: rows });
  } catch (error: any) {
    logger.error('Failed to list notifications', { error: error?.message });
    return res.status(500).json({ error: 'Failed to list notifications' });
  }
});

// POST /api/notifications - create a notification for current user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const body = createSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ error: 'Invalid payload', details: body.error.errors });
    }

    const [created] = await db.insert(userNotifications).values({
      userId: Number(userId),
      type: body.data.type,
      title: body.data.title,
      message: body.data.message,
      metadata: body.data.metadata ?? {},
      isRead: false,
      createdAt: new Date()
    } as any).returning();

    return res.status(201).json({ notification: created });
  } catch (error: any) {
    logger.error('Failed to create notification', { error: error?.message });
    return res.status(500).json({ error: 'Failed to create notification' });
  }
});

// PATCH /api/notifications/:id/read - mark as read/unread
const readSchema = z.object({ isRead: z.boolean().optional().default(true) });
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const { isRead } = readSchema.parse(req.body);

    const [updated] = await db.update(userNotifications)
      .set({ isRead: !!isRead })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, Number(userId))))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ notification: updated });
  } catch (error: any) {
    logger.error('Failed to update notification', { error: error?.message });
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;