
import { syncWordPressPosts, scheduleWordPressSync } from '../scripts/wordpress-api-sync';

// Initialize WordPress sync
export async function initializeWordPressSync() {
  try {
    console.log('[WordPress Sync] Initializing...');
    
    // Run initial sync
    const initialSyncResult = await syncWordPressPosts();
    console.log('[WordPress Sync] Initial sync completed:', initialSyncResult);
    
    // Schedule regular syncs (every 30 minutes)
    const scheduler = scheduleWordPressSync('*/30 * * * *');
    console.log('[WordPress Sync] Scheduled automatic sync every 30 minutes');
    
    return {
      initialSyncResult,
      scheduler
    };
  } catch (error) {
    console.error('[WordPress Sync] Initialization failed:', error);
    throw error;
  }
}
