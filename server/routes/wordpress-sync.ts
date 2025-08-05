/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Router, Request, Response, NextFunction } from 'express';
import { syncSingleWordPressPost } from '../wordpress-sync';

const router = Router();

// Middleware functions (simplified for now)
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  next(); // Skip auth for now
}

function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  next(); // Skip CSRF for now
}

function rateLimit(req: Request, res: Response, next: NextFunction): void {
  next(); // Skip rate limiting for now
}

/**
 * Register WordPress sync routes
 */
export function registerWordPressSyncRoutes(app: any) {
  console.log('Registering WordPress sync routes');

  // Manual sync trigger
  app.post('/api/wordpress/sync', requireAuth, csrfProtection, rateLimit, async (req: Request, res: Response) => {
    try {
      console.log('[WordPress Sync] Manual sync triggered');
      
      // Import and call sync function
      const { syncWordPressPosts } = await import('../wordpress-sync');
      const result = await syncWordPressPosts();
      
      res.json({
        success: true,
        message: 'WordPress sync completed',
        data: result
      });
    } catch (error) {
      console.error('[WordPress Sync] Error during manual sync:', error);
      res.status(500).json({
        success: false,
        message: 'WordPress sync failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get sync status
  app.get('/api/wordpress/sync/status', async (req: Request, res: Response) => {
    try {
      // Import and call status function
      const { getSyncStatus } = await import('../wordpress-sync');
      const status = await getSyncStatus();
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('[WordPress Sync] Error getting sync status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sync status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get WordPress posts
  app.get('/api/wordpress/posts', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      
      console.log(`[WordPress API] Fetching posts - page ${page}, limit ${limit}`);
      
      // Fetch posts from WordPress API
      const response = await fetch(`https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts?page=${page}&per_page=${limit}`);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }
      
      const posts = await response.json();
      
      res.json({
        success: true,
        data: posts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: posts.length
        }
      });
    } catch (error) {
      console.error('[WordPress API] Error fetching posts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch WordPress posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync specific post by ID
  app.post('/api/wordpress/sync/:postId', requireAuth, csrfProtection, async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      
      if (!postId || isNaN(parseInt(postId))) {
        return res.status(400).json({ error: 'Invalid post ID' });
      }

      console.log(`[WordPress Sync] Syncing specific post: ${postId}`);
      
      const result = await syncSingleWordPressPost(parseInt(postId));
      
      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Failed to sync post - post may not exist'
        });
      }

      res.json({
        success: true,
        message: `Post ${postId} synced successfully`,
        data: result
      });
    } catch (error) {
      console.error(`[WordPress Sync] Error syncing post ${req.params.postId}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('WordPress sync routes registered successfully');
}

export default router;