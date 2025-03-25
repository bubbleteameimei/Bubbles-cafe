/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import { Express, Request, Response } from 'express';
import { syncWordPressPosts, syncSingleWordPressPost, SyncResult, getSyncStatus } from '../wordpress-sync';
import { log } from '../vite.js';

// Track sync status
let syncInProgress = false;
let lastSyncStatus: any = null;
let lastSyncTime: string | null = null;

export function registerWordPressSyncRoutes(app: Express): void {
  /**
   * GET /api/wordpress/sync/status
   * Get the status of WordPress sync
   */
  app.get('/api/wordpress/sync/status', (_req: Request, res: Response) => {
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
  app.post('/api/wordpress/sync', async (_req: Request, res: Response) => {
    if (syncInProgress) {
      return res.status(409).json({
        success: false,
        message: 'WordPress sync already in progress',
        lastSyncTime
      });
    }

    syncInProgress = true;
    
    try {
      log('Manual WordPress sync triggered via API', 'wordpress-sync');
      
      // Run the sync in the background so we can return immediately
      res.status(202).json({
        success: true,
        message: 'WordPress sync initiated',
        syncStartTime: new Date().toISOString()
      });
      
      // Now run the actual sync (the response has already been sent)
      const result = await syncWordPressPosts();
      
      lastSyncStatus = result;
      lastSyncTime = new Date().toISOString();
      
      log(`WordPress sync completed: ${result.created} created, ${result.updated} updated`, 'wordpress-sync');
    } catch (error) {
      log(`Error in WordPress sync: ${error instanceof Error ? error.message : String(error)}`, 'wordpress-sync');
      
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
  app.post('/api/wordpress/sync/:postId', async (req: Request, res: Response) => {
    const postId = req.params.postId;
    
    if (!postId || isNaN(parseInt(postId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    try {
      log(`Manual sync triggered for WordPress post ID: ${postId}`, 'wordpress-sync');
      
      const result = await syncSingleWordPressPost(parseInt(postId));
      
      res.json({
        success: true,
        message: `WordPress post ${result.action}`,
        post: result
      });
    } catch (error) {
      log(`Error syncing WordPress post ${postId}: ${error instanceof Error ? error.message : String(error)}`, 'wordpress-sync');
      
      res.status(500).json({
        success: false,
        message: `Error syncing WordPress post: ${error instanceof Error ? error.message : String(error)}`
      });
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
      const limit = parseInt(req.query.limit as string) || 100;
      const searchQuery = req.query.search as string || '';
      
      const wpApiUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
      let apiUrl = `${wpApiUrl}/posts?per_page=${limit}&_fields=id,date,title,excerpt,slug,categories,status`;
      
      // If search query is provided, add it to the API URL
      if (searchQuery) {
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(apiUrl);
      
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