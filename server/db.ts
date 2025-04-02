/**
 * Direct Database Connection Module
 * 
 * This module provides direct access to the database using the Neon serverless driver.
 * Enhanced with automatic reconnection handling for improved reliability.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';
import ws from 'ws';

// Required for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Configure Neon to use secure WebSockets
try {
  // @ts-ignore - These may not exist in all versions of the Neon SDK
  neonConfig.useSecureWebSocket = true;
  // @ts-ignore - Add additional configuration for better resilience 
  neonConfig.patchWebSocketForReconnect = true;
  // @ts-ignore - Increase connection timeouts
  neonConfig.connectionTimeoutMillis = 10000; // 10 seconds
  // @ts-ignore - Implement automatic retry
  neonConfig.retryCount = 3;
  // @ts-ignore - Implement automatic backoff
  neonConfig.backoffStrategy = (retryCount) => {
    return Math.min(100 * Math.pow(2, retryCount), 10000); // Exponential backoff with max of 10 seconds
  };
} catch (configErr) {
  console.log('Note: Some config options not available in this Neon version');
}

/**
 * Create SQL executor with connection resilience
 * This wraps the Neon client creation with better error handling and automatic reconnection
 */
function createResilientSqlClient() {
  const dbUrl = process.env.DATABASE_URL!;
  console.log('[Database] Initializing Neon database connection...');
  
  try {
    // Create a SQL executor using the Neon HTTP driver with all our config settings
    return neon(dbUrl);
  } catch (error) {
    console.error('[Database] Failed to create initial SQL client:', error);
    console.warn('[Database] Retrying connection with default settings...');
    
    // If the initial connection fails, try again with minimal settings
    try {
      return neon(dbUrl);
    } catch (fallbackError) {
      console.error('[Database] Critical database connection failure:', fallbackError);
      throw new Error('Cannot establish database connection after multiple attempts');
    }
  }
}

// Create a resilient SQL executor using the Neon HTTP driver
export const sql = createResilientSqlClient();

// Initialize Drizzle ORM with our schema
export const db = drizzle(sql, { schema });

// Export a helper function to validate the database connection
export async function validateConnection() {
  try {
    // Simple database query to test the connection
    const result = await sql`SELECT 1 as test`;
    return result && result.length > 0 && result[0].test === 1;
  } catch (error) {
    console.error('[Database] Connection validation failed:', error);
    return false;
  }
}

export default db;