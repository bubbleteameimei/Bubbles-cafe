import { execSync } from 'child_process';

console.log('Starting WordPress sync process...');

try {
  // Run the sync process using ts-node with esm support
  execSync('npx tsx scripts/wordpress-api-sync.ts', { stdio: 'inherit' });
  console.log('WordPress sync completed successfully');
} catch (error) {
  console.error('Error running WordPress sync:', error);
  process.exit(1);
}