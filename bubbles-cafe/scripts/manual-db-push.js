// Manual DB Push Script
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import url from 'url';

// Get the current directory
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Log the environment variables (redacting sensitive information)
console.log('Environment variables:', {
  DATABASE_URL: process.env.DATABASE_URL ? 'REDACTED' : 'NOT SET',
  PGDATABASE: process.env.PGDATABASE ? 'REDACTED' : 'NOT SET',
  PGUSER: process.env.PGUSER ? 'REDACTED' : 'NOT SET',
  PGHOST: process.env.PGHOST ? 'REDACTED' : 'NOT SET'
});

// Ensure the migrations directory exists
const migrationsDir = path.resolve(__dirname, '../migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log(`Created migrations directory at ${migrationsDir}`);
}

// Step 1: Generate migration SQL
console.log('Generating migration SQL...');
try {
  execSync('npx drizzle-kit generate:pg', { 
    stdio: 'inherit',
    env: process.env 
  });
  console.log('Migration SQL generation completed successfully');
} catch (error) {
  console.error('Error generating migration SQL:', error);
  process.exit(1);
}

// Step 2: Push schema to database
console.log('Pushing schema to database...');
try {
  execSync('npx drizzle-kit push:pg', { 
    stdio: 'inherit',
    env: process.env 
  });
  console.log('Schema push completed successfully');
} catch (error) {
  console.error('Error pushing schema:', error);
  process.exit(1);
}

console.log('Database setup completed successfully');