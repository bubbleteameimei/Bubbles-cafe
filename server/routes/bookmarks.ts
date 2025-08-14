/**
 * Bookmarks Routes
 * 
 * API routes for handling user bookmarks
 */

import { Router } from 'express';
import logger from '../utils/logger';
import { isAuthenticated } from '../middlewares/auth';
import { db } from '../db';
import { and, eq } from 'drizzle-orm';
import { bookmarks } from '../../shared/schema';

const router = Router();

/**
 * GET /api/reader/bookmarks
 * 
 * Get all bookmarks for the current user
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

    const userBookmarks = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.userId, userId));
    
    res.json({
      success: true,
      bookmarks: userBookmarks
    });
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
 * GET /api/reader/bookmarks/:postId
 * 
 * Check if a post is bookmarked by the current user
 */
router.get('/:postId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const postId = parseInt(req.params.postId);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
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
 * POST /api/reader/bookmarks/:postId
 * 
 * Bookmark a post
 */
router.post('/:postId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const postId = parseInt(req.params.postId);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
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
 * DELETE /api/reader/bookmarks/:postId
 * 
 * Remove a bookmark
 */
router.delete('/:postId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const postId = parseInt(req.params.postId);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    if (isNaN(postId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid post ID'
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

export default router;