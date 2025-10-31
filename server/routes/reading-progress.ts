import { Router } from 'express';
import { db } from '../db';
import { readingProgress, posts as postsTable } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createSecureLogger } from '../utils/secure-logger';

const router = Router();
const logger = createSecureLogger('ReadingProgressRoutes');

// POST /api/reading-progress - upsert progress for current user by slug
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { postSlug, percentCompleted } = req.body || {};

    if (!postSlug || typeof postSlug !== 'string') {
      return res.status(400).json({ error: 'postSlug is required' });
    }
    const percent = Number(percentCompleted);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return res.status(400).json({ error: 'percentCompleted must be a number between 0 and 100' });
    }

    // Resolve postId from slug
    const [postRow] = await db.select({ id: postsTable.id }).from(postsTable).where(eq(postsTable.slug, postSlug)).limit(1);
    if (!postRow?.id) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const postId = Number(postRow.id);

    // We simply insert a new reading progress record; consumers can take the latest one
    const [inserted] = await db.insert(readingProgress)
      .values({
        postId,
        userId: Number(userId),
        progress: String(percent),
        lastReadAt: new Date()
      } as any)
      .returning();

    logger.info('Reading progress saved', { userId, postId, percent });
    return res.status(201).json({ success: true, progress: inserted });
  } catch (error: any) {
    logger.error('Failed to save reading progress', { error: error?.message });
    return res.status(500).json({ error: 'Failed to save reading progress' });
  }
});

// GET /api/reading-progress/:slug - latest progress for current user
router.get('/:slug', async (req, res) => {
  try {
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const slug = String(req.params.slug || '');
    if (!slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    // Resolve postId
    const [postRow] = await db.select({ id: postsTable.id }).from(postsTable).where(eq(postsTable.slug, slug)).limit(1);
    if (!postRow?.id) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const postId = Number(postRow.id);

    // Fetch latest progress for user/post
    const rows = await db.select().from(readingProgress)
      .where(and(eq(readingProgress.userId, Number(userId)), eq(readingProgress.postId, postId)))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(1);

    if (!rows.length) {
      return res.json({ progress: null });
    }
    const row = rows[0] as any;
    return res.json({
      progress: {
        postId,
        userId: Number(userId),
        percentCompleted: Number(row.progress),
        lastReadAt: row.lastReadAt
      }
    });
  } catch (error: any) {
    logger.error('Failed to fetch reading progress', { error: error?.message });
    return res.status(500).json({ error: 'Failed to fetch reading progress' });
  }
});

export default router;