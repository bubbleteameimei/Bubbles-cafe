/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Express, Request, Response, NextFunction } from 'express';
import { syncWordPressPosts, syncSingleWordPressPost, SyncResult, getSyncStatus } from '../wordpress-sync';
import { wordpressSync } from '../wordpress-api-sync';
import { log } from '../vite';
import { z } from 'zod';

// Track sync status
let syncInProgress = false;
let lastSyncStatus: any = null;
let lastSyncTime: string | null = null;

// Minimal real auth/authorization: require session user and admin flag
const requireAdmin: import('express').RequestHandler = (req, res, next) => {
  const user = (req as any).user || req.session?.user;
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  if (!user.isAdmin) {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }
  next();
};

// Lightweight rate limiter per-process (basic safeguard)
const lastCallByRoute: Record<string, number> = {};
  function simpleRateLimit(windowMs = 3000) {
  return ((req, res, next) => {
    const key = `${req.method}:${req.path}`;
    const now = Date.now();
    const last = lastCallByRoute[key] || 0;
    if (now - last < windowMs) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    lastCallByRoute[key] = now;
    next();
  }) as import('express').RequestHandler;
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
   * Trigger a WordPress sync manually (admin only)
   */
  app.post('/api/wordpress/sync', simpleRateLimit(), requireAdmin, async (req: Request, res: Response) => {
    logEvent('Manual WordPress sync triggered via API', { user: (req as any).user });

    if (syncInProgress) {
      return res.status(409).json({
        success: false,
        message: 'WordPress sync already in progress',
        lastSyncTime
      });
    }

    // Immediately acknowledge and start sync in background
    res.json({ success: true, message: 'WordPress sync started' });
    (async () => {
      syncInProgress = true;
      try {
        const result = await wordpressSync.syncAllPosts();
        lastSyncStatus = result;
        lastSyncTime = new Date().toISOString();
        logEvent(`WordPress sync completed: ${result.synced} synced posts, ${result.errors.length} errors`, { synced: result.synced, errors: result.errors.length });
      } catch (error) {
        logEvent('Error in WordPress sync', { error });
        lastSyncStatus = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        } as any;
        lastSyncTime = new Date().toISOString();
      } finally {
        syncInProgress = false;
      }
    })();
    return;
  });

  /**
   * POST /api/wordpress/sync/:postId
   * Trigger a WordPress sync for a single post (admin only)
   */
  app.post('/api/wordpress/sync/:postId', simpleRateLimit(), requireAdmin, async (req: Request, res: Response) => {
    // Validate input
    const parseResult = syncPostSchema.safeParse({ postId: req.params.postId });
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }
    logEvent('Manual sync triggered for WordPress post ID', { user: (req as any).user, postId: req.params.postId });
    
    const postId = parseInt(req.params.postId, 10);
    
    try {
      // Acknowledge immediately
      res.json({ success: true, message: `Sync for post ${postId} started` });
      (async () => {
        const result = await wordpressSync.syncOnePostById(postId);
        lastSyncStatus = result;
        lastSyncTime = new Date().toISOString();
      })();
      return;
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