/**
 * Bookmarks Routes
 * 
 * API routes for handling user bookmarks
 */

import { Router } from 'express';
import logger from '../utils/logger';
import { isAuthenticated } from '../middlewares/auth';
import { db } from '../db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { bookmarks, posts as postsTable } from '../../shared/schema';
import { storage } from '../storage';
import { createSupabaseClientWithToken } from '../utils/supabase';

const router = Router();

/**
 * Resolve a target local post ID from a provided identifier.
 * Accepts either a local post ID or a WordPress external ID.
 * - If the ID matches a local post, returns it.
 * - Otherwise attempts to find a local post where metadata.wordpressId equals the provided ID.
 * - If still not found, a placeholder is created to ensure the bookmark can reference a valid post.
 */
async function resolveLocalPostId(rawId: number): Promise<number> {
  // Try direct local ID
  try {
    const direct = await storage.getPostById(rawId);
    if (direct && typeof direct.id === 'number') {
      return Number(direct.id);
    }
  } catch (_) {
    // ignore and continue
  }

  // Try mapping via metadata.wordpressId
  try {
    const result = await db.execute(sql`
      SELECT id 
      FROM posts 
      WHERE (metadata->>'wordpressId')::int = ${rawId}
      LIMIT 1
    `);
    const row = (result as any)?.rows?.[0];
    if (row && typeof row.id === 'number') {
      return Number(row.id);
    }
  } catch (_) {
    // ignore and continue
  }

  // Create a placeholder post if not found so bookmark has a valid target
  try {
    const placeholderSlug = `wordpress-post-${rawId}`;
    const inserted = await storage.createPost({
      title: `WordPress Post ${rawId}`,
      content: 'Placeholder for WordPress post bookmark',
      slug: placeholderSlug,
      authorId: 1,
      isAdminPost: true,
      metadata: { wordpressId: rawId, isPlaceholder: true, source: 'wordpress_api' } as any
    } as any);
    return Number(inserted.id);
  } catch (e) {
    // As a last resort, fall back to the raw ID to avoid complete failure
    logger.warn('[Bookmarks] Failed to resolve local post id; using raw id', {
      rawId,
      error: e instanceof Error ? e.message : String(e)
    });
    return rawId;
  }
}

// Supabase helpers
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

