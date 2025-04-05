/**
 * Bookmark Routes Registration
 * 
 * This file registers bookmark routes.
 */

import { Application } from 'express';
import bookmarkRoutes from './bookmarks';

/**
 * Register bookmark routes
 * 
 * @param app Express application
 */
export function registerBookmarkRoutes(app: Application): void {
  // Mount bookmark routes under /api/reader/bookmarks prefix
  app.use('/api/reader/bookmarks', bookmarkRoutes);
}