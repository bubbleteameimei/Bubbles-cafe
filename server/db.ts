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
  max: 20, // Increased from default
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 5000, // 5 seconds
  maxUses: 7500, // Close connections after 7500 queries
  allowExitOnIdle: true, // Allow the pool to exit if all connections are idle
  retryInterval: 1000, // 1 second between retries
  maxRetries: 3 // Maximum number of retries
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Enhanced connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit process, attempt recovery
  client?.release();
});

// Connection success logging
pool.on('connect', () => {
  console.log('Successfully connected to database');
});

// Connection acquire logging
pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

// Enhanced test connection function with retries
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('Database connection test successful');

      // Test schema existence
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'posts'
        );
      `);

      const tableExists = result.rows[0].exists;
      if (!tableExists) {
        console.log('Schema tables not found, initiating push...');
        // The schema will be pushed by the startup script
      } else {
        console.log('Schema tables verified');
      }

      client.release();
      return true;
    } catch (err) {
      console.error(`Database connection attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
    }
  }
  return false;
}

// Run initial connection test with enhanced error reporting
testConnection().catch(err => {
  console.error('Initial database connection test failed:', err);
  console.error('Please check DATABASE_URL and database status');
  process.exit(1);
});

export default db;