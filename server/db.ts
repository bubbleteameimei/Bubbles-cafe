/**
 * Database Connection Module
 * 
 * This module provides access to the PostgreSQL database using Drizzle ORM.
 * Enhanced with proper error handling for improved reliability.
 */
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Global connection state 
let isConnected = false;
let connectionAttempted = false;
let connectionError: Error | null = null;

/**
 * Creates a database connection
 */
function createDbConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('[Database] No DATABASE_URL found in environment variables');
    connectionError = new Error('DATABASE_URL environment variable is required');
    connectionAttempted = true;
    throw connectionError;
  }
  
  console.log('[Database] Initializing database connection...');
  
  try {
    // Connect using the pg Pool
    const pool = new Pool({
      connectionString: dbUrl,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    });
    
    // Add error handler to the pool
    pool.on('error', (err) => {
      console.error('[Database] Unexpected error on idle client', err);
      isConnected = false;
      connectionError = err;
    });
    
    // Test the connection immediately
    pool.connect()
      .then(client => {
        client.query('SELECT 1')
          .then(() => {
            console.log('[Database] Successfully connected to PostgreSQL');
            isConnected = true;
            connectionError = null;
            client.release();
          })
          .catch(err => {
            console.error('[Database] Error testing connection:', err);
            isConnected = false;
            connectionError = err;
            client.release();
          });
      })
      .catch(err => {
        console.error('[Database] Error establishing connection:', err);
        isConnected = false;
        connectionError = err;
      });
    
    connectionAttempted = true;
    return pool;
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    connectionError = new Error('Cannot establish database connection');
    connectionAttempted = true;
    throw connectionError;
  }
}

// Create the database pool
export const pool = createDbConnection();

// Create a SQL query executor function for compatibility with enhanced error handling
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  if (!isConnected && connectionAttempted && connectionError) {
    console.warn('[Database] Executing SQL query while database is disconnected');
  }
  
  const text = strings.join('?').replace(/\?/g, () => '$' + (values.length + 1));
  let client;
  
  try {
    client = await pool.connect();
    const result = await client.query(text, values);
    
    // Update connection status on successful query
    if (!isConnected) {
      console.log('[Database] Connection re-established');
      isConnected = true;
      connectionError = null;
    }
    
    return result.rows;
  } catch (error) {
    console.error('[Database] Error executing SQL query:', error);
    isConnected = false;
    connectionError = error as Error;
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Initialize Drizzle ORM with our schema
export const db = drizzle(pool, { schema });

// Export a helper function to validate the database connection
export async function validateConnection() {
  try {
    // Simple database query to test the connection
    const result = await sql`SELECT 1 as test`;
    console.log('[Database] Connection validation successful');
    isConnected = true;
    connectionError = null;
    return result && result.length > 0 && result[0].test === 1;
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
    error: connectionError ? connectionError.message : null
  };
}

export default db;