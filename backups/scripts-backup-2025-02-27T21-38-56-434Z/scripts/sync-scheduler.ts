import { scheduleWordPressSync } from './wordpress-api-sync';

// Start the scheduled sync with custom schedule (every 30 minutes)
const scheduler = scheduleWordPressSync('*/30 * * * *');

console.log('WordPress content sync scheduler is running...');
console.log('Sync will occur every 30 minutes');
console.log('Press Ctrl+C to stop');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping WordPress sync scheduler...');
  scheduler.stop();
  process.exit(0);
});

// Run initial sync immediately
import { syncWordPressPosts } from './wordpress-api-sync';

console.log('Running initial WordPress sync...');
syncWordPressPosts()
  .then(results => {
    console.log('Initial sync completed:', results);
  })
  .catch(error => {
    console.error('Initial sync failed:', error);
  });