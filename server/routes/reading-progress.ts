import { Router } from 'express';
import { db } from '../db';
import { readingProgress, posts as postsTable } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { createSecureLogger } from '../utils/secure-logger';
import { createSupabaseClientWithToken } from '../utils/supabase';

const router = Router();
const logger = createSecureLogger('ReadingProgressRoutes');

/**
 * Try to create a Supabase client from the request Authorization header.
 * Returns null if no Bearer token is present.
 */
function getSupabaseClientFromRequest(req: any) {
  const header = req.get?.('Authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : undefined;
  if (!bearer) return null;
  try {
    return createSupabaseClientWithToken(bearer);
  } catch {
    return null;
  }
}

/**
 * Resolve the local numeric user ID using Supabase JWT (auth.uid/email) via Supabase tables.
 * Falls back to session user id when Supabase lookups fail.
 */
async function resolveNumericUserId(req: any, supabase: any): Promise<number | null> {
  try {
    // Get JWT user claims
    const { data: userResult, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userResult?.user) return null;
    const uid = userResult.user.id;
    const email = (userResult.user.email || '').toLowerCase();

    // Prefer mapping via metadata->>supabaseUserId
    const { data: byUid, error: uidErr } = await supabase
      .from('users')
      .select('id, metadata')
      .eq('metadata->>supabaseUserId', uid)
      .limit(1)
      .maybeSingle();

    if (!uidErr && byUid?.id) {
      return Number(byUid.id);
    }

    // Fallback to email match if permitted by policy
    if (email) {
      const { data: byEmail, error: emailErr } = await supabase
        .from('users')
        .select('id')
        .ilike('email', email)
        .limit(1)
        .maybeSingle();
      if (!emailErr && byEmail?.id) {
        return Number(byEmail.id);
      }
    }

    return null;
  } catch {
    return null;
  }
}

// POST /api/reading-progress - upsert progress for current user by slug
router.post('/', async (req, res) => {
  try {
    const { postSlug, percentCompleted } = req.body || {};
    if (!postSlug || typeof postSlug !== 'string') {
      return res.status(400).json({ error: 'postSlug is required' });
    }
    const percent = Number(percentCompleted);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return res.status(400).json({ error: 'percentCompleted must be a number between 0 and 100' });
    }

    // Attempt Supabase path first (RLS-enforced)
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      // Resolve postId via slug
      const { data: postRow, error: postErr } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', postSlug)
        .limit(1)
        .maybeSingle();
      if (postErr) {
        logger.warn('Supabase post lookup failed, falling back to server DB', { error: postErr.message });
      }
      const postId = Number(postRow?.id || NaN);

      // Resolve numeric user id via Supabase
      const numericUserId = await resolveNumericUserId(req, supabase);
      if (!Number.isFinite(postId) || !Number.isFinite(numericUserId)) {
        // Fall back to server session/db if Supabase path is incomplete
        logger.warn('Supabase path incomplete (postId or userId missing), falling back to server DB');
      } else {
        // Insert reading progress via Supabase (RLS applies)
        const { error: insErr } = await supabase
          .from('reading_progress')
          .insert({
            post_id: postId,
            user_id: numericUserId,
            progress: String(percent),
            last_read_at: new Date().toISOString()
          });
        if (!insErr) {
          logger.info('Reading progress saved via Supabase', { userId: numericUserId, postId, percent });
          return res.status(201).json({ success: true });
        }
        logger.warn('Supabase insert failed, falling back to server DB', { error: insErr.message });
      }
    }

    // Server DB fallback path (session-based)
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [postRowDb] = await db.select({ id: postsTable.id }).from(postsTable).where(eq(postsTable.slug, postSlug)).limit(1);
    if (!postRowDb?.id) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const postIdDb = Number(postRowDb.id);

    const [inserted] = await db.insert(readingProgress)
      .values({
        postId: postIdDb,
        userId: Number(userId),
        progress: String(percent),
        lastReadAt: new Date()
      } as any)
      .returning();

    logger.info('Reading progress saved (server DB)', { userId, postId: postIdDb, percent });
    return res.status(201).json({ success: true, progress: inserted });
  } catch (error: any) {
    logger.error('Failed to save reading progress', { error: error?.message });
    return res.status(500).json({ error: 'Failed to save reading progress' });
  }
});

// GET /api/reading-progress/:slug - latest progress for current user
router.get('/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '');
    if (!slug) {
      return res.status(400).json({ error: 'slug is required' });
    }

    // Try Supabase path first
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const numericUserId = await resolveNumericUserId(req, supabase);
      const { data: postRow, error: postErr } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', slug)
        .limit(1)
        .maybeSingle();
      const postId = Number(postRow?.id || NaN);

      if (!postErr && Number.isFinite(numericUserId) && Number.isFinite(postId)) {
        const { data: rows, error: selErr } = await supabase
          .from('reading_progress')
          .select('post_id, user_id, progress, last_read_at')
          .eq('user_id', numericUserId)
          .eq('post_id', postId)
          .order('last_read_at', { ascending: false })
          .limit(1);
        if (!selErr && rows && rows.length > 0) {
          const row = rows[0] as any;
          return res.json({
            progress: {
              postId,
              userId: Number(numericUserId),
              percentCompleted: Number(row.progress),
              lastReadAt: row.last_read_at
            }
          });
        }
        if (selErr) {
          logger.warn('Supabase select failed, falling back to server DB', { error: selErr.message });
        }
      } else {
        if (postErr) logger.warn('Supabase post lookup failed', { error: postErr.message });
      }
    }

    // Server DB fallback
    const userId = (req as any).user?.id ?? (req.session as any)?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const [postRowDb] = await db.select({ id: postsTable.id }).from(postsTable).where(eq(postsTable.slug, slug)).limit(1);
    if (!postRowDb?.id) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const postIdDb = Number(postRowDb.id);

    const rowsDb = await db.select().from(readingProgress)
      .where(and(eq(readingProgress.userId, Number(userId)), eq(readingProgress.postId, postIdDb)))
      .orderBy(desc(readingProgress.lastReadAt))
      .limit(1);

    if (!rowsDb.length) {
      return res.json({ progress: null });
    }
    const row = rowsDb[0] as any;
    return res.json({
      progress: {
        postId: postIdDb,
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