async function resolveNumericUserId(req: any, supabase: any): Promise<number | null> {
  try {
    const { data: userResult, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userResult?.user) return null;
    const uid = userResult.user.id;
    const email = (userResult.user.email || '').toLowerCase();

    const { data: byUid, error: uidErr } = await supabase
      .from('users')
      .select('id, metadata')
      .eq('metadata->>supabaseUserId', uid)
      .limit(1)
      .maybeSingle();

    if (!uidErr && byUid?.id) {
      return Number(byUid.id);
    }

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

/**
 * GET /api/bookmarks
 * 
 * Get all bookmarks for the current authenticated user (with post details)
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Try Supabase path first
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        const { data: userBookmarks, error: bkErr } = await supabase
          .from('bookmarks')
          .select('id, user_id, post_id, created_at, notes, tags, last_position')
          .eq('user_id', userIdNum)
          .order('created_at', { ascending: false });
        if (!bkErr && Array.isArray(userBookmarks)) {
          const postIds = userBookmarks.map((b: any) => Number(b.post_id)).filter((n: number) => Number.isFinite(n));
          let postsMap = new Map<number, any>();
          if (postIds.length) {
            const { data: postsData } = await supabase
              .from('posts')
              .select('id, title, slug, excerpt, created_at')
              .in('id', postIds);
            (postsData || []).forEach((p: any) => postsMap.set(Number(p.id), {
              id: Number(p.id),
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              createdAt: p.created_at
            }));
          }
          const enriched = userBookmarks
            .map((b: any) => ({
              id: b.id,
              userId: userIdNum,
              postId: Number(b.post_id),
              createdAt: b.created_at,
              notes: b.notes ?? null,
              tags: Array.isArray(b.tags) ? b.tags : null,
              lastPosition: b.last_position ?? '0',
              post: postsMap.get(Number(b.post_id))
            }))
            .filter((b: any) => !!b.post);
          return res.json(enriched);
        }
        logger.warn('[Bookmarks] Supabase fetch failed, falling back to server DB', { error: bkErr?.message });
      }
    }

    // Server DB fallback path
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Prefer storage implementation which returns post details
    try {
      const result = await storage.getUserBookmarks(userId);
      // Return plain array to match client expectations
      res.json(result);
      return;
    } catch (e) {
      // Fallback to manual join on failure
      logger.warn('[Bookmarks] storage.getUserBookmarks failed, falling back to manual join', {
        error: e instanceof Error ? e.message : String(e)
      });
    }

    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));

    const postIds = userBookmarks.map((b: any) => b.postId);
    const posts = postIds.length
      ? await db.select().from(postsTable).where(inArray(postsTable.id, postIds))
      : [];
    const postsMap = new Map<number, any>();
    posts.forEach((p: any) => postsMap.set(p.id, p));

    const enriched = userBookmarks
      .map((b: any) => ({
        ...b,
        post: postsMap.get(b.postId)
      }))
      .filter((b: any) => !!b.post);

    res.json(enriched);
    return;
  } catch (error: any) {
    logger.error('[Bookmarks] Error fetching user bookmarks', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error.message
    });
    return;
  }
});

/**
 * GET /api/bookmarks/tag/:tag
 * 
 * Get bookmarks filtered by tag for the current authenticated user.
 * Uses Supabase JWT + RLS when available, with server DB fallback.
 */
router.get('/tag/:tag', isAuthenticated, async (req, res) => {
  try {
    const tag = String(req.params.tag || '').trim();
    if (!tag) {
      res.status(400).json({ success: false, message: 'Tag is required' });
      return;
    }

    // Supabase path first
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        const { data: rows, error: selErr } = await supabase
          .from('bookmarks')
          .select('id, user_id, post_id, created_at, notes, tags, last_position')
          .eq('user_id', userIdNum)
          .contains('tags', [tag])
          .order('created_at', { ascending: false });
        if (!selErr && Array.isArray(rows)) {
          const postIds = rows.map((b: any) => Number(b.post_id)).filter((n: number) => Number.isFinite(n));
          let postsMap = new Map<number, any>();
          if (postIds.length) {
            const { data: postsData } = await supabase
              .from('posts')
              .select('id, title, slug, excerpt, created_at')
              .in('id', postIds);
            (postsData || []).forEach((p: any) => postsMap.set(Number(p.id), {
              id: Number(p.id),
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              createdAt: p.created_at
            }));
          }
          const enriched = rows.map((b: any) => ({
            id: b.id,
            userId: userIdNum,
            postId: Number(b.post_id),
            createdAt: b.created_at,
            notes: b.notes ?? null,
            tags: Array.isArray(b.tags) ? b.tags : null,
            lastPosition: b.last_position ?? '0',
            post: postsMap.get(Number(b.post_id))
          })).filter((b: any) => !!b.post);
          return res.json(enriched);
        }
        logger.warn('[Bookmarks] Supabase tag fetch failed, falling back to server DB', { error: selErr?.message });
      }
    }

    // Server DB fallback
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    try {
      const result = await storage.getBookmarksByTag(userId, tag);
      res.json(result);
      return;
    } catch (e) {
      logger.error('[Bookmarks] Error fetching bookmarks by tag', { error: e instanceof Error ? e.message : String(e) });
      res.status(500).json({ success: false, message: 'Failed to fetch bookmarks by tag' });
      return;
    }
  } catch (error: any) {
    logger.error('[Bookmarks] Error in tag route', { error: error.message });
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
});

/**
 * GET /api/bookmarks/:postId
 * 
 * Check if a post is bookmarked by the current user
 */
router.get('/:postId', isAuthenticated, async (req, res) => {
  try {
    const rawPostId = parseInt(req.params.postId);
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    // Resolve local post ID for WordPress IDs
    const postId = await resolveLocalPostId(rawPostId);

    // Supabase path first
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        const { data: rows, error: selErr } = await supabase
          .from('bookmarks')
          .select('id, user_id, post_id, created_at, notes, tags, last_position')
          .eq('user_id', userIdNum)
          .eq('post_id', postId)
          .limit(1);
        if (!selErr) {
          const bookmarked = Array.isArray(rows) && rows.length > 0;
          const bookmark = bookmarked ? rows[0] : null;
          return res.json({
            success: true,
            bookmarked,
            bookmark
          });
        }
        logger.warn('[Bookmarks] Supabase check failed, falling back to server DB', { error: selErr?.message });
      }
    }

    // Server DB fallback
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const bookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        )
      )
      .limit(1);
    
    res.json({
      success: true,
      bookmarked: bookmark.length > 0,
      bookmark: bookmark[0] || null
    });
    return;
  } catch (error: any) {
    logger.error('[Bookmarks] Error checking bookmark status', {
      error: error.message,
      stack: error.stack,
      postId: req.params.postId
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to check bookmark status',
      error: error.message
    });
    return;
  }
});

