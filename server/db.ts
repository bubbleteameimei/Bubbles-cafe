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

// Global connection state tracking
let isConnected = false;
let connectionAttempted = false;
let connectionError: Error | null = null;
let lastConnectionAttempt: Date | null = null;
let lastSuccessfulConnection: Date | null = null;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Create the database pool with the environment variables
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Connection timeout
});

// Add error handler to the pool
pool.on('error', (error: Error) => {
  console.error('[Database] Unexpected error on idle client', error);
  isConnected = false;
  connectionError = error;
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

export default db;