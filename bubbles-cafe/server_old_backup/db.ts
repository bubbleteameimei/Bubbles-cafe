/**
 * Database Connection Module
 * 
 * This module provides access to the PostgreSQL database using Drizzle ORM.
 * Uses standard node-postgres pool for direct connection to the database.
 */
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import config from './config';  // Import our config module

// Global connection state tracking
let isConnected = false;
let connectionAttempted = false;
let connectionError: Error | null = null;
let lastConnectionAttempt: Date | null = null;
let lastSuccessfulConnection: Date | null = null;

// Config module has already validated that DATABASE_URL exists

// Create the database pool with enhanced connection settings
export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout
  maxUses: 7500, // Close and replace a connection after it has been used 7500 times (prevents memory issues)
  allowExitOnIdle: false, // Better for production
  ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Add error handler to the pool
pool.on('error', (error: Error) => {
  const errorMessage = error.message || 'Unknown error';
  
  // Check if this is a common connection issue that can be handled
  const isConnectionError = 
    errorMessage.includes('endpoint is disabled') ||
    errorMessage.includes('Connection terminated') || 
    errorMessage.includes('terminating connection') ||
    errorMessage.includes('connection reset') ||
    errorMessage.includes('server closed');
    
  if (isConnectionError) {
    console.warn('[Database] Connection issue detected, will attempt reconnect on next operation:', errorMessage);
  } else {
    console.error('[Database] Unexpected error on idle client', error);
  }
  
  isConnected = false;
  connectionError = error;
  
  // Schedule a reconnection attempt
  setTimeout(validateConnection, 5000);
});

// Test the connection immediately
(async () => {
  lastConnectionAttempt = new Date();
  connectionAttempted = true;
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    console.log('[Database] Successfully connected to PostgreSQL');
    isConnected = true;
    connectionError = null;
    lastSuccessfulConnection = new Date();
    client.release();
  } catch (err) {
    console.error('[Database] Error establishing connection:', err);
    isConnected = false;
    connectionError = err as Error;
  }
})();

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Export a helper function to validate the database connection
export async function validateConnection() {
  try {
    // Simple database query to test the connection
    lastConnectionAttempt = new Date();
    
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    client.release();
    
    console.log('[Database] Connection validation successful');
    isConnected = true;
    connectionError = null;
    lastSuccessfulConnection = new Date();
    
    return result && result.rows.length > 0 && result.rows[0].test === 1;
  } catch (error) {
    console.error('[Database] Connection validation failed:', error);
    isConnected = false;
    connectionError = error as Error;
    return false;
  }
}

// Export connection status and error information
export function getDatabaseStatus() {
  return {
    isConnected,
    connectionAttempted,
    lastConnectionAttempt,
    lastSuccessfulConnection,
    error: connectionError ? connectionError.message : null
  };
}

/**
 * Safe database operation wrapper with retry functionality
 * @param operation Function that performs the database operation
 * @param fallback Default value to return if operation fails
 * @param operationName Name of the operation for logging
 * @param maxRetries Maximum number of retries (default: 3)
 * @returns Result of the operation or fallback value
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>, 
  fallback: T, 
  operationName: string,
  maxRetries: number = 3
): Promise<T> {
  let retries = 0;
  const backoffDelay = (attempt: number) => Math.min(100 * Math.pow(2, attempt), 3000);
  
  // Check connection and attempt to reconnect if needed
  if (!isConnected) {
    console.warn(`[Database] Connection lost, attempting reconnect for: ${operationName}`);
    const reconnected = await validateConnection();
    if (!reconnected) {
      console.warn(`[Database] Reconnection failed, using fallback for: ${operationName}`);
      return fallback;
    }
  }
  
  // Try operation with retries
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      
      // Check if error is retryable
      const isRetryable = 
        errorMessage.includes('endpoint is disabled') ||
        errorMessage.includes('Connection terminated') || 
        errorMessage.includes('terminating connection') ||
        errorMessage.includes('connection reset') ||
        errorMessage.includes('server closed');
      
      if (isRetryable && retries < maxRetries) {
        retries++;
        const delay = backoffDelay(retries);
        console.warn(`[Database] Retryable error in ${operationName}, attempt ${retries}/${maxRetries}, retrying in ${delay}ms:`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Validate connection before retry
        await validateConnection();
        continue;
      }
      
      // Not retryable or max retries reached
      console.error(`[Database] Error executing ${operationName} after ${retries} retries:`, error);
      return fallback;
    }
  }
}

export default db;