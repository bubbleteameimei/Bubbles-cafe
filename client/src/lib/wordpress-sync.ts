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
  
  try {
    // Check if we should skip this sync (if a recent one was successful)
    const lastSync = localStorage.getItem(SYNC_KEY);
    if (lastSync) {
      const lastSyncTime = new Date(JSON.parse(lastSync).timestamp);
      const timeSinceLastSync = now.getTime() - lastSyncTime.getTime();
      
      // If last sync was very recent (less than half the interval), skip
      if (timeSinceLastSync < (SYNC_INTERVAL_MS / 2)) {
        console.log(`[WordPress Sync] Skipping sync - last sync was ${Math.floor(timeSinceLastSync / 1000)}s ago`);
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
      
      console.log(`[WordPress Sync] Successfully synced ${result.posts.length} posts`);
    } else {
      console.warn('[WordPress Sync] No posts retrieved during sync');
      // Record failed sync attempt
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        timestamp: now.getTime(),
        success: false,
        reason: 'No posts found'
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
 * Check if local posts are available and recent
 */
export function hasRecentLocalPosts(maxAgeHours = 24) {
  try {
    const data = localStorage.getItem(LOCAL_POSTS_KEY);
    if (!data) return false;
    
    const parsedData = JSON.parse(data);
    const timestamp = parsedData.timestamp;
    const now = Date.now();
    const ageMs = now - timestamp;
    const ageHours = ageMs / (1000 * 60 * 60);
    
    return ageHours <= maxAgeHours && Array.isArray(parsedData.posts) && parsedData.posts.length > 0;
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
 */
export function forceSyncNow() {
  console.log('[WordPress Sync] Forcing immediate sync');
  return syncWordPressPosts();
}