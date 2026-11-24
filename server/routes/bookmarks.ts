/**
 * Bookmarks for signed-in readers. Mounted at /api/bookmarks.
 *
 * Shapes and paths match what the client calls (components/ui/BookmarkButton.tsx and
 * BookmarkList.tsx), which are keyed by *story* id. The previous router used different
 * paths (/check/:postId, POST /, DELETE by bookmark id) and wrapped the list in an object,
 * so every bookmark action from the site failed.
 *
 *   GET    /                 -> BookmarkWithPost[]
 *   GET    /tag/:tag         -> BookmarkWithPost[] filtered by tag
 *   POST   /migrate          { local: { [postId]: { notes?, tags?, lastPosition? } } } -> { success, migrated }
 *   GET    /:postId          -> { success, bookmarked, bookmark }
 *   GET    /check/:postId    -> same (legacy alias)
 *   POST   /:postId          { notes?, tags? } -> { success, bookmark } (idempotent)
 *   PATCH  /:postId          { notes?, tags?, lastPosition? } -> { success, bookmark }
 *   DELETE /:postId          -> { success }
 */
import { Router, Request, Response } from 'express';
import { and, arrayContains, desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { bookmarks, posts } from '@shared/schema';
import { verifyAuthToken } from '../auth-google';

function userIdOf(req: Request): number {
  return Number((req as any).user?.userId);
}

function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function cleanTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const tags = value.map((t) => String(t).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
  return tags.length ? tags : null;
}

function cleanNotes(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const notes = value.trim().slice(0, 2000);
  return notes || null;
}

const listColumns = {
  id: bookmarks.id,
  userId: bookmarks.userId,
  postId: bookmarks.postId,
  notes: bookmarks.notes,
  lastPosition: bookmarks.lastPosition,
  tags: bookmarks.tags,
  createdAt: bookmarks.createdAt,
  post: {
    id: posts.id,
    title: posts.title,
    excerpt: posts.excerpt,
    slug: posts.slug,
    themeCategory: posts.themeCategory,
    createdAt: posts.createdAt,
    readingTimeMinutes: posts.readingTimeMinutes,
  },
};

async function findBookmark(userId: number, postId: number) {
  const [row] = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
    .limit(1);
  return row ?? null;
}

export function registerBookmarksRoutes() {
  const router = Router();
  router.use(verifyAuthToken);
  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const rows = await db
        .select(listColumns)
        .from(bookmarks)
        .innerJoin(posts, eq(bookmarks.postId, posts.id))
        .where(eq(bookmarks.userId, userIdOf(req)))
        .orderBy(desc(bookmarks.createdAt));
      return res.json(rows);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  });

  router.get('/tag/:tag', async (req: Request, res: Response) => {
    try {
      const tag = String(req.params.tag || '').trim();
      const rows = await db
        .select(listColumns)
        .from(bookmarks)
        .innerJoin(posts, eq(bookmarks.postId, posts.id))
        .where(and(eq(bookmarks.userId, userIdOf(req)), arrayContains(bookmarks.tags, [tag])))
        .orderBy(desc(bookmarks.createdAt));
      return res.json(rows);
    } catch (error) {
      console.error('Error fetching bookmarks by tag:', error);
      return res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
  });

  // Import bookmarks saved on this device before signing in.
  router.post('/migrate', async (req: Request, res: Response) => {
    try {
      const userId = userIdOf(req);
      const local = (req.body?.local ?? {}) as Record<string, any>;
      const entries = Object.entries(local)
        .map(([id, b]) => ({ postId: parseId(id), b: b ?? {} }))
        .filter((e): e is { postId: number; b: any } => e.postId !== null)
        .slice(0, 500);
      if (entries.length === 0) return res.json({ success: true, migrated: 0, cleared: true });

      const existingPosts = await db
        .select({ id: posts.id })
        .from(posts)
        .where(inArray(posts.id, entries.map((e) => e.postId)));
      const valid = new Set(existingPosts.map((p: { id: number }) => p.id));

      const values = entries
        .filter((e) => valid.has(e.postId))
        .map((e) => ({
          userId,
          postId: e.postId,
          notes: cleanNotes(e.b.notes),
          tags: cleanTags(e.b.tags),
          lastPosition: typeof e.b.lastPosition === 'string' ? e.b.lastPosition.slice(0, 50) : '0',
        }));
      const inserted = values.length
        ? await db.insert(bookmarks).values(values).onConflictDoNothing().returning({ id: bookmarks.id })
        : [];
      return res.json({ success: true, migrated: inserted.length, cleared: true });
    } catch (error) {
      console.error('Error migrating bookmarks:', error);
      return res.status(500).json({ success: false, error: 'Failed to import bookmarks' });
    }
  });

  const status = async (req: Request, res: Response) => {
    const postId = parseId(req.params.postId);
    if (!postId) return res.status(400).json({ success: false, error: 'Invalid story id' });
    try {
      const bookmark = await findBookmark(userIdOf(req), postId);
      return res.json({ success: true, bookmarked: !!bookmark, bookmark });
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return res.status(500).json({ success: false, error: 'Failed to check bookmark' });
    }
  };
  router.get('/check/:postId', status);
  router.get('/:postId', status);

  router.post('/:postId', async (req: Request, res: Response) => {
    const postId = parseId(req.params.postId);
    if (!postId) return res.status(400).json({ success: false, error: 'Invalid story id' });
    try {
      const userId = userIdOf(req);
      const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post) return res.status(404).json({ success: false, error: 'Story not found' });
      await db
        .insert(bookmarks)
        .values({ userId, postId, notes: cleanNotes(req.body?.notes), tags: cleanTags(req.body?.tags), lastPosition: '0' })
        .onConflictDoNothing();
      const bookmark = await findBookmark(userId, postId);
      return res.status(201).json({ success: true, bookmark });
    } catch (error) {
      console.error('Error creating bookmark:', error);
      return res.status(500).json({ success: false, error: 'Failed to save bookmark' });
    }
  });

  router.patch('/:postId', async (req: Request, res: Response) => {
    const postId = parseId(req.params.postId);
    if (!postId) return res.status(400).json({ success: false, error: 'Invalid story id' });
    try {
      const userId = userIdOf(req);
      const current = await findBookmark(userId, postId);
      if (!current) return res.status(404).json({ success: false, error: 'Bookmark not found' });
      const body = req.body ?? {};
      const [bookmark] = await db
        .update(bookmarks)
        .set({
          notes: body.notes !== undefined ? cleanNotes(body.notes) : current.notes,
          tags: body.tags !== undefined ? cleanTags(body.tags) : current.tags,
          lastPosition: typeof body.lastPosition === 'string' ? body.lastPosition.slice(0, 50) : current.lastPosition,
        })
        .where(eq(bookmarks.id, current.id))
        .returning();
      return res.json({ success: true, bookmark });
    } catch (error) {
      console.error('Error updating bookmark:', error);
      return res.status(500).json({ success: false, error: 'Failed to update bookmark' });
    }
  });

  router.delete('/:postId', async (req: Request, res: Response) => {
    const postId = parseId(req.params.postId);
    if (!postId) return res.status(400).json({ success: false, error: 'Invalid story id' });
    try {
      await db.delete(bookmarks).where(and(eq(bookmarks.userId, userIdOf(req)), eq(bookmarks.postId, postId)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      return res.status(500).json({ success: false, error: 'Failed to remove bookmark' });
    }
  });

  return router;
}
