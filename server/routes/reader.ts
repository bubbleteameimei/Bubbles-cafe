/**
 * Reader endpoints ported from the retired Cloudflare Worker. Mounted at /api.
 *
 *   GET  /api/posts/slug/:slug          single story by slug
 *   GET  /api/search                    story search ({ results, meta })
 *   GET  /api/recommendations/direct    newest public stories
 *   POST /api/reading-progress          save progress (signed-in)
 *   GET  /api/reading-progress/:slug    load progress (signed-in)
 *   POST /api/posts/:id/flag            report a story (signed-in)
 *   PUT  /api/posts/:id/hide            hide a story from listings (admin)
 *   GET  /api/analytics/engagement      lightweight site stats
 *   GET  /api/analytics/reading-time    lightweight reading stats
 *   POST /api/analytics/interaction     best-effort client telemetry (no-op store)
 */
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { analytics, posts, readingProgress, reportedContent } from '@shared/schema';
import { requireAdmin, verifyAuthToken } from '../auth-google';

const isPubliclyVisible = sql`coalesce(${posts.metadata}->>'status', 'publish') not in ('draft', 'hidden', 'pending')`;

function stripHtml(input: string | null | undefined): string {
  return String(input ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeLike(q: string) {
  return q.replace(/[\\%_]/g, (c) => `\\${c}`);
}

function storyUrl(p: { slug: string; isAdminPost: boolean | null }) {
  return p.isAdminPost === false ? `/community-story/${p.slug}` : `/reader/${p.slug}`;
}

function snippetAround(text: string, q: string, radius = 80): string | null {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return null;
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + q.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

const telemetryLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
const reportLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false });

export function registerReaderRoutes() {
  const router = Router();

  router.get('/posts/slug/:slug', async (req, res) => {
    try {
      const [post] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, req.params.slug), eq(posts.isSecret, false), isPubliclyVisible))
        .limit(1);
      if (!post) return res.status(404).json({ error: 'Story not found' });
      return res.json(post);
    } catch (error) {
      console.error('Error fetching post by slug:', error);
      return res.status(500).json({ error: 'Failed to fetch story' });
    }
  });

  router.get('/search', async (req, res) => {
    const q = String(req.query.q ?? '').trim();
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const from = String(req.query.from ?? 'all');
    const category = String(req.query.category ?? 'all');
    if (q.length < 2) return res.json({ results: [], meta: { total: 0, page, pages: 0, query: q } });

    try {
      const pattern = `%${escapeLike(q)}%`;
      const conditions: any[] = [
        eq(posts.isSecret, false),
        isPubliclyVisible,
        or(ilike(posts.title, pattern), ilike(posts.content, pattern), ilike(posts.excerpt, pattern)),
      ];
      if (from === 'community') conditions.push(eq(posts.isAdminPost, false));
      if (from === 'reader') conditions.push(sql`${posts.isAdminPost} is not false`);
      if (category !== 'all') conditions.push(eq(posts.themeCategory, category));
      const where = and(...conditions);

      const [rows, [{ count }]] = await Promise.all([
        db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            excerpt: posts.excerpt,
            content: posts.content,
            createdAt: posts.createdAt,
            isAdminPost: posts.isAdminPost,
            themeCategory: posts.themeCategory,
          })
          .from(posts)
          .where(where)
          .orderBy(sql`CASE WHEN ${posts.title} ILIKE ${pattern} THEN 0 ELSE 1 END`, desc(posts.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),
        db.select({ count: sql<number>`count(*)::int` }).from(posts).where(where),
      ]);

      const results = rows.map((p: any) => {
        const text = stripHtml(p.content);
        const excerptSource = stripHtml(p.excerpt) || text;
        const context = snippetAround(text, q);
        return {
          id: p.id,
          title: stripHtml(p.title) || 'Untitled',
          excerpt: excerptSource.length > 200 ? `${excerptSource.slice(0, 200)}…` : excerptSource,
          type: 'post',
          url: storyUrl(p),
          date: p.createdAt,
          themeCategory: p.themeCategory,
          matches: context ? [{ field: 'content', context }] : [],
        };
      });
      const total = Number(count);
      return res.json({ results, meta: { total, page, pages: Math.ceil(total / limit), query: q } });
    } catch (error) {
      console.error('Error searching:', error);
      return res.status(500).json({ results: [], meta: { total: 0, page, pages: 0 }, error: 'Search failed' });
    }
  });

  router.get('/recommendations/direct', async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 20);
    try {
      const rows = await db
        .select({ id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, content: posts.content, createdAt: posts.createdAt })
        .from(posts)
        .where(and(eq(posts.isSecret, false), isPubliclyVisible))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(
        rows.map((p: any) => {
          const text = stripHtml(p.excerpt) || stripHtml(p.content);
          return {
            id: p.id,
            title: stripHtml(p.title) || 'Untitled',
            slug: p.slug,
            excerpt: text.length > 160 ? `${text.slice(0, 160)}…` : text,
            createdAt: p.createdAt,
          };
        }),
      );
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  router.post('/reading-progress', verifyAuthToken as any, async (req, res) => {
    const slug = String(req.body?.postSlug ?? '').trim();
    const pct = Number(req.body?.percentCompleted);
    if (!slug || !Number.isFinite(pct)) return res.status(400).json({ error: 'postSlug and percentCompleted are required' });
    try {
      const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug)).limit(1);
      if (!post) return res.status(404).json({ error: 'Story not found' });
      const progress = String(Math.max(0, Math.min(100, Math.round(pct))));
      const userId = (req as any).user.userId as number;
      await db
        .insert(readingProgress)
        .values({ userId, postId: post.id, progress, lastReadAt: new Date() })
        .onConflictDoUpdate({
          target: [readingProgress.userId, readingProgress.postId],
          set: { progress, lastReadAt: new Date() },
        });
      return res.json({ success: true, progress: { postSlug: slug, percentCompleted: Number(progress) } });
    } catch (error) {
      console.error('Error saving reading progress:', error);
      return res.status(500).json({ error: 'Failed to save progress' });
    }
  });

  router.get('/reading-progress/:slug', verifyAuthToken as any, async (req, res) => {
    try {
      const [row] = await db
        .select({ progress: readingProgress.progress, lastReadAt: readingProgress.lastReadAt })
        .from(readingProgress)
        .innerJoin(posts, eq(posts.id, readingProgress.postId))
        .where(and(eq(posts.slug, req.params.slug), eq(readingProgress.userId, (req as any).user.userId)))
        .limit(1);
      return res.json({
        progress: row ? { postSlug: req.params.slug, percentCompleted: Number(row.progress), lastReadAt: row.lastReadAt } : null,
      });
    } catch (error) {
      console.error('Error loading reading progress:', error);
      return res.status(500).json({ error: 'Failed to load progress' });
    }
  });

  router.post('/posts/:id/flag', reportLimiter, verifyAuthToken as any, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid story id' });
    const reason = String(req.body?.reason ?? 'inappropriate content').trim().slice(0, 500) || 'inappropriate content';
    try {
      const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1);
      if (!post) return res.status(404).json({ error: 'Story not found' });
      await db.insert(reportedContent).values({
        contentType: 'post',
        contentId: id,
        reporterId: (req as any).user.userId,
        reason,
      });
      return res.json({ success: true });
    } catch (error) {
      console.error('Error reporting story:', error);
      return res.status(500).json({ error: 'Failed to report story' });
    }
  });

  router.put('/posts/:id/hide', requireAdmin as any, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid story id' });
    try {
      const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
      if (!post) return res.status(404).json({ error: 'Story not found' });
      const [updated] = await db
        .update(posts)
        .set({ metadata: { ...((post.metadata ?? {}) as object), status: 'hidden' } })
        .where(eq(posts.id, id))
        .returning();
      return res.json(updated);
    } catch (error) {
      console.error('Error hiding story:', error);
      return res.status(500).json({ error: 'Failed to hide story' });
    }
  });

  router.get('/analytics/engagement', async (_req, res) => {
    try {
      const [row] = await db
        .select({
          totalViews: sql<number>`coalesce(sum(${analytics.pageViews}), 0)::int`,
          uniqueVisitors: sql<number>`coalesce(sum(${analytics.uniqueVisitors}), 0)::int`,
          trackedStories: sql<number>`count(*)::int`,
        })
        .from(analytics);
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(row ?? { totalViews: 0, uniqueVisitors: 0, trackedStories: 0 });
    } catch (error) {
      console.error('Error fetching engagement:', error);
      return res.json({ totalViews: 0, uniqueVisitors: 0, trackedStories: 0 });
    }
  });

  router.get('/analytics/reading-time', async (_req, res) => {
    try {
      const [row] = await db
        .select({ averageReadTime: sql<number>`coalesce(avg(nullif(${analytics.averageReadTime}, 0)), 0)::float` })
        .from(analytics);
      res.set('Cache-Control', 'public, max-age=300');
      return res.json({ averageReadTimeSeconds: Math.round(Number(row?.averageReadTime ?? 0)) });
    } catch (error) {
      console.error('Error fetching reading time:', error);
      return res.json({ averageReadTimeSeconds: 0 });
    }
  });

  // Client telemetry (search queries, zero-result searches). Accepted and dropped for now.
  router.post('/analytics/interaction', telemetryLimiter, (_req: Request, res: Response) => {
    res.status(204).end();
  });

  return router;
}
