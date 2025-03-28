/**
 * Database Connection Initialization Module
 * 
 * This script handles explicitly initializing the database connection
 * before any database operations are performed.
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '../shared/schema';
import ws from 'ws';
import fs from 'fs';
import path from 'path';

// Set up Neon configuration
neonConfig.webSocketConstructor = ws;
try {
  // @ts-ignore - These may not exist in all versions of the Neon SDK
  neonConfig.useSecureWebSocket = true;
  // @ts-ignore - Add additional configuration for better resilience
  neonConfig.patchWebSocketForReconnect = true;
} catch (configErr) {
  console.log('Note: Some config options not available in this Neon version');
}

/**
 * Initialize database connection
 */
export async function initializeDatabaseConnection(): Promise<{ pool: Pool, db: any }> {
  // Ensure DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL environment variable is not set, checking .env file...");
    
    try {
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        console.log('📄 Found .env file, checking for DATABASE_URL...');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const dbUrlMatch = envContent.match(/DATABASE_URL=["']?(.*?)["']?$/m);
        
        if (dbUrlMatch && dbUrlMatch[1]) {
          process.env.DATABASE_URL = dbUrlMatch[1];
          console.log('✅ Found DATABASE_URL in .env file');
        }
      }
    } catch (err) {
      console.error('❌ Error reading .env file:', err);
    }
    
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL environment variable is still not set");
      process.exit(1);
    }
  }
  
  // Create the connection pool
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 5000,
    keepAlive: true
  });
  
  // Initialize Drizzle ORM
  const db = drizzle(pool, { schema });
  
  // Test connection
  let client;
  try {
    console.log('🔌 Testing database connection...');
    client = await pool.connect();
    const result = await client.query('SELECT 1 as connected');
    if (result.rows[0].connected === 1) {
      console.log('✅ Database connection successful');
    }
    return { pool, db };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}