/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Router, Request, Response, NextFunction } from 'express';
import { syncSingleWordPressPost } from '../wordpress-sync';
import { isAdmin } from '../middlewares/auth';
import { validateCsrfToken } from '../middleware/csrf-protection';
import rateLimit from 'express-rate-limit';

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  return isAdmin(req, res, next);
}

function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const mw = validateCsrfToken();
  mw(req, res, next);
}

const limiter = rateLimit({ windowMs: 60 * 1000, max: 5 });
function rateLimitMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  // Attach express-rate-limit instance
  return limiter(_req, _res, next);
}

/**
 * Register WordPress sync routes
 */
export function registerWordPressSyncRoutes(app: any) {
  

  // Manual sync trigger
  app.post('/api/wordpress/sync', requireAuth, csrfProtection, rateLimitMiddleware, async (_req: Request, res: Response): Promise<void> => {
    try {
      
      
      // Import and call sync function
      const { syncWordPressPosts } = await import('../wordpress-sync');
      const summary = await syncWordPressPosts();
      res.json({ success: true, summary });
      return;
    } catch (error: any) {
      console.error('[WordPress Sync] Error:', error);
      res.status(500).json({ success: false, message: error?.message || 'WordPress sync failed' });
      return;
    }
  });

  // Get sync status
  app.get('/api/wordpress/sync/status', async (_req: Request, res: Response) => {
    try {
      // Import and call status function
      const { getSyncStatus } = await import('../wordpress-sync');
      const status = await getSyncStatus();
      
      return res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('[WordPress Sync] Error getting sync status:', error);
      return res.status(500).json({
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
      
      
      
      // Fetch posts from WordPress API
      const response = await fetch(`https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts?page=${page}&per_page=${limit}`);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status}`);
      }
      
      const posts = await response.json();
      
      return res.json({
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
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch WordPress posts',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Sync specific post by ID
  app.post('/api/wordpress/sync/:id', requireAuth, csrfProtection, rateLimitMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = Number(req.params.id);
      if (Number.isNaN(postId)) {
        res.status(400).json({ success: false, message: 'Invalid post ID' });
        return;
      }

      
      const { syncSingleWordPressPost } = await import('../wordpress-sync');
      const result = await syncSingleWordPressPost(postId);
      res.json({ success: true, result });
      return;
    } catch (error: any) {
      console.error('[WordPress Sync] Error syncing post:', error);
      res.status(500).json({ success: false, message: error?.message || 'Failed to sync post' });
      return;
    }
  });

  
}

export default router;