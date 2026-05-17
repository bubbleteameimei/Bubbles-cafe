import { Router, Request, Response } from 'express';
import { db } from '../db';
import { analytics, siteAnalytics } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function registerAnalyticsRoutes() {
  const router = Router();

  /**
   * POST /api/analytics/track
   * Track analytics event (public endpoint, no auth required)
   */
  router.post('/track', async (req: Request, res: Response) => {
    try {
      const { postId, pageViews, uniqueVisitors, averageReadTime, bounceRate, deviceStats } = req.body;

      if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
      }

      // Check if analytics record exists
      const existing = await db
        .select()
        .from(analytics)
        .where(eq(analytics.postId, postId))
        .limit(1);

      if (existing.length) {
        // Update existing
        const updated = await db
          .update(analytics)
          .set({
            pageViews: pageViews ?? existing[0].pageViews,
            uniqueVisitors: uniqueVisitors ?? existing[0].uniqueVisitors,
            averageReadTime: averageReadTime ?? existing[0].averageReadTime,
            bounceRate: bounceRate ?? existing[0].bounceRate,
            deviceStats: deviceStats ?? existing[0].deviceStats,
            updatedAt: new Date(),
          })
          .where(eq(analytics.postId, postId))
          .returning();

        return res.json(updated[0]);
      } else {
        // Create new
        const created = await db
          .insert(analytics)
          .values({
            postId,
            pageViews: pageViews || 0,
            uniqueVisitors: uniqueVisitors || 0,
            averageReadTime: averageReadTime || 0,
            bounceRate: bounceRate || 0,
            deviceStats: deviceStats || {},
            updatedAt: new Date(),
          })
          .returning();

        return res.status(201).json(created[0]);
      }
    } catch (error) {
      console.error('Error tracking analytics:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  });

  /**
   * GET /api/analytics/posts/:postId
   * Get analytics for a specific post
   */
  router.get('/posts/:postId', async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      const data = await db
        .select()
        .from(analytics)
        .where(eq(analytics.postId, postId))
        .limit(1);

      if (!data.length) {
        return res.json({
          pageViews: 0,
          uniqueVisitors: 0,
          averageReadTime: 0,
          bounceRate: 0,
          deviceStats: {},
        });
      }

      res.json(data[0]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  /**
   * GET /api/analytics/site
   * Get site-wide analytics
   */
  router.get('/site', async (req: Request, res: Response) => {
    try {
      const data = await db.select().from(siteAnalytics).limit(10);
      res.json({ analytics: data });
    } catch (error) {
      console.error('Error fetching site analytics:', error);
      res.status(500).json({ error: 'Failed to fetch site analytics' });
    }
  });

  return router;
}
