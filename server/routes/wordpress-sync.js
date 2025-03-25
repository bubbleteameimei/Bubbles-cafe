/**
 * WordPress Sync API Routes
 * These routes handle WordPress content importing and synchronization
 */
import express from 'express';
import { syncWordPressPosts, syncSingleWordPressPost } from '../wordpress-sync.js';
import { log } from '../vite.js';

// Track sync status
let syncInProgress = false;
let lastSyncStatus = null;
let lastSyncTime = null;

export function registerWordPressSyncRoutes(app) {
  /**
   * GET /api/wordpress/sync/status
   * Get the status of WordPress sync
   */
  app.get('/api/wordpress/sync/status', (req, res) => {
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
  app.post('/api/wordpress/sync', async (req, res) => {
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
      
      lastSyncStatus = {
        success: true,
        ...result
      };
      lastSyncTime = new Date().toISOString();
      
      log(`WordPress sync completed: ${result.created} created, ${result.updated} updated`, 'wordpress-sync');
    } catch (error) {
      log(`Error in WordPress sync: ${error.message}`, 'wordpress-sync');
      
      lastSyncStatus = {
        success: false,
        error: error.message
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
  app.post('/api/wordpress/sync/:postId', async (req, res) => {
    const postId = req.params.postId;
    
    if (!postId || isNaN(parseInt(postId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }
    
    try {
      log(`Manual sync triggered for WordPress post ID: ${postId}`, 'wordpress-sync');
      
      const result = await syncSingleWordPressPost(postId);
      
      res.json({
        success: true,
        message: `WordPress post ${result.action}`,
        post: result
      });
    } catch (error) {
      log(`Error syncing WordPress post ${postId}: ${error.message}`, 'wordpress-sync');
      
      res.status(500).json({
        success: false,
        message: `Error syncing WordPress post: ${error.message}`
      });
    }
  });

  /**
   * GET /api/wordpress/posts
   * Get a list of posts directly from WordPress
   */
  app.get('/api/wordpress/posts', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.per_page) || 10;
      
      const wpApiUrl = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
      const response = await fetch(
        `${wpApiUrl}/posts?page=${page}&per_page=${perPage}&_fields=id,date,title,excerpt,slug,categories`
      );
      
      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }
      
      const posts = await response.json();
      
      res.json({
        success: true,
        page,
        perPage,
        posts
      });
    } catch (error) {
      log(`Error fetching WordPress posts: ${error.message}`, 'wordpress-sync');
      
      res.status(500).json({
        success: false,
        message: `Error fetching WordPress posts: ${error.message}`
      });
    }
  });
}