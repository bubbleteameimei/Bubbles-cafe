import { Router } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { analytics, posts as postsTable } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { sanitizeHtml } from '../utils/sanitizer';

/**
 * Router that serves trending stories with lightweight analytics
 * Shape adapts to the client expectations (WP-like title/excerpt fields).
 */
const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Base trending using storage helper (views, likes, bookmarks)
    const trending = await (storage as any).getTrendingPosts(12);

    // Enrich with per-post analytics when available
    const enriched = [];
    for (const item of trending) {
      // Try to get analytics for this post
      let postAnalytics: any = null;
      try {
        const rows = await db
          .select()
          .from(analytics)
          .where(eq(analytics.postId, Number(item.id)))
          .orderBy(desc(analytics.updatedAt))
          .limit(1);
        postAnalytics = rows[0] || null;
      } catch {
        postAnalytics = null;
      }

      // Fetch additional post fields for date and metadata
      let basePost: any = null;
      try {
        const rows = await db
          .select({
            id: postsTable.id,
            createdAt: postsTable.createdAt,
            metadata: postsTable.metadata,
            content: postsTable.content,
            excerpt: postsTable.excerpt,
            title: postsTable.title,
            slug: postsTable.slug,
            readingTimeMinutes: postsTable.readingTimeMinutes,
            themeCategory: postsTable.themeCategory,
            likesCount: postsTable.likesCount
          })
          .from(postsTable)
          .where(eq(postsTable.id, Number(item.id)))
          .limit(1);
        basePost = rows[0] || null;
      } catch {
        basePost = null;
      }

      const titleText = String(item.title ?? basePost?.title ?? '');
      const excerptText = String(item.excerpt ?? basePost?.excerpt ?? '');
      const contentText = String(basePost?.content ?? '');

      // Estimate time on page as readingTimeMinutes or approximate via content length
      const readingTimeMinutes =
        (basePost?.readingTimeMinutes as number | null) ??
        Math.max(1, Math.ceil(contentText.split(/\s+/).length / 200));

      const views = Number(item.views ?? 0);
      const likes = Number(item.likes ?? basePost?.likesCount ?? 0);

      // Engagement rate heuristic: likes per view, bounded 0..1
      const engagementRate =
        views > 0 ? Math.max(0, Math.min(1, likes / views)) : 0;

      enriched.push({
        id: Number(item.id),
        slug: String(item.slug),
        title: {
          rendered: sanitizeHtml(titleText)
        },
        excerpt: {
          rendered: sanitizeHtml(excerptText || contentText.slice(0, 180) + '...')
        },
        date: String(basePost?.createdAt ?? new Date().toISOString()),
        metadata: {
          themeCategory:
            (basePost?.themeCategory as string | null) ??
            ((basePost?.metadata as any)?.themeCategory ?? null)
        },
        analytics: {
          views,
          likes,
          timeOnPage: Number(postAnalytics?.averageReadTime ?? readingTimeMinutes * 60),
          engagementRate
        }
      });
    }

    return res.json({ posts: enriched });
  } catch (error) {
    console.error('[TrendingStories] Failed to build trending stories:', error);
    return res.status(500).json({
      error: 'Failed to fetch trending stories'
    });
  }
});

export default router;