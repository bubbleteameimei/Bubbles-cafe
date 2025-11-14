/**
 * Bookmark Routes Registration
 *
 * Registers authenticated bookmark routes only.
 * Anonymous bookmark routes have been removed.
 */

import { Application } from 'express';
import bookmarkRoutes from './bookmarks';

export function registerBookmarkRoutes(app: Application): void {
  app.use('/api/bookmarks', bookmarkRoutes);
}