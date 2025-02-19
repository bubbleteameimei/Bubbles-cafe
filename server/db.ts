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

// Create connection pool with error handling and retry logic
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxUses: 7500, // Close connections after 7500 queries
  allowExitOnIdle: true // Allow the pool to exit if all connections are idle
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Connection success logging
pool.on('connect', () => {
  console.log('Successfully connected to database');
});

// Test the connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
  } catch (err) {
    console.error('Error testing database connection:', err);
    throw err;
  }
}

// Run initial connection test
testConnection().catch(err => {
  console.error('Initial database connection test failed:', err);
  process.exit(1);
});

export default db;