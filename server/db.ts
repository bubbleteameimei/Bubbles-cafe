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

// Create connection pool with improved error handling and retry logic
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase max connections for better concurrency
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Increase connection timeout
  maxUses: 7500, // Close connections after 7500 queries
  allowExitOnIdle: true, // Allow the pool to exit if all connections are idle
  retryInterval: 1000, // Retry every second
  maxRetries: 3 // Maximum number of retries
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Enhanced connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, attempt to recover
  client?.release(true); // Force release with error
});

// Connection monitoring
pool.on('connect', (client) => {
  console.log('New client connected to database');
});

pool.on('remove', (client) => {
  console.log('Client connection removed from pool');
});

// Improved connection testing with detailed error logging
async function testConnection() {
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();
    await client.query('SELECT 1'); // Verify we can execute queries
    console.log('Database connection test successful');
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err);
    throw err;
  } finally {
    client?.release();
  }
}

// Run initial connection test
testConnection()
  .then(() => {
    console.log('Database initialization complete');
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    // Log the DATABASE_URL format (without credentials)
    const dbUrl = process.env.DATABASE_URL || '';
    const sanitizedUrl = dbUrl.replace(/\/\/[^@]+@/, '//****:****@');
    console.error('Database URL format:', sanitizedUrl);
    process.exit(1);
  });

export default db;