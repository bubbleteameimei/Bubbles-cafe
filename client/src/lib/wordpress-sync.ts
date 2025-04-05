/**
 * WordPress Sync Service
 * 
 * This module provides automatic synchronization of WordPress content
 * on a configurable schedule, ensuring the most recent content is available
 * both in the application and in local storage for offline use.
 */

import { fetchWordPressPosts } from './wordpress-api';

// Configuration options
const SYNC_INTERVAL_MINUTES = 5; // Sync interval in minutes
const SYNC_KEY = 'wp_last_sync'; // Local storage key for tracking last sync
const LOCAL_POSTS_KEY = 'wp_local_posts'; // Local storage key for posts cache

// Convert interval to milliseconds
const SYNC_INTERVAL_MS = SYNC_INTERVAL_MINUTES * 60 * 1000;

/**
 * Initialize the WordPress sync service
 */
export function initWordPressSync() {
  console.log(`[WordPress Sync] Initializing auto-sync service (every ${SYNC_INTERVAL_MINUTES} minutes)`);
  
  // Perform an initial sync
  syncWordPressPosts();
  
  // Set up regular interval for syncing
  const intervalId = setInterval(() => {
    syncWordPressPosts();
  }, SYNC_INTERVAL_MS);
  
  // Return the interval ID to allow cancellation if needed
  return intervalId;
}

/**
 * Fetch and store WordPress posts
 */
export async function syncWordPressPosts() {
  const now = new Date();
  console.log(`[WordPress Sync] Starting sync at ${now.toISOString()}`);
  
  // Update sync status to indicate we're starting a sync
  localStorage.setItem('wp_sync_status', JSON.stringify({
    status: 'default',
    type: 'sync_starting',
    message: 'Syncing content from WordPress...',
    timestamp: now.getTime()
  }));
  
  try {
    // Check if we should skip this sync (if a recent one was successful)
    const lastSync = localStorage.getItem(SYNC_KEY);
    if (lastSync) {
      const lastSyncTime = new Date(JSON.parse(lastSync).timestamp);
      const timeSinceLastSync = now.getTime() - lastSyncTime.getTime();
      
      // If last sync was very recent (less than half the interval), skip
      if (timeSinceLastSync < (SYNC_INTERVAL_MS / 2)) {
        console.log(`[WordPress Sync] Skipping sync - last sync was ${Math.floor(timeSinceLastSync / 1000)}s ago`);
        
        // Clear the "syncing" status since we're skipping
        localStorage.setItem('wp_sync_status', JSON.stringify({
          status: 'success',
          type: 'sync_skipped',
          message: `Using recently synced content (${Math.floor(timeSinceLastSync / 1000)}s ago)`,
          timestamp: now.getTime()
        }));
        
        return;
      }
    }
    
    // Fetch posts from WordPress
    const result = await fetchWordPressPosts({ 
      perPage: 20, // Fetch more posts to ensure comprehensive coverage
      skipCache: true // Always get fresh data during sync
    });
    
    if (result && result.posts && result.posts.length > 0) {
      // Store posts in local storage for offline access
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify({
        posts: result.posts,
        timestamp: now.getTime()
      }));
      
      // Update the last sync timestamp
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        timestamp: now.getTime(),
        count: result.posts.length,
        success: true
      }));
      
      // Update sync status for successful sync
      localStorage.setItem('wp_sync_status', JSON.stringify({
        status: 'success',
        type: 'sync_success',
        message: `Successfully synced ${result.posts.length} posts`,
        timestamp: now.getTime()
      }));
      
      console.log(`[WordPress Sync] Successfully synced ${result.posts.length} posts`);
    } else {
      console.warn('[WordPress Sync] No posts retrieved during sync');
      
      // Record failed sync attempt
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        timestamp: now.getTime(),
        success: false,
        reason: 'No posts found'
      }));
      
      // Update sync status for empty result
      localStorage.setItem('wp_sync_status', JSON.stringify({
        status: 'warning',
        type: 'sync_empty',
        message: 'No posts found during sync. Using cached content.',
        timestamp: now.getTime()
      }));
    }
  } catch (error) {
    console.error('[WordPress Sync] Sync failed:', error);
    
    // Record failed sync attempt
    localStorage.setItem(SYNC_KEY, JSON.stringify({
      timestamp: now.getTime(),
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    }));
    
    // Update sync status for failed sync
    localStorage.setItem('wp_sync_status', JSON.stringify({
      status: 'error',
      type: 'sync_error',
      message: 'Content sync failed. Using cached content.',
      timestamp: now.getTime(),
      errorDetails: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}

/**
 * Get locally stored WordPress posts
 */
export function getLocalWordPressPosts() {
  try {
    const data = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    return parsedData.posts;
  } catch (error) {
    console.error('[WordPress Sync] Error retrieving local posts:', error);
    return null;
  }
}

/**
 * Check if local posts are available (without age restriction)
 */
export function hasRecentLocalPosts(maxAgeHours = Infinity) {
  try {
    const data = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!data) return false;
    
    const parsedData = JSON.parse(data);
    // Validate array data exists but don't check age - posts persist forever
    return Array.isArray(parsedData.posts) && parsedData.posts.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get sync status information
 */
export function getSyncStatus() {
  try {
    const data = localStorage.getItem(SYNC_KEY);
    if (!data) return null;
    
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

/**
 * Force an immediate sync
 * @returns A promise that resolves when the sync is complete
 */
export function forceSyncNow() {
  console.log('[WordPress Sync] Forcing immediate sync');
  
  // Update status to show a manual sync is being initiated
  const now = new Date().getTime();
  localStorage.setItem('wp_sync_status', JSON.stringify({
    status: 'default',
    type: 'manual_sync_starting',
    message: 'Manual sync initiated...',
    timestamp: now
  }));
  
  return syncWordPressPosts();
}