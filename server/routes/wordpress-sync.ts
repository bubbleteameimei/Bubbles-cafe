import { Router, Request, Response } from 'express';
import { db } from '../db';
import { posts, users, analytics } from '@shared/schema';
import { eq } from 'drizzle-orm';

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
 * Sync WordPress posts to Neon database
 * Stores posts with metadata containing WordPress source info
 */
export function registerWordPressSyncRoutes() {
  const router = Router();

  /**
   * POST /api/wordpress/sync
   * Trigger WordPress sync (admin only)
   */
  router.post('/sync', async (req: Request, res: Response) => {
    try {
      const WORDPRESS_API = process.env.WORDPRESS_API || 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
      
      // Get or create WordPress admin user
      let adminUser = await db
        .select()
        .from(users)
        .where(eq(users.email, 'wordpress@bubblescafe.space'))
        .limit(1);

      let adminUserId = adminUser[0]?.id;

      if (!adminUserId) {
        // Create WordPress user
        const newAdmin = await db
          .insert(users)
          .values({
            email: 'wordpress@bubblescafe.space',
            username: 'wordpress-sync',
            password_hash: 'unused-wp-sync', // Not used for OAuth
            isAdmin: true,
            metadata: {
              system: true,
              source: 'wordpress',
              displayName: 'WordPress Sync',
            },
          })
          .returning();

        adminUserId = newAdmin[0].id;
      }

      // Fetch WordPress posts
      const response = await fetch(`${WORDPRESS_API}?per_page=100&_fields=id,date,slug,title,content,excerpt,author,categories,tags,featured_media,status,type,modified`);
      
      if (!response.ok) {
        return res.status(400).json({ error: `WordPress API error: ${response.status}` });
      }

      const wpPosts: WordPressPost[] = await response.json();
      let synced = 0;

      for (const wpPost of wpPosts) {
        try {
          // Strip HTML tags from title and excerpt
          const title = wpPost.title.rendered.replace(/<[^>]*>/g, '');
          const excerpt = wpPost.excerpt.rendered.replace(/<[^>]*>/g, '');
          const content = wpPost.content.rendered;

          // Generate slug if not present
          const slug = wpPost.slug || title.toLowerCase().replace(/\s+/g, '-').substring(0, 255);

          // Check if post already exists
          const existing = await db
            .select()
            .from(posts)
            .where(eq(posts.slug, slug))
            .limit(1);

          if (existing.length) {
            // Update metadata only
            const updatedMetadata = {
              ...existing[0].metadata,
              wordpressId: wpPost.id,
              source: 'wordpress_api',
              wpModified: wpPost.modified,
              categories: wpPost.categories,
              tags: wpPost.tags,
              featured_media: wpPost.featured_media,
            };

            await db
              .update(posts)
              .set({ metadata: updatedMetadata })
              .where(eq(posts.id, existing[0].id));
          } else {
            // Create new post
            await db
              .insert(posts)
              .values({
                title,
                content,
                excerpt,
                slug,
                authorId: adminUserId,
                isSecret: false,
                matureContent: false,
                metadata: {
                  wordpressId: wpPost.id,
                  source: 'wordpress_api',
                  wpModified: wpPost.modified,
                  categories: wpPost.categories,
                  tags: wpPost.tags,
                  featured_media: wpPost.featured_media,
                  syncedAt: new Date().toISOString(),
                },
              });
          }

          synced++;
        } catch (error) {
          console.error(`Error syncing WordPress post ${wpPost.id}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Synced ${synced} posts from WordPress`,
        synced,
        total: wpPosts.length,
      });
    } catch (error) {
      console.error('WordPress sync error:', error);
      res.status(500).json({ error: 'Failed to sync WordPress posts' });
    }
  });

  /**
   * POST /api/wordpress/sync-engagement
   * Sync engagement metrics back to WordPress (updates post metadata with views, read time, etc)
   */
  router.post('/sync-engagement', async (req: Request, res: Response) => {
    try {
      const allPosts = await db.select().from(posts);
      const wpPosts = allPosts.filter(p => (p.metadata as any)?.source === 'wordpress_api');

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
      const wpPosts = allPosts.filter(p => (p.metadata as any)?.source === 'wordpress_api');

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