/**
 * POST /api/bookmarks/:postId
 * 
 * Bookmark a post (supports notes/tags)
 */
router.post('/:postId', isAuthenticated, async (req, res) => {
  try {
    const rawPostId = parseInt(req.params.postId);
    const { notes, tags } = (req.body || {}) as { notes?: string; tags?: string[] };
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    // Resolve local post ID for WordPress IDs
    const postId = await resolveLocalPostId(rawPostId);

    // Supabase path first
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        // Check existing
        const { data: existingRows, error: selErr } = await supabase
          .from('bookmarks')
          .select('id, user_id, post_id, notes, tags, last_position')
          .eq('user_id', userIdNum)
          .eq('post_id', postId)
          .limit(1);
        if (!selErr && existingRows && existingRows.length > 0) {
          // Update details if provided
          if (notes !== undefined || tags !== undefined) {
            const { data: upd, error: updErr } = await supabase
              .from('bookmarks')
              .update({
                ...(notes !== undefined ? { notes } : {}),
                ...(Array.isArray(tags) ? { tags } : {}),
              })
              .eq('user_id', userIdNum)
              .eq('post_id', postId)
              .select()
              .limit(1);
            if (!updErr) {
              return res.json({
                success: true,
                message: 'Post already bookmarked; details updated',
                bookmark: upd && upd[0]
              });
            }
          }
          return res.json({
            success: true,
            message: 'Post already bookmarked',
            bookmark: existingRows[0]
          });
        }
        // Insert new bookmark
        const { data: inserted, error: insErr } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userIdNum,
            post_id: postId,
            notes: notes ?? null,
            tags: Array.isArray(tags) ? tags : null,
            last_position: '0'
          })
          .select()
          .limit(1);
        if (!insErr) {
          return res.status(201).json({
            success: true,
            message: 'Post bookmarked successfully',
            bookmark: inserted && inserted[0]
          });
        }
        logger.warn('[Bookmarks] Supabase insert failed, falling back to server DB', { error: insErr?.message });
      }
    }

    // Server DB fallback
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    // Check if already bookmarked
    const existingBookmark = await db
      .select()
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        )
      )
      .limit(1);
    
    if (existingBookmark.length > 0) {
      // If already exists, update notes/tags if provided
      if (notes !== undefined || tags !== undefined) {
        const [updated] = await db
          .update(bookmarks)
          .set({
            ...(notes !== undefined ? { notes } : {}),
            ...(Array.isArray(tags) ? { tags } : {}),
          })
          .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
          .returning();
        res.json({
          success: true,
          message: 'Post already bookmarked; details updated',
          bookmark: updated || existingBookmark[0]
        });
        return;
      }

      res.json({
        success: true,
        message: 'Post already bookmarked',
        bookmark: existingBookmark[0]
      });
      return;
    }
    
    // Create new bookmark
    const now = new Date();
    const newBookmark = await db
      .insert(bookmarks)
      .values({
        userId,
        postId,
        notes: notes ?? null,
        tags: Array.isArray(tags) ? tags : null,
        lastPosition: '0',
        createdAt: now
      })
      .returning();
    
    res.status(201).json({
      success: true,
      message: 'Post bookmarked successfully',
      bookmark: newBookmark[0]
    });
    return;
  } catch (error: any) {
    logger.error('[Bookmarks] Error creating bookmark', {
      error: error.message,
      stack: error.stack,
      postId: req.params.postId
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark post',
      error: error.message
    });
    return;
  }
});

