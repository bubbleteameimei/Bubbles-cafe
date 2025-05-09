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

// Check if we're in test mode (SKIP_DB=true)
const skipDb = process.env.SKIP_DB === 'true';

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
  // If we're in test mode, return a mock SQL function
  if (skipDb) {
    console.log('[Database] Running in SKIP_DB mode with mock database');
    // Return a mock SQL function that resolves with test data
    return (strings: TemplateStringsArray, ...values: any[]) => {
      console.log('[Database] Mock SQL query:', strings.join('?'), values);
      return Promise.resolve([{ test: 1 }]);
    };
  }

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
export const db = skipDb 
  ? {} as any // Return empty mock in test mode
  : drizzle(sql, { schema });

// Export a helper function to validate the database connection
export async function validateConnection() {
  if (skipDb) {
    console.log('[Database] Skipping connection validation in test mode');
    return true;
  }
  
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