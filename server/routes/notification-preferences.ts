import { Request, Response, Express, NextFunction } from 'express';
import { db } from '../db';
import { userNotificationPreferences } from '@shared/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

// Authentication middleware (session-based)
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return next();
};

export function registerNotificationPreferencesRoutes(app: Express) {
  // GET /api/user/notification-preferences
  app.get('/api/user/notification-preferences', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const rows = await db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, Number(userId)))
        .limit(1);

      if (!rows.length) {
        // Create defaults
        const [created] = await db
          .insert(userNotificationPreferences)
          .values({
            userId: Number(userId),
            storyUpdates: true,
            communityActivity: true,
            securityAlerts: true,
            readingReminders: false,
            recommendations: true
          } as any)
          .returning();

        return res.status(200).json(created);
      }

      return res.status(200).json(rows[0]);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to load notification preferences' });
    }
  });

  // PATCH /api/user/notification-preferences
  const updateSchema = z.object({
    storyUpdates: z.boolean().optional(),
    communityActivity: z.boolean().optional(),
    securityAlerts: z.boolean().optional(),
    readingReminders: z.boolean().optional(),
    recommendations: z.boolean().optional(),
    preferredTime: z.string().optional(),
    timezone: z.string().optional(),

    // Accept snake_case for backward compatibility
    story_updates: z.boolean().optional(),
    community_activity: z.boolean().optional(),
    reading_reminders: z.boolean().optional()
  });

  app.patch('/api/user/notification-preferences', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).session?.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
      }

      const data = parsed.data as any;
      // Normalize snake_case keys
      const updatePayload: any = {};
      if (data.storyUpdates !== undefined) updatePayload.storyUpdates = !!data.storyUpdates;
      if (data.communityActivity !== undefined) updatePayload.communityActivity = !!data.communityActivity;
      if (data.securityAlerts !== undefined) updatePayload.securityAlerts = !!data.securityAlerts;
      if (data.readingReminders !== undefined) updatePayload.readingReminders = !!data.readingReminders;
      if (data.recommendations !== undefined) updatePayload.recommendations = !!data.recommendations;
      if (data.preferredTime !== undefined) updatePayload.preferredTime = String(data.preferredTime);
      if (data.timezone !== undefined) updatePayload.timezone = String(data.timezone);

      if (data.story_updates !== undefined) updatePayload.storyUpdates = !!data.story_updates;
      if (data.community_activity !== undefined) updatePayload.communityActivity = !!data.community_activity;
      if (data.reading_reminders !== undefined) updatePayload.readingReminders = !!data.reading_reminders;

      // Upsert-like behavior
      const rows = await db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, Number(userId)))
        .limit(1);

      let result: any;
      if (!rows.length) {
        const [created] = await db
          .insert(userNotificationPreferences)
          .values({ userId: Number(userId), ...updatePayload } as any)
          .returning();
        result = created;
      } else {
        const [updated] = await db
          .update(userNotificationPreferences)
          .set(updatePayload)
          .where(eq(userNotificationPreferences.userId, Number(userId)))
          .returning();
        result = updated;
      }

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  });
}