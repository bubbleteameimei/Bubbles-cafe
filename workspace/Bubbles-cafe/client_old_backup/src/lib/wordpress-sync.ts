/**
 * Enhanced WordPress Sync Service
 * 
 * This module provides automatic synchronization of WordPress content
 * on a configurable schedule, ensuring the most recent content is available
 * both in the application and in local storage for offline use.
 * 
 * Features:
 * - Configurable sync interval
 * - Offline content caching
 * - Detailed sync statistics
 * - API availability tracking
 * - Advanced error handling
 * - Sync history tracking
 */

import { fetchWordPressPosts, checkWordPressApiStatus } from './wordpress-api';

// Configuration options
const SYNC_INTERVAL_MINUTES = 5; // Sync interval in minutes
const SYNC_KEY = 'wp_last_sync'; // Local storage key for tracking last sync
const LOCAL_POSTS_KEY = 'wp_local_posts'; // Local storage key for posts cache
const SYNC_HISTORY_KEY = 'wp_sync_history'; // Local storage key for sync history
const SYNC_STATUS_KEY = 'wp_sync_status'; // Local storage key for sync status

// Convert interval to milliseconds
const SYNC_INTERVAL_MS = SYNC_INTERVAL_MINUTES * 60 * 1000;

// Track API status for monitoring
let lastCheckedApiStatus = {
  isAvailable: false,
  checkedAt: 0,
  responseTime: 0
};

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
 * Fetch and store WordPress posts with enhanced metrics tracking
 */
export async function syncWordPressPosts() {
  const startTime = performance.now();
  const now = Date.now();
  
  console.log(`[WordPress Sync] Starting sync at ${new Date(now).toISOString()}`);
  
  // Check API availability prior to sync
  let apiAvailable = false;
  try {
    apiAvailable = await checkApiAvailability();
  } catch (e) {
    console.warn('[WordPress Sync] API availability check failed:', e);
  }
  
  // Update sync status to indicate we're starting a sync with initial metrics
  const initialStatus = {
    status: 'default',
    type: 'sync_starting',
    message: 'Syncing content from WordPress...',
    timestamp: now,
    apiAvailable,
    retryCount: 0,
    syncTime: 0,
    postsCount: 0
  };
  
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(initialStatus));
  
  try {
    // Check if we should skip this sync (if a recent one was successful)
    const lastSync = localStorage.getItem(SYNC_KEY);
    if (lastSync) {
      const lastSyncData = JSON.parse(lastSync);
      const lastSyncTime = new Date(lastSyncData.timestamp);
      const timeSinceLastSync = now - lastSyncTime.getTime();
      
      // If last sync was very recent (less than half the interval), skip
      if (timeSinceLastSync < (SYNC_INTERVAL_MS / 2)) {
        console.log(`[WordPress Sync] Skipping sync - last sync was ${Math.floor(timeSinceLastSync / 1000)}s ago`);
        
        // Clear the "syncing" status since we're skipping
        const skippedStatus = {
          status: 'success',
          type: 'sync_skipped',
          message: `Using recently synced content (${Math.floor(timeSinceLastSync / 1000)}s ago)`,
          timestamp: now,
          apiAvailable,
          syncTime: 0,
          postsCount: lastSyncData.count || 0
        };
        
        localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(skippedStatus));
        return;
      }
    }
    
    // Track retries
    let retryCount = 0;
    let result = null;
    
    // Fetch posts from WordPress with retry logic
    try {
      result = await fetchWordPressPosts({ 
        perPage: 20, // Fetch more posts to ensure comprehensive coverage
        skipCache: true // Always get fresh data during sync
      });
    } catch (fetchError) {
      // If initial fetch fails, try one more time
      console.warn('[WordPress Sync] Initial fetch failed, retrying once:', fetchError);
      retryCount++;
      
      try {
        // Wait a moment before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        result = await fetchWordPressPosts({ 
          perPage: 20,
          skipCache: true,
          maxRetries: 1
        });
      } catch (retryError) {
        // Propagate the error if retry also fails
        throw retryError;
      }
    }
    
    // Calculate time taken
    const endTime = performance.now();
    const syncTime = Math.round(endTime - startTime);
    
    if (result && result.posts && result.posts.length > 0) {
      // Store posts in local storage for offline access
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify({
        posts: result.posts,
        timestamp: now
      }));
      
      // Update the last sync timestamp with metadata
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        timestamp: now,
        count: result.posts.length,
        success: true,
        syncTime,
        apiAvailable,
        retryCount
      }));
      
      // Update sync status for successful sync with metrics
      const successStatus = {
        status: 'success',
        type: 'sync_success',
        message: `Successfully synced ${result.posts.length} posts`,
        timestamp: now,
        syncTime,
        apiAvailable,
        retryCount,
        postsCount: result.posts.length
      };
      
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(successStatus));
      updateSyncHistory(successStatus);
      
      console.log(`[WordPress Sync] Successfully synced ${result.posts.length} posts`);
    } else {
      console.warn('[WordPress Sync] No posts retrieved during sync');
      
      // Record failed sync attempt with metrics
      localStorage.setItem(SYNC_KEY, JSON.stringify({
        timestamp: now,
        success: false,
        reason: 'No posts found',
        syncTime,
        apiAvailable,
        retryCount
      }));
      
      // Update sync status for empty result with metrics
      const emptyStatus = {
        status: 'warning',
        type: 'sync_empty',
        message: 'No posts found during sync. Using cached content.',
        timestamp: now,
        syncTime,
        apiAvailable,
        retryCount,
        postsCount: 0
      };
      
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(emptyStatus));
      updateSyncHistory(emptyStatus);
    }
  } catch (error) {
    console.error('[WordPress Sync] Sync failed:', error);
    
    // Calculate time taken even for failures
    const endTime = performance.now();
    const syncTime = Math.round(endTime - startTime);
    
    // Extract meaningful error details
    let errorType = 'unknown';
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.name === 'AbortError' || errorMessage.includes('timeout')) {
        errorType = 'timeout';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorType = 'network';
      } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        errorType = 'parse';
      }
    }
    
    // Record failed sync attempt with detailed metrics
    localStorage.setItem(SYNC_KEY, JSON.stringify({
      timestamp: now,
      success: false,
      reason: errorMessage,
      errorType,
      syncTime,
      apiAvailable
    }));
    
    // Update sync status for failed sync with metrics
    const errorStatus = {
      status: 'error',
      type: 'sync_error',
      message: 'Content sync failed. Using cached content.',
      timestamp: now,
      errorDetails: errorMessage,
      errorType,
      syncTime,
      apiAvailable,
      retryCount: 0
    };
    
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(errorStatus));
    updateSyncHistory(errorStatus);
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
 * Check API availability and update status
 * Returns true if API is available
 */
