#!/usr/bin/env tsx
/**
 * Permanent Startup Script
 * 
 * This script ensures the database is properly set up every time the application starts
 * or is remixed. It will be called automatically during application startup.
 * 
 * Features:
 * - Automatic database connection verification
 * - Table existence checking
 * - Admin user creation if needed
 * - Environment setup verification
 * - Graceful error handling that doesn't prevent app startup
 */

import { directDatabaseSetup } from './direct-db-setup';

const logger = {
  info: (msg: string) => console.log(`[Startup] ${msg}`),
  error: (msg: string) => console.error(`[Startup ERROR] ${msg}`),
  success: (msg: string) => console.log(`[Startup SUCCESS] ✅ ${msg}`),
  warn: (msg: string) => console.warn(`[Startup WARNING] ⚠️ ${msg}`)
};

async function permanentStartup() {
  logger.info('Running permanent startup setup...');
  
  try {
    // Check if we're in a Replit environment
    const isReplit = process.env.REPLIT_DB_URL || process.env.REPL_ID || process.env.REPLIT_EDITING;
    
    if (isReplit) {
      logger.info('Detected Replit environment - running full setup');
    } else {
      logger.info('Running in standard environment');
    }
    
    // Always run database setup
    await directDatabaseSetup();
    
    logger.success('Permanent startup setup completed successfully');
    
    // Log environment status
    logger.info('Environment status:');
    logger.info(`- Node.js version: ${process.version}`);
    logger.info(`- Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`- Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    logger.info(`- Port: ${process.env.PORT || '3003'}`);
    
  } catch (error) {
    logger.error('Startup setup failed, but continuing...');
    logger.error(error instanceof Error ? error.message : String(error));
    // Don't throw - let the app start anyway
  }
}

export { permanentStartup };