/**
 * PATCH /api/bookmarks/:postId
 * 
 * Update bookmark details (notes, tags, lastPosition)
 */
router.patch('/:postId', isAuthenticated, async (req, res) => {
  try {
    const rawPostId = parseInt(req.params.postId);
    const { notes, tags, lastPosition } = (req.body || {}) as { notes?: string; tags?: string[]; lastPosition?: string };
    if (isNaN(rawPostId)) {
      res.status(400).json({ success: false, message: 'Invalid post ID' });
      return;
    }

    const postId = await resolveLocalPostId(rawPostId);

    // Supabase path
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        const { data: updated, error: updErr } = await supabase
          .from('bookmarks')
          .update({
            ...(notes !== undefined ? { notes } : {}),
            ...(Array.isArray(tags) ? { tags } : {}),
            ...(typeof lastPosition === 'string' ? { last_position: lastPosition } : {}),
          })
          .eq('user_id', userIdNum)
          .eq('post_id', postId)
          .select()
          .limit(1);
        if (!updErr && updated && updated.length > 0) {
          return res.json({ success: true, bookmark: updated[0] });
        }
        logger.warn('[Bookmarks] Supabase update failed, falling back to server DB', { error: updErr?.message });
      }
    }

    // Server DB fallback
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const [updatedDb] = await db
      .update(bookmarks)
      .set({
        ...(notes !== undefined ? { notes } : {}),
        ...(Array.isArray(tags) ? { tags } : {}),
        ...(typeof lastPosition === 'string' ? { lastPosition } : {}),
      })
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .returning();

    if (!updatedDb) {
      res.status(404).json({ success: false, message: 'Bookmark not found' });
      return;
    }

    res.json({ success: true, bookmark: updatedDb });
    return;
  } catch (error: any) {
    logger.error('[Bookmarks] Error updating bookmark', {
      error: error.message,
      stack: error.stack,
      postId: req.params.postId
    });
    res.status(500).json({ success: false, message: 'Failed to update bookmark', error: error.message });
    return;
  }
});

/**
 * DELETE /api/bookmarks/:postId
 * 
 * Remove a bookmark
 */
router.delete('/:postId', isAuthenticated, async (req, res) => {
  try {
    const rawPostId = parseInt(req.params.postId);
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    const postId = await resolveLocalPostId(rawPostId);

    // Supabase path
    const supabase = getSupabaseClientFromRequest(req);
    if (supabase) {
      const userIdNum = await resolveNumericUserId(req, supabase);
      if (Number.isFinite(userIdNum)) {
        const { data: deleted, error: delErr } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userIdNum)
          .eq('post_id', postId)
          .select()
          .limit(1);
        if (!delErr) {
          if (!deleted || deleted.length === 0) {
            return res.status(404).json({ success: false, message: 'Bookmark not found' });
          }
          return res.json({
            success: true,
            message: 'Bookmark removed successfully',
            bookmark: deleted[0]
          });
        }
        logger.warn('[Bookmarks] Supabase delete failed, falling back to server DB', { error: delErr?.message });
      }
    }

    // Server DB fallback
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const deletedBookmarks = await db
      .delete(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, userId),
          eq(bookmarks.postId, postId)
        )
      )
      .returning();
    
    if (deletedBookmarks.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Bookmark removed successfully',
      bookmark: deletedBookmarks[0]
    });
    return;
  } catch (error: any) {
    logger.error('[Bookmarks] Error removing bookmark', {
      error: error.message,
      stack: error.stack,
      postId: req.params.postId
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: error.message
    });
    return;
  }
});

