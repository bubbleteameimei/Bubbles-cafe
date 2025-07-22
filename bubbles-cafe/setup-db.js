// Setup Database Script
import { execSync } from 'child_process';

console.log('Setting up database...');

try {
  console.log('Running database push...');
  // Use the updated push command - the old command was deprecated
  const output = execSync('npx drizzle-kit push', { 
    env: { ...process.env },
    encoding: 'utf-8' 
  });
  console.log(output);
  console.log('Database schema push completed successfully');
} catch (error) {
  console.error('Error setting up database:', error.message);
  console.error(error.stdout?.toString() || '');
  console.error(error.stderr?.toString() || '');
  process.exit(1);
}