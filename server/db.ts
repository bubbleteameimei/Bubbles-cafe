import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure the database is properly configured.",
  );
}

// Create connection pool with improved error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase max connections for better concurrency
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Increase connection timeout
  maxUses: 7500, // Close connections after 7500 queries
  allowExitOnIdle: true // Allow the pool to exit if all connections are idle
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Enhanced connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', {
    message: err.message,
    stack: err.stack
  });
});

// Connection monitoring with schema verification
pool.on('connect', async (client) => {
  console.log('New client connected to database');
  try {
    // Verify schema tables exist
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      );
    `);
    if (!result.rows[0].exists) {
      console.error('Posts table not found - schema may not be initialized');
    } else {
      console.log('Schema verification successful - posts table exists');
    }
  } catch (error) {
    console.error('Error verifying schema:', error);
  }
});

pool.on('remove', () => {
  console.log('Client connection removed from pool');
});

// Test connection and schema on startup
async function testConnection() {
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();

    // Verify basic connectivity
    await client.query('SELECT 1');
    console.log('Database connection test successful');

    // Verify schema exists
    const schemaTest = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      );
    `);

    if (!schemaTest.rows[0].exists) {
      console.error('WARNING: Posts table not found - attempting schema initialization');
      throw new Error('Schema initialization required');
    }

    console.log('Schema verification successful');
    return true;
  } catch (err) {
    console.error('Database connection or schema test failed:', err);
    throw err;
  } finally {
    if (client) {
      try {
        await client.release();
      } catch (releaseErr) {
        console.error('Error releasing client:', releaseErr);
      }
    }
  }
}

// Run initial connection test with retries
let retries = 3;
async function initializeWithRetry() {
  while (retries > 0) {
    try {
      await testConnection();
      console.log('Database initialization complete');
      return;
    } catch (err) {
      retries--;
      if (retries > 0) {
        console.log(`Retrying database initialization. ${retries} attempts remaining`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      } else {
        console.error('Failed to initialize database after all retries:', err);
        process.exit(1);
      }
    }
  }
}

initializeWithRetry()
  .catch(err => {
    console.error('Failed to initialize database:', err);
    // Log the DATABASE_URL format (without credentials)
    const dbUrl = process.env.DATABASE_URL || '';
    const sanitizedUrl = dbUrl.replace(/\/\/[^@]+@/, '//****:****@');
    console.error('Database URL format:', sanitizedUrl);
    process.exit(1);
  });

export default db;