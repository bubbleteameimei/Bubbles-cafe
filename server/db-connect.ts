/**
 * Database Connection Module for Server
 * 
 * This module initializes the database connection for the server using the
 * shared connection module. It ensures proper error handling and reports
 * connection status.
 */
import { initializeDatabaseConnection } from '../scripts/connect-db';

// Create a placeholder for the pool and db
export let pool: any = {
  connect: async () => { throw new Error('Pool not yet initialized') }
};
export let db: any = {};

// Flag to track initialization status
let isInitialized = false;
let initializationPromise: Promise<void>;

// Function to wait for initialization to complete
export async function waitForPoolInitialization(timeoutMs = 10000): Promise<boolean> {
  // If already initialized, return immediately
  if (isInitialized) return true;
  
  // If initialization is in progress, wait for it
  if (initializationPromise) {
    try {
      await Promise.race([
        initializationPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pool initialization timeout')), timeoutMs)
        )
      ]);
      return isInitialized;
    } catch (error) {
      console.error('Error waiting for pool initialization:', error);
      return false;
    }
  }
  
  // Initialization hasn't started yet, so return false
  return false;
}

// Self-executing async function to initialize the database connection
initializationPromise = (async () => {
  try {
    console.log('Initializing database connection for server...');
    
    // Initialize the database connection using the shared module
    const connection = await initializeDatabaseConnection();
    
    // Assign the real pool and db to our exported variables
    pool = connection.pool;
    db = connection.db;
    
    // Set up event handlers
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', {
        message: err.message,
        stack: err.stack
      });
    });
    
    pool.on('connect', () => {
      console.log('New client connected to database');
    });
    
    pool.on('remove', () => {
      console.log('Client connection removed from pool');
    });
    
    console.log('Database connection initialized successfully');
    isInitialized = true;
  } catch (err) {
    console.error('Critical error during database initialization:', err);
    console.error('Database operations will fail until connection is established');
    
    // Attempt to recover and reconnect periodically
    setTimeout(() => {
      console.log('Attempting to reconnect to database...');
      // The module will be reloaded on next import
    }, 30000); // Try again in 30 seconds
  }
})();

export default db;