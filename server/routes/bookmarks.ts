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

/**
 * GET /api/bookmarks
 * 
 * Get all bookmarks for the current authenticated user (with post details)
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
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
 * GET /api/bookmarks/:postId
 * 
 * Check if a post is bookmarked by the current user
 */
router.get('/:postId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const rawPostId = parseInt(req.params.postId);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    // Resolve local post ID for WordPress IDs
    const postId = await resolveLocalPostId(rawPostId);
    
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
    const userId = req.user?.id;
    const rawPostId = parseInt(req.params.postId);
    const { notes, tags } = (req.body || {}) as { notes?: string; tags?: string[] };
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    // Resolve local post ID for WordPress IDs
    const postId = await resolveLocalPostId(rawPostId);
    
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
    const userId = req.user?.id;
    const rawPostId = parseInt(req.params.postId);
    const { notes, tags, lastPosition } = (req.body || {}) as { notes?: string; tags?: string[]; lastPosition?: string };
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }
    if (isNaN(rawPostId)) {
      res.status(400).json({ success: false, message: 'Invalid post ID' });
      return;
    }

    const postId = await resolveLocalPostId(rawPostId);

    const [updated] = await db
      .update(bookmarks)
      .set({
        ...(notes !== undefined ? { notes } : {}),
        ...(Array.isArray(tags) ? { tags } : {}),
        ...(typeof lastPosition === 'string' ? { lastPosition } : {}),
      })
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Bookmark not found' });
      return;
    }

    res.json({ success: true, bookmark: updated });
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
    const userId = req.user?.id;
    const rawPostId = parseInt(req.params.postId);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(rawPostId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
      return;
    }

    const postId = await resolveLocalPostId(rawPostId);
    
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

export default router;