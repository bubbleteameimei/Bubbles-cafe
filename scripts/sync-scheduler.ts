
import { scheduleWordPressSync } from './wordpress-api-sync';

// Start the scheduled sync with custom schedule (every 12 hours)
const scheduler = scheduleWordPressSync('0 */12 * * *');

console.log('WordPress content sync scheduler is running...');
console.log('Press Ctrl+C to stop');

// Keep the process running
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Stopping WordPress sync scheduler...');
  scheduler.stop();
  process.exit(0);
});
