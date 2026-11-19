import { Router, Request, Response } from 'express';
import { db } from '../db';
import { posts, users, analytics } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '../auth-google';
import { runWordPressSync } from '../services/wordpress-sync';

interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  categories: number[];
  tags: number[];
  featured_media: number;
  status: string;
  type: string;
  modified: string;
}

/**
 * WordPress sync routes (logic lives in services/wordpress-sync.ts)
 * Stores posts with metadata containing WordPress source info
 */
export function registerWordPressSyncRoutes() {
  const router = Router();

  /**
   * POST /api/wordpress/sync
   * Trigger WordPress sync (admin only)
   */
  router.post('/sync', requireAdmin, async (_req: Request, res: Response) => {
    const result = await runWordPressSync('manual');
    if (!result.success) {
      const status = result.errors[0] === 'A sync is already running' ? 409 : 502;
      return res.status(status).json({ ...result, error: result.errors[0] ?? 'Sync failed' });
    }
    return res.json({
      ...result,
      message: `Synced ${result.created + result.updated} posts from WordPress`,
      synced: result.created + result.updated,
    });
  });

  /**
   * POST /api/wordpress/sync-engagement
   * Sync engagement metrics back to WordPress (updates post metadata with views, read time, etc)
   */
  router.post('/sync-engagement', requireAdmin, async (req: Request, res: Response) => {
    try {
      const allPosts = await db.select().from(posts);
      const wpPosts = allPosts.filter((p: any) => (p.metadata as any)?.source === 'wordpress_api');

      let synced = 0;
      const syncedData = [];

      for (const post of wpPosts) {
        const postAnalytics = await db
          .select()
          .from(analytics)
          .where(eq(analytics.postId, post.id))
          .limit(1);

        if (postAnalytics.length) {
          const analytic = postAnalytics[0];
          const engagementData = {
            totalViews: analytic.pageViews || 0,
            uniqueVisitors: analytic.uniqueVisitors || 0,
            averageReadTime: analytic.averageReadTime || 0,
            bounceRate: analytic.bounceRate || 0,
            lastSyncedAt: new Date().toISOString(),
          };

          // Update post metadata with engagement info
          const updatedMetadata = {
            ...(post.metadata as any),
            engagement: engagementData,
            lastEngagementSync: new Date().toISOString(),
          };

          await db
            .update(posts)
            .set({ metadata: updatedMetadata })
            .where(eq(posts.id, post.id));

          syncedData.push({
            postId: post.id,
            slug: post.slug,
            title: post.title,
            engagement: engagementData,
          });

          synced++;
        }
      }

      res.json({
        success: true,
        message: `Synced engagement metrics for ${synced} posts`,
        synced,
        data: syncedData,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync engagement metrics' });
    }
  });

  /**
   * GET /api/wordpress/posts
   * Get WordPress-synced posts
   */
  router.get('/posts', async (req: Request, res: Response) => {
    try {
      const allPosts = await db.select().from(posts);
      const wpPosts = allPosts.filter((p: any) => (p.metadata as any)?.source === 'wordpress_api');

      res.json({
        posts: wpPosts,
        count: wpPosts.length,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch WordPress posts' });
    }
  });

  return router;
}
