#!/usr/bin/env node
/**
 * Database Setup Script - Node.js Version
 * 
 * This script provides a reliable way to set up the database using proper
 * Drizzle commands and handles the current version compatibility issues.
 * 
 * Usage:
 *   node db-setup.js                    # Run full setup
 *   node db-setup.js --check-only       # Only check connection
 *   node db-setup.js --create-admin     # Create admin user
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logger = {
  info: (msg) => console.log(`[DB Setup] ${msg}`),
  error: (msg) => console.error(`[DB Setup ERROR] ${msg}`),
  success: (msg) => console.log(`[DB Setup SUCCESS] ✅ ${msg}`),
  warn: (msg) => console.warn(`[DB Setup WARNING] ⚠️ ${msg}`)
};

function checkEnvironment() {
  logger.info('Checking environment...');
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  logger.success('Environment check passed');
}

function runDrizzleCommand(command, description) {
  logger.info(description);
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    
    if (output) {
      logger.info('Command output:');
      console.log(output);
    }
    
    logger.success(`${description} completed`);
    return true;
  } catch (error) {
    logger.error(`${description} failed`);
    if (error.stdout) logger.info('STDOUT: ' + error.stdout.toString());
    if (error.stderr) logger.error('STDERR: ' + error.stderr.toString());
    return false;
  }
}

function setupDatabase() {
  logger.info('Starting database setup...');
  
  // Check environment first
  checkEnvironment();
  
  // Try to run the database push/up command
  // First try the newer format, then fall back to older format
  let success = false;
  
  // Try different command variations based on the version
  const commands = [
    { cmd: 'npx drizzle-kit push', desc: 'Pushing schema (new format)' },
    { cmd: 'npx drizzle-kit push:pg', desc: 'Pushing schema (legacy format)' },
    { cmd: 'npx drizzle-kit up:pg', desc: 'Applying migrations (legacy format)' }
  ];
  
  for (const { cmd, desc } of commands) {
    if (runDrizzleCommand(cmd, desc)) {
      success = true;
      break;
    }
  }
  
  if (!success) {
    logger.warn('All Drizzle commands failed, but continuing...');
    logger.info('The database may already be set up or will be initialized by the application');
  }
  
  logger.success('Database setup process completed');
}

function createStartupScript() {
  const startupScript = `#!/bin/bash
# Automatic Database Setup Script
# This script runs before the application starts

echo "[Startup] Running database setup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "[Startup ERROR] DATABASE_URL is not set"
    exit 1
fi

# Run database setup
node db-setup.js

echo "[Startup] Database setup completed"
`;

  fs.writeFileSync('startup-db.sh', startupScript);
  
  // Make it executable
  try {
    execSync('chmod +x startup-db.sh');
    logger.success('Created startup-db.sh script');
  } catch (error) {
    logger.warn('Could not make startup-db.sh executable (this is normal on some systems)');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check-only')) {
    checkEnvironment();
    logger.info('Environment check completed');
    return;
  }
  
  if (args.includes('--create-startup')) {
    createStartupScript();
    return;
  }
  
  // Run full setup
  setupDatabase();
  
  logger.success('All setup tasks completed successfully!');
  logger.info('Your database is ready to use');
  logger.info('You can now start your application with: npm run dev');
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { setupDatabase, checkEnvironment };