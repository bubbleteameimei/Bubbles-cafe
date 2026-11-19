/**
 * Signed-in user endpoints ported from the retired Cloudflare Worker.
 *
 * Mounted at /api/user in server/index.ts (all require a valid token):
 *   GET/PATCH /api/user/privacy-settings
 *   GET/PATCH /api/user/notification-preferences
 *   GET       /api/user/feedback
 *   GET       /api/user/feedback/stats
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { userFeedback, userNotificationPreferences, userPrivacySettings } from '@shared/schema';
import { verifyAuthToken } from '../auth-google';

const PRIVACY_DEFAULTS = {
  profileVisible: true,
  shareReadingHistory: false,
  anonymousCommenting: false,
  twoFactorAuthEnabled: false,
  loginNotifications: true,
};

const NOTIFICATION_DEFAULTS = {
  storyUpdates: true,
  communityActivity: true,
  securityAlerts: true,
  readingReminders: false,
  recommendations: true,
  preferredTime: null as string | null,
  timezone: null as string | null,
};

// .strict() is deliberately not used: the client sends extra frontend-only
// fields, which are dropped here rather than rejected.
const privacyPatchSchema = z.object({
  profileVisible: z.boolean().optional(),
  shareReadingHistory: z.boolean().optional(),
  anonymousCommenting: z.boolean().optional(),
  twoFactorAuthEnabled: z.boolean().optional(),
  loginNotifications: z.boolean().optional(),
});

const notificationPatchSchema = z.object({
  storyUpdates: z.boolean().optional(),
  communityActivity: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  readingReminders: z.boolean().optional(),
  recommendations: z.boolean().optional(),
  preferredTime: z.string().trim().max(50).nullable().optional(),
  timezone: z.string().trim().max(100).nullable().optional(),
});

function userIdOf(req: Request): number {
  return (req as any).user.userId as number;
}

function pickPrivacy(row: any) {
  return {
    profileVisible: row.profileVisible,
    shareReadingHistory: row.shareReadingHistory,
    anonymousCommenting: row.anonymousCommenting,
    twoFactorAuthEnabled: row.twoFactorAuthEnabled,
    loginNotifications: row.loginNotifications,
    updatedAt: row.updatedAt ?? null,
  };
}

function pickNotifications(row: any) {
  return {
    storyUpdates: row.storyUpdates,
    communityActivity: row.communityActivity,
    securityAlerts: row.securityAlerts,
    readingReminders: row.readingReminders,
    recommendations: row.recommendations,
    preferredTime: row.preferredTime ?? null,
    timezone: row.timezone ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export function registerUserSettingsRoutes() {
  const router = Router();
  router.use(verifyAuthToken as any);

  router.get('/privacy-settings', async (req: Request, res: Response) => {
    try {
      const [row] = await db
        .select()
        .from(userPrivacySettings)
        .where(eq(userPrivacySettings.userId, userIdOf(req)))
        .limit(1);
      res.json(row ? pickPrivacy(row) : { ...PRIVACY_DEFAULTS, updatedAt: null });
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      res.status(500).json({ error: 'Failed to fetch privacy settings' });
    }
  });

  router.patch('/privacy-settings', async (req: Request, res: Response) => {
    const parsed = privacyPatchSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid privacy settings' });

    try {
      const userId = userIdOf(req);
      const changes = { ...parsed.data, updatedAt: new Date() };
      const [row] = await db
        .insert(userPrivacySettings)
        .values({ ...PRIVACY_DEFAULTS, ...changes, userId })
        .onConflictDoUpdate({ target: userPrivacySettings.userId, set: changes })
        .returning();
      return res.json(pickPrivacy(row));
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return res.status(500).json({ error: 'Failed to update privacy settings' });
    }
  });

  router.get('/notification-preferences', async (req: Request, res: Response) => {
    try {
      const [row] = await db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, userIdOf(req)))
        .limit(1);
      res.json(row ? pickNotifications(row) : { ...NOTIFICATION_DEFAULTS, updatedAt: null });
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
  });

  router.patch('/notification-preferences', async (req: Request, res: Response) => {
    const parsed = notificationPatchSchema.safeParse(req.body ?? {});
    if (!parsed.success) return res.status(400).json({ error: 'Invalid notification preferences' });

    try {
      const userId = userIdOf(req);
      const changes = { ...parsed.data, updatedAt: new Date() };
      const [row] = await db
        .insert(userNotificationPreferences)
        .values({ ...NOTIFICATION_DEFAULTS, ...changes, userId })
        .onConflictDoUpdate({ target: userNotificationPreferences.userId, set: changes })
        .returning();
      return res.json(pickNotifications(row));
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  });

  router.get('/feedback', async (req: Request, res: Response) => {
    try {
      const feedback = await db
        .select()
        .from(userFeedback)
        .where(eq(userFeedback.userId, userIdOf(req)))
        .orderBy(desc(userFeedback.createdAt))
        .limit(200);
      res.json({ feedback, isAuthenticated: true });
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  router.get('/feedback/stats', async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select({ status: userFeedback.status })
        .from(userFeedback)
        .where(eq(userFeedback.userId, userIdOf(req)));
      const stats = { total: rows.length, pending: 0, reviewed: 0, resolved: 0, rejected: 0 };
      for (const { status } of rows as Array<{ status: string }>) {
        if (status in stats && status !== 'total') (stats as any)[status] += 1;
      }
      res.json({ stats, isAuthenticated: true });
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      res.status(500).json({ error: 'Failed to fetch feedback stats' });
    }
  });

  return router;
}
