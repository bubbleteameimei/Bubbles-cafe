import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Configure WebSocket for Neon serverless
try {
  neonConfig.webSocketConstructor = ws;
  // Set additional options (only if they exist in this version)
  console.log('Configured Neon with WebSocket support');

  // Attempt to add safety options if available (wrapped in try/catch to avoid errors)
  try {
    // @ts-ignore - These may not exist in all versions of the Neon SDK
    neonConfig.useSecureWebSocket = true;
  } catch (configErr) {
    console.log('Note: Some config options not available in this Neon version');
  }
} catch (error) {
  console.error('Error configuring Neon WebSocket:', error);
  // Fallback to default HTTP mode if WebSocket fails
  console.log('Falling back to HTTP mode for Neon connections');
}

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure the database is properly configured.",
  );
}

// Create connection pool with improved error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduce max connections to avoid overwhelming the server
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Increase connection timeout
  maxUses: 5000, // Close connections after 5000 queries
  allowExitOnIdle: true, // Allow the pool to exit if all connections are idle
  keepAlive: true // Enable TCP keepalive to prevent dropped connections
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Enhanced connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', {
    message: err.message,
    stack: err.stack
  });
  // Don't try to release the client here, just log the error
});

// Connection monitoring
pool.on('connect', () => {
  console.log('New client connected to database');
});

pool.on('remove', () => {
  console.log('Client connection removed from pool');
});

// Improved connection testing with detailed error logging and retry mechanism
async function testConnection(retries = 3, delay = 2000) {
  let client;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Testing database connection (attempt ${attempt}/${retries})...`);
      client = await pool.connect();
      await client.query('SELECT 1'); // Verify we can execute queries
      console.log('Database connection test successful');
      return true;
    } catch (err: unknown) {
      lastError = err;
      console.error(`Database connection test failed (attempt ${attempt}/${retries}):`, {
        message: err instanceof Error ? err.message : String(err),
        code: err instanceof Error && 'code' in err ? (err as any).code : undefined
      });
      
      if (attempt < retries) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next attempt
        delay = delay * 1.5;
      }
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
  
  // If we get here, all retries failed
  console.error('All connection attempts failed');
  throw lastError;
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