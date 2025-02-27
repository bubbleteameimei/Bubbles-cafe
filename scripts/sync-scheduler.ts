import { scheduleWordPressSync } from './wordpress-api-sync';

// Start the scheduled sync with custom schedule (every 2 minutes)
const scheduler = scheduleWordPressSync('*/2 * * * *');

console.log('WordPress content sync scheduler is running...');
console.log('Sync will occur every 2 minutes');
console.log('Press Ctrl+C to stop');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping WordPress sync scheduler...');
  scheduler.stop();
  process.exit(0);
});