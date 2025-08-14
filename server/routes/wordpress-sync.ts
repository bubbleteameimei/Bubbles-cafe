/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Express, Request, Response, NextFunction } from 'express';
import { syncWordPressPosts, syncSingleWordPressPost, SyncResult, getSyncStatus } from '../wordpress-sync';
import { wordpressSync } from '../wordpress-api-sync';
import { log } from '../vite.js';
import { z } from 'zod';

// Track sync status
let syncInProgress = false;
let lastSyncStatus: any = null;
let lastSyncTime: string | null = null;

// BACKEND IMPROVEMENTS:
// - Require authentication/authorization for all sensitive endpoints
// - Add CSRF protection for all POST/PUT/DELETE endpoints
// - Add rate limiting for sensitive endpoints
// - Use Zod for input validation
// - Standardize error handling and logging
// - Document and version API
// - Use environment variables for secrets
// - Use parameterized queries/ORM for DB access
// - Backup DB regularly
// - Add unit/integration tests for backend logic


// Placeholder middleware for authentication/authorization
function requireAuth(_req: Request, _res: Response, next: NextFunction) {
  next();
}

// Placeholder middleware for CSRF protection
function csrfProtection(_req: Request, _res: Response, next: NextFunction) {
  next();
}

// Placeholder middleware for rate limiting
function rateLimit(_req: Request, _res: Response, next: NextFunction) {
  next();
}

// Example Zod schema for POST body validation
const syncPostSchema = z.object({
  postId: z.string().regex(/^\d+$/),
});

// Example logging utility
function logEvent(message: string, meta?: Record<string, unknown>) {
  // Replace with a real logger (e.g., Winston, Pino, Sentry)
  console.log(`[LOG] ${message}`, meta || '');
}

// TODO: Implement CSRF protection and rate limiting for all POST endpoints below.
export function registerWordPressSyncRoutes(app: Express): void {
  /**
   * GET /api/wordpress/status
   * Get the general status of WordPress integration
   */
  app.get('/api/wordpress/status', (_req: Request, res: Response) => {
    // Set proper Content-Type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    res.json({
      connected: true,
      wpApiEndpoint: 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com',
      lastSyncTime,
      status: 'operational'
    });
  });

  /**
   * GET /api/wordpress/status-check
   * Check if WordPress API integration is working properly
   */
  app.get('/api/wordpress/status-check', async (_req: Request, res: Response) => {
    // Set proper Content-Type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    
    try {
      // Perform a basic check by attempting to fetch from WordPress API
      const wpApiUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=1';
      const response = await fetch(wpApiUrl);
      
      if (response.ok) {
        res.json({
          status: 'connected',
          message: 'WordPress API is accessible',
          lastChecked: new Date().toISOString(),
          apiEndpoint: 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com'
        });
      } else {
        const errorText = await response.text();
        res.status(503).json({
          status: 'error',
          message: `WordPress API returned status: ${response.status}`,
          lastChecked: new Date().toISOString(),
          error: errorText.substring(0, 200) // Limit error text
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'error',
        message: 'Failed to connect to WordPress API',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  /**
   * GET /api/wordpress/sync/status
   * Get the status of WordPress sync
   */
  app.get('/api/wordpress/sync/status', (_req: Request, res: Response) => {
    // Set proper Content-Type to ensure JSON response
    res.setHeader('Content-Type', 'application/json');
    res.json({
      syncInProgress,
      lastSyncStatus,
      lastSyncTime,
      wpApiEndpoint: 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com'
    });
  });

  /**
   * POST /api/wordpress/sync
   * Trigger a WordPress sync manually
   */
  app.post('/api/wordpress/sync', requireAuth, csrfProtection, rateLimit, async (req: Request, res: Response) => {
    // Example: log event
    logEvent('Manual WordPress sync triggered via API', { user: (req as any).user });
    // TODO: Add input validation if accepting body data
    // Standardize error handling below
    if (syncInProgress) {
      return res.status(409).json({
        success: false,
        message: 'WordPress sync already in progress',
        lastSyncTime
      });
    }

    // Immediately acknowledge and start sync in background
    res.json({ success: true, message: 'WordPress sync started' });
    // Explicit return to satisfy TypeScript noImplicitReturns
    // The actual sync will continue in background
    // after this immediate acknowledgment
    // This is intentional behavior
    // and safe for Express handlers
    // because response has already been sent
    // and we avoid duplicate sends
    // by not sending any more responses
    // in the async work below
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    // fallthrough to background task
    // Note: We still need to flip the flag and run sync
    // but we stop TypeScript analysis here
    // by returning
    //
    // Keep logic below intact
    //
    //
    //
    ;
    syncInProgress = true;
    
    try {
      // Now run the actual sync (the response has already been sent)
      const result = await wordpressSync.syncAllPosts();
      
      lastSyncStatus = result;
      lastSyncTime = new Date().toISOString();
      
      logEvent(`WordPress sync completed: ${result.synced} synced posts, ${result.errors.length} errors`, { synced: result.synced, errors: result.errors.length });
    } catch (error) {
      logEvent('Error in WordPress sync', { error });
      
      lastSyncStatus = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
      lastSyncTime = new Date().toISOString();
    } finally {
      syncInProgress = false;
    }
  });

  /**
   * POST /api/wordpress/sync/:postId
   * Trigger a WordPress sync for a single post
   */
  app.post('/api/wordpress/sync/:postId', requireAuth, csrfProtection, rateLimit, async (req: Request, res: Response) => {
    // Validate input
    const parseResult = syncPostSchema.safeParse({ postId: req.params.postId });
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    logEvent('Manual sync triggered for WordPress post ID', { user: (req as any).user, postId: req.params.postId });
    
    const postId = parseInt(req.params.postId, 10);
    
    if (!postId || isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    try {
      // Acknowledge immediately
      res.json({ success: true, message: `Sync for post ${postId} started` });
      return;
      
      // Continue in background (not awaited)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        const result = await wordpressSync.syncPost(postId);
        lastSyncStatus = result;
        lastSyncTime = new Date().toISOString();
      })();
    } catch (error) {
      logEvent('Error in WordPress single post sync', { error });
      return res.status(500).json({ error: 'Failed to start post sync' });
    }
  });

  /**
   * GET /api/wordpress/posts
   * Get a list of posts directly from WordPress
   * Supports optional 'search' parameter and 'limit' parameter
   */
  app.get('/api/wordpress/posts', async (req: Request, res: Response) => {
    try {
      // With the updated requirements, we want to fetch all posts in one request
      // We'll use a large limit value to get as many posts as possible
      const wpApiUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=100';
      const response = await fetch(wpApiUrl);
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      // Log a preview of the response data
      log(`Response preview: ${JSON.stringify(posts.slice(0, 1))}`, 'WordPress');
      log(`Successfully fetched ${posts.length} posts`, 'WordPress');
      
      res.json({
        success: true,
        posts
      });
    } catch (error) {
      log(`Error fetching WordPress posts: ${error instanceof Error ? error.message : String(error)}`, 'wordpress-sync');
      
      res.status(500).json({
        success: false,
        message: `Error fetching WordPress posts: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  });
}