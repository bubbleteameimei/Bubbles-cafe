/**
 * Database Connection Module
 * 
 * This module provides access to the PostgreSQL database using Drizzle ORM.
 * Enhanced with proper error handling and graceful degradation for improved reliability.
 */
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Global connection state 
let isConnected = false;
let connectionAttempted = false;
let connectionError: Error | null = null;
let lastConnectionAttempt: Date | null = null;
let lastSuccessfulConnection: Date | null = null;
let reconnectAttempts = 0;
let isEndpointDisabled = false;
let isReconnecting = false;

/**
 * Creates a database connection with graceful fallback
 */
function createDbConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('[Database] No DATABASE_URL found in environment variables');
    connectionError = new Error('DATABASE_URL environment variable is required');
    connectionAttempted = true;
    
    // Return a minimal pool implementation that will fail gracefully
    return createFallbackPool();
  }
  
  console.log('[Database] Initializing database connection...');
  lastConnectionAttempt = new Date();
  
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
      
      // Check for endpoint disabled error
      if (err.message && err.message.includes('endpoint is disabled')) {
        isEndpointDisabled = true;
        console.error('[Database] Neon database endpoint is disabled - site will operate in minimal mode');
      }
    });
    
    // Test the connection immediately
    pool.connect()
      .then(client => {
        client.query('SELECT 1')
          .then(() => {
            console.log('[Database] Successfully connected to PostgreSQL');
            isConnected = true;
            isEndpointDisabled = false;
            connectionError = null;
            lastSuccessfulConnection = new Date();
            reconnectAttempts = 0;
            client.release();
            
            // Schedule periodic reconnection attempts if previously disconnected
            scheduleReconnectionCheck(pool);
          })
          .catch(err => {
            console.error('[Database] Error testing connection:', err);
            isConnected = false;
            connectionError = err;
            
            // Check for endpoint disabled error
            if (err.message && err.message.includes('endpoint is disabled')) {
              isEndpointDisabled = true;
              console.error('[Database] Neon database endpoint is disabled - site will operate in minimal mode');
            }
            
            client.release();
          });
      })
      .catch(err => {
        console.error('[Database] Error establishing connection:', err);
        isConnected = false;
        connectionError = err;
        
        // Check for endpoint disabled error
        if (err.message && err.message.includes('endpoint is disabled')) {
          isEndpointDisabled = true;
          console.error('[Database] Neon database endpoint is disabled - site will operate in minimal mode');
        }
      });
    
    connectionAttempted = true;
    return pool;
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    connectionError = error as Error;
    connectionAttempted = true;
    
    // Check for endpoint disabled error
    if (error instanceof Error && error.message.includes('endpoint is disabled')) {
      isEndpointDisabled = true;
      console.error('[Database] Neon database endpoint is disabled - site will operate in minimal mode');
    }
    
    // Return a minimal pool implementation that will fail gracefully
    return createFallbackPool();
  }
}

/**
 * Creates a fallback pool implementation that gracefully handles failures
 */
function createFallbackPool() {
  // Create a minimal compatible interface that will always fail gracefully
  const mockPool: any = {
    connect: () => Promise.reject(new Error('Database connection not available')),
    query: () => Promise.reject(new Error('Database connection not available')),
    end: () => Promise.resolve(),
    on: () => {},
  };
  
  return mockPool;
}

/**
 * Schedules periodic reconnection attempts if disconnected
 */
function scheduleReconnectionCheck(pool: any) {
  if (!isConnected && !isReconnecting) {
    // Set a timer to attempt reconnection every minute
    isReconnecting = true;
    
    // Only log the first attempt
    console.log('[Database] Scheduling reconnection attempts...');
    
    const interval = setInterval(async () => {
      if (isConnected) {
        clearInterval(interval);
        isReconnecting = false;
        return;
      }
      
      reconnectAttempts++;
      lastConnectionAttempt = new Date();
      
      try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        
        console.log('[Database] Reconnection successful after', reconnectAttempts, 'attempts');
        isConnected = true;
        isEndpointDisabled = false;
        connectionError = null;
        lastSuccessfulConnection = new Date();
        client.release();
        clearInterval(interval);
        isReconnecting = false;
      } catch (error) {
        // Only log every few attempts to avoid spamming logs
        if (reconnectAttempts % 5 === 0) {
          console.warn(`[Database] Reconnection attempt ${reconnectAttempts} failed:`, error);
        }
      }
    }, 60000); // Try once per minute
  }
}

// Create the database pool
export const pool = createDbConnection();

// Create a SQL query executor function with enhanced error handling
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
      isEndpointDisabled = false;
      connectionError = null;
      lastSuccessfulConnection = new Date();
    }
    
    return result.rows;
  } catch (error) {
    console.error('[Database] Error executing SQL query:', error);
    isConnected = false;
    connectionError = error as Error;
    
    // Check for endpoint disabled error
    if (error instanceof Error && error.message.includes('endpoint is disabled')) {
      isEndpointDisabled = true;
    }
    
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
    lastConnectionAttempt = new Date();
    const result = await sql`SELECT 1 as test`;
    
    console.log('[Database] Connection validation successful');
    isConnected = true;
    isEndpointDisabled = false;
    connectionError = null;
    lastSuccessfulConnection = new Date();
    
    return result && result.length > 0 && result[0].test === 1;
  } catch (error) {
    console.error('[Database] Connection validation failed:', error);
    isConnected = false;
    connectionError = error as Error;
    
    // Check for endpoint disabled error
    if (error instanceof Error && error.message.includes('endpoint is disabled')) {
      isEndpointDisabled = true;
      console.error('[Database] Neon database endpoint is disabled - site will operate in minimal mode');
    }
    
    return false;
  }
}

// Safe database operation helper
export async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (isEndpointDisabled) {
    // Skip actual database operation if endpoint is known to be disabled
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('[Database] Operation failed with error:', error);
    
    // Check for endpoint disabled error
    if (error instanceof Error && error.message.includes('endpoint is disabled')) {
      isEndpointDisabled = true;
      console.warn('[Database] Endpoint is disabled, switching to fallback mode');
    }
    
    return fallback;
  }
}

// Export connection status and error information
export function getDatabaseStatus() {
  return {
    isConnected,
    connectionAttempted,
    lastConnectionAttempt,
    lastSuccessfulConnection,
    reconnectAttempts,
    isReconnecting,
    isEndpointDisabled,
    errorCode: connectionError && isEndpointDisabled ? 'ENDPOINT_DISABLED' : connectionError ? 'CONNECTION_ERROR' : null,
    error: connectionError ? connectionError.message : null
  };
}

export default db;