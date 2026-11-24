/**
 * Story like/dislike reactions (ported from the retired Worker).
 * Mounted at /api/posts in server/index.ts, BEFORE the posts router, so that
 * /api/posts/reactions-batch isn't swallowed by GET /api/posts/:id.
 *
 *   GET  /api/posts/reactions-batch?ids=1,2,3   { results: ReactionTotals[] }
 *   GET  /api/posts/:id/reactions               ReactionTotals (+ the caller's state)
 *   POST /api/posts/:id/reaction                { nextState: 'like'|'dislike'|'none' } or legacy { isLike }
 *   POST /api/posts/:id/view                    count a story view
 *   GET  /api/posts/summary?ids=1,2             { results: [{ id, title, slug, excerpt, createdAt }] }
 *
 * One reaction per visitor (signed-in user id, or the anonymous cookie id).
 * Counts are recomputed from post_reactions, so clients can't inflate them by
 * spoofing their previous state.
 */
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db';
import { analytics, postReactions, posts } from '@shared/schema';
import { getOptionalUser } from '../auth-google';
import { getAnonId, issueAnonId } from '../utils/anon-id';

type ReactionState = 'like' | 'dislike' | 'none';

function totalsOf(row: { id: number; baselineLikes: number | null; baselineDislikes: number | null; likesCount: number | null; dislikesCount: number | null }) {
  const baselineLikes = Number(row.baselineLikes ?? 0);
  const baselineDislikes = Number(row.baselineDislikes ?? 0);
  const likesCount = Number(row.likesCount ?? 0);
  const dislikesCount = Number(row.dislikesCount ?? 0);
  return {
    postId: row.id,
    baselineLikes,
    baselineDislikes,
    likesCount,
    dislikesCount,
    totals: { likes: baselineLikes + likesCount, dislikes: baselineDislikes + dislikesCount },
  };
}

const countColumns = {
  id: posts.id,
  baselineLikes: posts.baselineLikes,
  baselineDislikes: posts.baselineDislikes,
  likesCount: posts.likesCount,
  dislikesCount: posts.dislikesCount,
};

async function visitorKey(req: Request): Promise<string | null> {
  const user = await getOptionalUser(req).catch(() => null);
  if (user) return `user:${user.userId}`;
  const anon = getAnonId(req);
  return anon ? `anon:${anon}` : null;
}

const reactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many reactions, slow down a little.' },
});

export function registerReactionsRoutes() {
  const router = Router();

  router.get('/reactions-batch', async (req: Request, res: Response) => {
    const ids = String(req.query.ids ?? '')
      .split(',')
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 200);
    if (ids.length === 0) return res.json({ results: [] });
    try {
      const rows = await db.select(countColumns).from(posts).where(inArray(posts.id, ids));
      // Never cached: a like on one device must show on another straight away.
      res.set('Cache-Control', 'no-store');
      return res.json({ results: rows.map(totalsOf) });
    } catch (error) {
      console.error('Error fetching reaction batch:', error);
      return res.status(500).json({ results: [], error: 'Failed to fetch reactions' });
    }
  });

  // Story summaries by id, for bookmarks saved on a device without signing in.
  router.get('/summary', async (req: Request, res: Response) => {
    const ids = String(req.query.ids ?? '')
      .split(',')
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 200);
    if (ids.length === 0) return res.json({ results: [] });
    try {
      const rows = await db
        .select({ id: posts.id, title: posts.title, slug: posts.slug, excerpt: posts.excerpt, createdAt: posts.createdAt })
        .from(posts)
        .where(and(inArray(posts.id, ids), eq(posts.isSecret, false)));
      return res.json({ results: rows });
    } catch (error) {
      console.error('Error fetching story summaries:', error);
      return res.status(500).json({ results: [], error: 'Failed to fetch stories' });
    }
  });

  router.get('/:id/reactions', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid post id' });
    try {
      const [row] = await db.select(countColumns).from(posts).where(eq(posts.id, id)).limit(1);
      if (!row) return res.status(404).json({ error: 'Story not found' });
      let state: ReactionState = 'none';
      const key = await visitorKey(req);
      if (key) {
        const [mine] = await db
          .select({ state: postReactions.state })
          .from(postReactions)
          .where(and(eq(postReactions.postId, id), eq(postReactions.userKey, key)))
          .limit(1);
        if (mine?.state === 'like' || mine?.state === 'dislike') state = mine.state;
      }
      res.set('Cache-Control', 'no-store');
      return res.json({ ...totalsOf(row), state });
    } catch (error) {
      console.error('Error fetching reactions:', error);
      return res.status(500).json({ error: 'Failed to fetch reactions' });
    }
  });

  router.post('/:id/reaction', reactLimiter, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid post id' });

    const body = req.body ?? {};
    const raw = String(body.nextState ?? '').toLowerCase();
    const nextState: ReactionState =
      raw === 'like' || raw === 'dislike' || raw === 'none'
        ? raw
        : body.isLike === true
          ? 'like'
          : body.isLike === false
            ? 'dislike'
            : 'none';

    try {
      const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1);
      if (!exists) return res.status(404).json({ error: 'Story not found' });

      let key = await visitorKey(req);
      if (!key) key = `anon:${issueAnonId(res)}`;

      if (nextState === 'none') {
        await db.delete(postReactions).where(and(eq(postReactions.postId, id), eq(postReactions.userKey, key)));
      } else {
        await db
          .insert(postReactions)
          .values({ postId: id, userKey: key, state: nextState })
          .onConflictDoUpdate({
            target: [postReactions.postId, postReactions.userKey],
            set: { state: nextState, updatedAt: new Date() },
          });
      }

      // Recompute stored counts from the reaction rows (single statement, race-safe enough).
      const [row] = await db
        .update(posts)
        .set({
          likesCount: sql`(select count(*)::int from post_reactions where post_id = ${id} and state = 'like')`,
          dislikesCount: sql`(select count(*)::int from post_reactions where post_id = ${id} and state = 'dislike')`,
        })
        .where(eq(posts.id, id))
        .returning(countColumns);

      return res.json({ ...totalsOf(row), state: nextState });
    } catch (error) {
      console.error('Error saving reaction:', error);
      return res.status(500).json({ error: 'Failed to save reaction' });
    }
  });

  // Story views: one per story per browser session (the client de-duplicates), stored in
  // analytics.page_views. Previously nothing recorded views, so every count read 0.
  const viewLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false });
  router.post('/:id/view', viewLimiter, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid post id' });
    try {
      const [exists] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, id)).limit(1);
      if (!exists) return res.status(404).json({ error: 'Story not found' });
      const [row] = await db
        .insert(analytics)
        .values({ postId: id, pageViews: 1, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: analytics.postId,
          set: { pageViews: sql`${analytics.pageViews} + 1`, updatedAt: new Date() },
        })
        .returning({ views: analytics.pageViews });
      res.set('Cache-Control', 'no-store');
      return res.json({ postId: id, views: Number(row?.views ?? 0) });
    } catch (error) {
      console.error('Error recording view:', error);
      return res.status(500).json({ error: 'Failed to record view' });
    }
  });

  return router;
}
