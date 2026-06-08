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

  /**
   * POST /api/analytics/engagement/track
   * Track user engagement metrics for a post
   */
  router.post('/engagement/track', async (req: Request, res: Response) => {
    try {
      const { postId, timeSpentSeconds, scrollPercentage, interactionCount, deviceType, isCompleted, timestamp } = req.body;

      if (!postId) {
        return res.status(400).json({ error: 'postId is required' });
      }

      // Check if analytics record exists
      const existing = await db
        .select()
        .from(analytics)
        .where(eq(analytics.postId, postId))
        .limit(1);

      // Calculate engagement metrics
      const engagement = {
        timeSpentSeconds: timeSpentSeconds || 0,
        scrollPercentage: scrollPercentage || 0,
        interactionCount: interactionCount || 0,
        deviceType: deviceType || 'unknown',
        isCompleted: isCompleted || false,
        trackedAt: timestamp || new Date().toISOString(),
      };

      if (existing.length) {
        // Update existing with aggregated engagement data
        const updated = await db
          .update(analytics)
          .set({
            pageViews: (existing[0].pageViews || 0) + 1,
            averageReadTime: Math.round(((existing[0].averageReadTime || 0) + (timeSpentSeconds || 0)) / 2),
            metadata: {
              ...existing[0].metadata,
              lastEngagement: engagement,
              engagementHistory: [
                ...(Array.isArray(existing[0].metadata?.engagementHistory) ? existing[0].metadata.engagementHistory : []),
                engagement,
              ].slice(-50), // Keep last 50 engagement records
            },
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
            pageViews: 1,
            uniqueVisitors: 1,
            averageReadTime: timeSpentSeconds || 0,
            bounceRate: scrollPercentage < 30 ? 100 : 0,
            deviceStats: { [deviceType || 'unknown']: 1 },
            metadata: {
              engagementHistory: [engagement],
            },
            updatedAt: new Date(),
          })
          .returning();

        return res.status(201).json(created[0]);
      }
    } catch (error) {
      console.error('Error tracking engagement:', error);
      res.status(500).json({ error: 'Failed to track engagement' });
    }
  });

  /**
   * POST /api/analytics/sync-wordpress
   * Sync engagement metrics with WordPress
   */
  router.post('/sync-wordpress', async (req: Request, res: Response) => {
    try {
      const { postId, wordpressPostId, totalViews, avgTimeSpent, engagementRate } = req.body;

      if (!postId || !wordpressPostId) {
        return res.status(400).json({ error: 'postId and wordpressPostId are required' });
      }

      // Get existing analytics
      const existing = await db
        .select()
        .from(analytics)
        .where(eq(analytics.postId, postId))
        .limit(1);

      if (existing.length) {
        // Update with WordPress sync metadata
        const updated = await db
          .update(analytics)
          .set({
            metadata: {
              ...existing[0].metadata,
              wordpressSync: {
                wordpressPostId,
                syncedAt: new Date().toISOString(),
                totalViews: totalViews || existing[0].pageViews,
                avgTimeSpent: avgTimeSpent || existing[0].averageReadTime,
                engagementRate: engagementRate || 0,
              },
            },
            updatedAt: new Date(),
          })
          .where(eq(analytics.postId, postId))
          .returning();

        // Here you would also sync with actual WordPress API
        // For now, we're just storing the metadata locally
        console.log(`[WordPress Sync] Engagement synced for post ${postId} (WordPress ID: ${wordpressPostId})`);

        return res.json({
          success: true,
          message: 'Engagement synced with WordPress metadata',
          data: updated[0],
        });
      } else {
        return res.status(404).json({ error: 'Analytics record not found for post' });
      }
    } catch (error) {
      console.error('Error syncing with WordPress:', error);
      res.status(500).json({ error: 'Failed to sync with WordPress' });
    }
  });

  return router;
}
