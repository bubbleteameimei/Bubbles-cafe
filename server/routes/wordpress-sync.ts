/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Express, Request, Response } from 'express';
import { wordpressSync } from '../wordpress-api-sync';
import { log } from '../vite';
import { z } from 'zod';

// Track sync status
let syncInProgress = false;
let lastSyncStatus: any = null;
let lastSyncTime: string | null = null;

// Flexible sync authorization: allow either admin user OR a valid sync key header
const requireSyncAuth: import('express').RequestHandler = (req, res, next) => {
  const user = (req as any).user || req.session?.user;
  const headerKey = req.get('X-WordPress-Sync-Key');
  const envKey = process.env.WORDPRESS_SYNC_KEY;

  // If a valid sync key is provided, allow without admin
  if (envKey && headerKey && headerKey === envKey) {
    return next();
  }

  // Otherwise require admin
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
  app.post('/api/wordpress/sync', simpleRateLimit(), requireSyncAuth, async (req: Request, res: Response) => {
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
  app.post('/api/wordpress/sync/:postId', simpleRateLimit(), requireSyncAuth, async (req: Request, res: Response) => {
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
   * Proxy WordPress posts with optional query params to avoid browser CORS
   * Supported query params: page, per_page, slug, search, _fields
   */
  app.get('/api/wordpress/posts', async (req: Request, res: Response) => {
    try {
      const pageParam = req.query.page ? Number(req.query.page) : 1;
      const perPageParam = req.query.per_page ? Number(req.query.per_page) : 100;
      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
      // WordPress caps per_page to 100
      const per_page = Number.isFinite(perPageParam) ? Math.max(1, Math.min(100, perPageParam)) : 100;
      const slug = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
      const fields = typeof req.query._fields === 'string' ? req.query._fields.trim() : '';

      // Build query
      const params = new URLSearchParams();
      if (slug) {
        params.set('slug', slug);
      } else {
        params.set('page', String(page));
        params.set('per_page', String(per_page));
      }
      if (search) params.set('search', search);
      if (fields) params.set('_fields', fields);

      const wpBase = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts';
      const wpApiUrl = `${wpBase}?${params.toString()}`;

      const response = await fetch(wpApiUrl);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`WordPress API error: ${response.status} ${response.statusText} ${text.slice(0, 200)}`);
      }

      const posts = await response.json();

      // Derive totals from headers when available
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      const totalHeader = response.headers.get('X-WP-Total');
      const totalPages = totalPagesHeader ? parseInt(totalPagesHeader, 10) : 1;
      const total = totalHeader ? parseInt(totalHeader, 10) : (Array.isArray(posts) ? posts.length : 0);

      // Log a preview of the response data
      try {
        const preview = Array.isArray(posts) ? posts.slice(0, 1) : posts;
        log(`Response preview: ${JSON.stringify(preview)}`, 'WordPress');
        log(`Successfully fetched ${Array.isArray(posts) ? posts.length : 0} posts`, 'WordPress');
      } catch {}

      res.json({
        success: true,
        posts,
        totalPages,
        total
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