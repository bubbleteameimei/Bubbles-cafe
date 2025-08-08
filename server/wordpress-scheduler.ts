import cron, { type ScheduledTask } from 'node-cron';
import { wordpressSync } from './wordpress-api-sync';

export class WordPressScheduler {
  private syncJob: ScheduledTask | null = null;
  private isRunning = false;

  start(): void {
    if (this.syncJob) {
      
      return;
    }

    // Run sync every 6 hours
    this.syncJob = cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        
        return;
      }

      this.isRunning = true;
      

      try {
        const result = await wordpressSync.syncAllPosts();
        
      } catch (error) {
        console.error('[WordPress Scheduler] Sync failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    
  }

  stop(): void {
    if (this.syncJob) {
      this.syncJob.stop();
      this.syncJob = null;
      
    }
  }

  async runInitialSync(): Promise<void> {
    if (this.isRunning) {
      
      return;
    }

    this.isRunning = true;
    

    try {
      const result = await wordpressSync.syncAllPosts();
      
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