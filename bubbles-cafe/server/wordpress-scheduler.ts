import cron from 'node-cron';
import { wordpressSync } from './wordpress-api-sync';

export class WordPressScheduler {
  private syncJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  start(): void {
    if (this.syncJob) {
      console.log('[WordPress Scheduler] Already running');
      return;
    }

    // Run sync every 6 hours
    this.syncJob = cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        console.log('[WordPress Scheduler] Sync already in progress, skipping');
        return;
      }

      this.isRunning = true;
      console.log('[WordPress Scheduler] Starting scheduled sync');

      try {
        const result = await wordpressSync.syncAllPosts();
        console.log(`[WordPress Scheduler] Sync completed: ${result.synced} posts synced, ${result.errors.length} errors`);
      } catch (error) {
        console.error('[WordPress Scheduler] Sync failed:', error);
      } finally {
        this.isRunning = false;
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    console.log('[WordPress Scheduler] Started - will sync every 6 hours');
  }

  stop(): void {
    if (this.syncJob) {
      this.syncJob.destroy();
      this.syncJob = null;
      console.log('[WordPress Scheduler] Stopped');
    }
  }

  async runInitialSync(): Promise<void> {
    if (this.isRunning) {
      console.log('[WordPress Scheduler] Sync already in progress');
      return;
    }

    this.isRunning = true;
    console.log('[WordPress Scheduler] Running initial sync to populate database');

    try {
      const result = await wordpressSync.syncAllPosts();
      console.log(`[WordPress Scheduler] Initial sync completed: ${result.synced} posts synced, ${result.errors.length} errors`);
    } catch (error) {
      console.error('[WordPress Scheduler] Initial sync failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  getStatus(): { running: boolean; nextRun: string | null } {
    return {
      running: this.isRunning,
      nextRun: this.syncJob ? 'Every 6 hours' : null
    };
  }
}

export const wordpressScheduler = new WordPressScheduler();