/**
 * Bookmark Routes Registration
 * 
 * This file registers bookmark routes.
 */

import { Application, NextFunction } from 'express';
import bookmarkRoutes from './bookmarks';
import { Router } from 'express';
import { Request, Response } from 'express';

// Create a router for anonymous bookmark routes
const anonymousBookmarkRouter = Router();

/**
 * Check anonymous bookmark
 */
anonymousBookmarkRouter.get('/:postId', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    // Initialize if doesn't exist
    if (!req.session.anonymousBookmarks) {
      req.session.anonymousBookmarks = {};
    }
    
    const isBookmarked = req.session.anonymousBookmarks[postId] ? true : false;
    
    if (!isBookmarked) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    
    const bookmark = {
      id: 0, // Not needed for anonymous bookmarks
      userId: 0, // Anonymous user
      postId,
      notes: req.session.anonymousBookmarks[postId].notes || null,
      tags: req.session.anonymousBookmarks[postId].tags || null,
      lastPosition: req.session.anonymousBookmarks[postId].lastPosition || "0",
      createdAt: req.session.anonymousBookmarks[postId].createdAt || new Date().toISOString()
    };
    
    return res.json(bookmark);
  } catch (error) {
    console.error("Error fetching anonymous bookmark:", error);
    return res.status(500).json({ error: "Failed to fetch bookmark" });
  }
});

/**
 * Get all anonymous bookmarks
 */
anonymousBookmarkRouter.get('/', async (req: Request, res: Response) => {
  try {
    // Initialize if doesn't exist
    if (!req.session.anonymousBookmarks) {
      req.session.anonymousBookmarks = {};
    }
    
    // If there are no bookmarks, return an empty array immediately
    if (Object.keys(req.session.anonymousBookmarks).length === 0) {
      return res.json([]);
    }
    
    // Filter by tag if provided in query params
    const tagFilter = req.query.tag as string | undefined;
    
    // For each bookmark in the session, create a bookmark object
    const bookmarks = Object.entries(req.session.anonymousBookmarks).map(([postId, bookmark]) => {
      // Skip if tag filter is provided and this bookmark doesn't have the tag
      if (tagFilter && (!bookmark.tags || !bookmark.tags.includes(tagFilter))) {
        return null;
      }
      
      // Return a simplified bookmark object without the post data
      // This makes the anonymous bookmarks API match the behavior of the authenticated bookmarks API
      return {
        id: 0, // Not needed for anonymous bookmarks
        userId: 0, // Anonymous user
        postId: parseInt(postId, 10),
        notes: bookmark.notes,
        tags: bookmark.tags,
        lastPosition: bookmark.lastPosition || "0",
        createdAt: bookmark.createdAt
      };
    }).filter(Boolean);
    
    // Sort by most recent first
    bookmarks.sort((a, b) => 
      new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime()
    );
    
    return res.json(bookmarks);
  } catch (error) {
    console.error("Error fetching anonymous bookmarks:", error);
    return res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

/**
 * Create anonymous bookmark
 */
anonymousBookmarkRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { postId, notes, tags } = req.body;
    
    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }
    
    // Initialize if doesn't exist
    if (!req.session.anonymousBookmarks) {
      req.session.anonymousBookmarks = {};
    }
    
    const bookmark = {
      notes: notes || null,
      tags: tags || null,
      lastPosition: "0",
      createdAt: new Date().toISOString()
    };
    
    req.session.anonymousBookmarks[postId] = bookmark;
    
    return res.status(201).json({
      id: 0,
      userId: 0,
      postId,
      ...bookmark
    });
  } catch (error) {
    console.error("Error creating anonymous bookmark:", error);
    return res.status(500).json({ error: "Failed to create bookmark" });
  }
});

/**
 * Update anonymous bookmark
 */
anonymousBookmarkRouter.patch('/:postId', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    // Initialize if doesn't exist
    if (!req.session.anonymousBookmarks) {
      req.session.anonymousBookmarks = {};
    }
    
    const existingBookmark = req.session.anonymousBookmarks[postId];
    if (!existingBookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    
    const { notes, tags, lastPosition } = req.body;
    
    // Update only provided fields
    if (notes !== undefined) existingBookmark.notes = notes;
    if (tags !== undefined) existingBookmark.tags = tags;
    if (lastPosition !== undefined) existingBookmark.lastPosition = lastPosition;
    
    return res.json({
      id: 0,
      userId: 0,
      postId,
      ...existingBookmark
    });
  } catch (error) {
    console.error("Error updating anonymous bookmark:", error);
    return res.status(500).json({ error: "Failed to update bookmark" });
  }
});

/**
 * Delete anonymous bookmark
 */
anonymousBookmarkRouter.delete('/:postId', async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId);
    
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    
    // Initialize if doesn't exist
    if (!req.session.anonymousBookmarks) {
      req.session.anonymousBookmarks = {};
    }
    
    const existingBookmark = req.session.anonymousBookmarks[postId];
    if (!existingBookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    
    delete req.session.anonymousBookmarks[postId];
    
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting anonymous bookmark:", error);
    return res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

/**
 * Register bookmark routes
 * 
 * @param app Express application
 */
export function registerBookmarkRoutes(app: Application): void {
  // Mount authenticated bookmark routes
  app.use('/api/bookmarks', bookmarkRoutes);
  
  // Create a special middleware that disables secondary CSRF checks for these routes
  const bypassSecondaryCSRF = (_req: Request, _res: Response, next: NextFunction) => {
    // Bypass CSRF for this specific route
    next();
  };
  
  // Mount anonymous bookmark routes with CSRF bypass middleware
  app.use('/api/reader/bookmarks', bypassSecondaryCSRF, anonymousBookmarkRouter);
}