
// Simple script to run WordPress sync
const { execSync } = require('child_process');

console.log('Starting WordPress sync process...');

try {
  // Run the sync process using ts-node
  execSync('npx ts-node scripts/wordpress-api-sync.ts', { stdio: 'inherit' });
  console.log('WordPress sync completed successfully');
} catch (error) {
  console.error('Error running WordPress sync:', error);
  process.exit(1);
}