// Migration: preview migratable count from anonymous session
router.get('/migrate', isAuthenticated, async (req, res) => {
  try {
    const anon = (req as any).session?.anonymousBookmarks || req.session?.anonymousBookmarks || {};
    const count = Object.keys(anon || {}).length;
    return res.json({ success: true, migratable: count });
  } catch (error: any) {
    logger.error('[Bookmarks] Migration dry-run failed', { error: error.message });
    return res.status(500).json({ success: false, message: 'Failed to check migratable bookmarks' });
  }
});

// Migration: import anonymous session bookmarks into authenticated account
router.post('/migrate', isAuthenticated, async (req, res) => {
  try {
    // Prefer client-provided local payload when available; fall back to session store
    const localPayload = (req.body && typeof req.body.local === 'object') ? (req.body.local as Record<number, any>) : null;
    const anon = localPayload || (req as any).session?.anonymousBookmarks || req.session?.anonymousBookmarks || {};
    const entries = Object.entries(anon || {});
    if (!entries.length) {
      return res.json({ success: true, migrated: 0, cleared: false });
    }

    // Try Supabase path first
    const supabase = getSupabaseClientFromRequest(req as any);
    let migrated = 0;

    if (supabase) {
      const userIdNum = await resolveNumericUserId(req as any, supabase);
      if (Number.isFinite(userIdNum)) {
        for (const [rawId, b] of entries as any[]) {
          const wpOrLocalId = Number(rawId);
          if (!Number.isFinite(wpOrLocalId)) continue;
          const postId = await resolveLocalPostId(wpOrLocalId);

          // Check existing
          const { data: rows, error: selErr } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userIdNum)
            .eq('post_id', postId)
            .limit(1);

          if (!selErr && rows && rows.length > 0) {
            continue;
          }

          const { error: insErr } = await supabase
            .from('bookmarks')
            .insert({
              user_id: userIdNum,
              post_id: postId,
              notes: b?.notes ?? null,
              tags: Array.isArray(b?.tags) ? b.tags : null,
              last_position: typeof b?.lastPosition === 'string' ? b.lastPosition : '0',
            });

          if (!insErr) migrated += 1;
        }
      }
    }

    // Server DB fallback
    if (migrated === 0) {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      for (const [rawId, b] of entries as any[]) {
        const wpOrLocalId = Number(rawId);
        if (!Number.isFinite(wpOrLocalId)) continue;
        const postId = await resolveLocalPostId(wpOrLocalId);

        // Check if already bookmarked
        const existing = await db
          .select()
          .from(bookmarks)
          .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
          .limit(1);

        if (existing && existing.length > 0) continue;

        const now = new Date();
        const [ins] = await db
          .insert(bookmarks)
          .values({
            userId,
            postId,
            notes: b?.notes ?? null,
            tags: Array.isArray(b?.tags) ? b.tags : null,
            lastPosition: typeof b?.lastPosition === 'string' ? b.lastPosition : '0',
            createdAt: now,
          })
          .returning();

        if (ins) migrated += 1;
      }
    }

    // Clear anonymous session bookmarks after migration when using session store
    try {
      if (!localPayload && (req as any).session?.anonymousBookmarks) {
        (req as any).session.anonymousBookmarks = {};
      } else if (!localPayload && req.session?.anonymousBookmarks) {
        (req.session as any).anonymousBookmarks = {};
      }
    } catch {}

    return res.json({ success: true, migrated, cleared: true });
  } catch (error: any) {
    logger.error('[Bookmarks] Migration failed', { error: error.message, stack: error.stack });
    return res.status(500).json({ success: false, message: 'Failed to migrate bookmarks' });
  }
});

export default router;