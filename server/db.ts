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

// Check if we're in test mode (SKIP_DB=true)
const skipDb = process.env.SKIP_DB === 'true';

/**
 * Creates a database connection
 */
function createDbConnection() {
  // If we're in test mode, return a mock connection
  if (skipDb) {
    console.log('[Database] Running in SKIP_DB mode with mock database');
    return null as any; // Return null as any to avoid type errors
  }

  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('[Database] No DATABASE_URL found in environment variables');
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  console.log('[Database] Initializing database connection...');
  
  try {
    // Connect using the pg Pool
    return new Pool({
      connectionString: dbUrl,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    });
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    throw new Error('Cannot establish database connection');
  }
}

// Create the database pool
export const pool = createDbConnection();

// Create a SQL query executor function for compatibility
export const sql = skipDb
  ? (strings: TemplateStringsArray, ...values: any[]) => {
      console.log('[Database] Mock SQL query:', strings.join('?'), values);
      return Promise.resolve([{ test: 1 }]);
    }
  : async (strings: TemplateStringsArray, ...values: any[]) => {
      const text = strings.join('?').replace(/\?/g, () => '$' + (values.length + 1));
      const client = await pool.connect();
      try {
        const result = await client.query(text, values);
        return result.rows;
      } finally {
        client.release();
      }
    };

// Initialize Drizzle ORM with our schema
export const db = skipDb 
  ? {} as any // Return empty mock in test mode
  : drizzle(pool, { schema });

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