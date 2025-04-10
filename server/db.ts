/**
 * Database Connection Module
 * 
 * This module provides direct access to the PostgreSQL database using the Neon serverless driver.
 * Enhanced with proper error handling for improved reliability.
 */
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@shared/schema';
import ws from 'ws';

// Required for Neon serverless in Node.js
neonConfig.webSocketConstructor = ws;

// Configure connection options
try {
  // @ts-ignore - Increase connection timeouts
  neonConfig.connectionTimeoutMillis = 10000; // 10 seconds
} catch (configErr) {
  console.log('[Database] Note: Some config options not available');
}

/**
 * Creates a database connection
 */
function createDbConnection() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('[Database] No DATABASE_URL found in environment variables');
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  console.log('[Database] Initializing database connection...');
  
  try {
    // Connect using the Neon HTTP driver
    return neon(dbUrl.toString());
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    throw new Error('Cannot establish database connection');
  }
}

// Create the SQL executor
export const sql = createDbConnection();

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