export async function checkApiAvailability() {
  try {
    const startTime = performance.now();
    const isAvailable = await checkWordPressApiStatus();
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    lastCheckedApiStatus = {
      isAvailable,
      checkedAt: Date.now(),
      responseTime
    };
    
    return isAvailable;
  } catch (error) {
    lastCheckedApiStatus = {
      isAvailable: false,
      checkedAt: Date.now(),
      responseTime: 0
    };
    
    return false;
  }
}

// Define a basic interface for sync status entries
interface SyncStatusEntry {
  status: string;
  type: string;
  message: string;
  timestamp: number;
  [key: string]: any; // Allow additional properties
}

/**
 * Update sync history with a new entry
 * @param entry The sync status entry to add to history
 */
function updateSyncHistory(entry: SyncStatusEntry) {
  try {
    // Get existing history
    const historyData = localStorage.getItem(SYNC_HISTORY_KEY);
    let history = [];
    
    if (historyData) {
      try {
        history = JSON.parse(historyData);
      } catch (e) {
        console.error('[WordPress] Error parsing sync history:', e);
        history = [];
      }
    }
    
    // Add new entry to beginning (most recent first)
    const newHistory = [
      { ...entry, recordedAt: Date.now() },
      ...history
    ];
    
    // Limit to 10 entries
    if (newHistory.length > 10) {
      newHistory.splice(10);
    }
    
    // Save updated history
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('[WordPress] Error updating sync history:', error);
  }
}

/**
 * Force an immediate sync with enhanced metrics tracking
 * @returns A promise that resolves when the sync is complete
 */
export async function forceSyncNow() {
  console.log('[WordPress Sync] Forcing immediate sync');
  
  const startTime = performance.now();
  const now = Date.now();
  
  // Check API availability before sync
  const apiAvailable = await checkApiAvailability();
  
  // Update status to show a manual sync is being initiated with metrics
  const syncStartStatus = {
    status: 'default',
    type: 'manual_sync_starting',
    message: 'Manual sync initiated...',
    timestamp: now,
    apiAvailable,
    retryCount: 0,
    syncTime: 0,
    postsCount: 0
  };
  
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(syncStartStatus));
  
  try {
    // Execute sync
    await syncWordPressPosts();
    
    // Calculate time taken
    const endTime = performance.now();
    const syncTime = Math.round(endTime - startTime);
    
    // Get final status
    let finalStatus = JSON.parse(localStorage.getItem(SYNC_STATUS_KEY) || '{}');
    
    // Add metrics to status
    finalStatus = {
      ...finalStatus,
      syncTime,
      apiAvailable,
      timestamp: Date.now()
    };
    
    // Update with complete metrics
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(finalStatus));
    
    // Add to history if it's a significant event
    if (finalStatus.status !== 'success' || finalStatus.type === 'sync_success') {
      updateSyncHistory(finalStatus);
    }
    
    return finalStatus;
  } catch (error) {
    // Record failure with metrics
    const endTime = performance.now();
    const syncTime = Math.round(endTime - startTime);
    
    const errorStatus = {
      status: 'error',
      type: 'manual_sync_error',
      message: 'Manual sync failed. Using cached content.',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now(),
      syncTime,
      apiAvailable,
      retryCount: 0
    };
    
    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(errorStatus));
    updateSyncHistory(errorStatus);
    
    throw error;
  }
}