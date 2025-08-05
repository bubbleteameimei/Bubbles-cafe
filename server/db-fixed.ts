import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// Configure WebSocket for Neon serverless with enhanced error handling
try {
  neonConfig.webSocketConstructor = ws;
  
  // Set additional options (only if they exist in this version)
  

  // Suppress WebSocket errors that could crash the server
  // This prevents the "Cannot set property message of #<ErrorEvent> which has only a getter" error
  globalThis.ErrorEvent = globalThis.ErrorEvent || class ErrorEvent extends Event {
    constructor(type: string, options?: ErrorEventInit) {
      super(type, options);
      Object.defineProperty(this, 'message', {
        get() {
          return options?.message || '';
        }
      });
    }
  };
  
  // Attempt to add safety options if available (wrapped in try/catch to avoid errors)
  try {
    // Configure connection pooling for better performance
    if (typeof neonConfig.poolQueryViaFetch !== 'undefined') {
      neonConfig.poolQueryViaFetch = true;
    }
    
    // Use secure WebSocket connections
    if (typeof neonConfig.useSecureWebSocket !== 'undefined') {
      neonConfig.useSecureWebSocket = true;
    }
    
    // Add additional configuration for better resilience
    if (typeof neonConfig.fetchConnectionCache !== 'undefined') {
      neonConfig.fetchConnectionCache = true;
    }
  } catch (configError) {
    console.warn('[DB Config] Some Neon configuration options may not be available in this version:', configError);
  }
} catch (error) {
  console.error('Error configuring Neon WebSocket:', error);
  // Fallback to default HTTP mode if WebSocket fails
  
}

const execPromise = promisify(exec);

// Create a placeholder pool and db for export
// These will be replaced with real instances once initialization is complete
const dummyPool: any = {
  on: () => {},
  connect: async () => { throw new Error('Pool not yet initialized'); }
};

// Export variables that will be updated once the pool is initialized
export let pool: Pool = dummyPool as Pool;
export let db: any = {};

/**
 * Function to attempt to recover DATABASE_URL from various sources
 */
async function recoverDatabaseUrl(): Promise<boolean> {
  
  
  let databaseUrl = null;
  
  // Try to read from .env file
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
      
      if (dbUrlMatch && dbUrlMatch[1]) {
        databaseUrl = dbUrlMatch[1];
        
      }
    } else {
      
    }
  } catch (err) {
    console.error('❌ Error reading .env file:', err);
  }
  
  // If still no DATABASE_URL, check if we can get it from the environment
  if (!databaseUrl) {
    try {
      
      const { stdout } = await execPromise('env | grep DATABASE_URL');
      if (stdout.trim()) {
        const dbUrl = stdout.trim().split('=')[1];
        if (dbUrl) {
          databaseUrl = dbUrl;
          
        }
      }
    } catch (err) {
      
    }
  }
  
  // If we found a DATABASE_URL, set it in process.env
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl;
    
    
    // Try to save to .env file for future use
    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        // Update DATABASE_URL if it exists
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(/DATABASE_URL=.*(\r?\n|$)/m, `DATABASE_URL=${databaseUrl}$1`);
        } else {
          // Add DATABASE_URL if it doesn't exist
          envContent += `\nDATABASE_URL=${databaseUrl}\n`;
        }
      } else {
        envContent = `DATABASE_URL=${databaseUrl}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      
    } catch (err) {
      console.warn('⚠️ Could not update .env file:', err);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Test database connection with retries
 */
async function testConnection(retries = 3, delay = 2000): Promise<boolean> {
  let client;
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      
      client = await pool.connect();
      await client.query('SELECT 1'); // Verify we can execute queries
      
      return true;
    } catch (err: unknown) {
      lastError = err;
      console.error(`Database connection test failed (attempt ${attempt}/${retries}):`, {
        message: err instanceof Error ? err.message : String(err),
        code: err instanceof Error && 'code' in err ? (err as any).code : undefined
      });
      
      if (attempt < retries) {
        
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

// Self-executing async function to initialize the database connection
(async () => {
  try {
    // Ensure DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.warn("⚠️ DATABASE_URL environment variable is not set, attempting to recover...");
      
      const recovered = await recoverDatabaseUrl();
      if (!recovered) {
        console.error("❌ Could not recover DATABASE_URL. Database operations will fail.");
        console.error("💡 Please set DATABASE_URL in the Secrets tab in Replit or in a .env file.");
        
        // Use a fallback URL for development to allow the server to start
        if (process.env.NODE_ENV === 'development') {
          console.warn("⚠️ Using a temporary PostgreSQL connection string for development purposes");
          process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
        }
      }
    }
    
    // Create the real pool
    const realPool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // Reduce max connections to avoid overwhelming the server
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 10000, // Increase connection timeout
      maxUses: 5000, // Close connections after 5000 queries
      allowExitOnIdle: true, // Allow the pool to exit if all connections are idle
      keepAlive: true // Enable TCP keepalive to prevent dropped connections
    });
    
    // Assign the real pool to our exported variable
    pool = realPool;
    
    // Set up event handlers
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', {
        message: err.message,
        stack: err.stack
      });
      // Don't try to release the client here, just log the error
    });
    
    pool.on('connect', () => {
      
    });
    
    pool.on('remove', () => {
      
    });
    
    // Initialize Drizzle with schema
    db = drizzle(pool, { schema });
    
    // Test the connection
    try {
      await testConnection();
      
    } catch (err) {
      console.error('Failed to initialize database:', err);
      // Log the DATABASE_URL format (without credentials)
      const dbUrl = process.env.DATABASE_URL || '';
      const sanitizedUrl = dbUrl.replace(/\/\/[^@]+@/, '//****:****@');
      console.error('Database URL format:', sanitizedUrl);
    }
  } catch (err) {
    console.error('Critical error during database initialization:', err);
  }
})();

export default db;