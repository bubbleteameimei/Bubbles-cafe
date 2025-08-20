/**
 * Database Connection Initialization Module
 * 
 * This script handles explicitly initializing the database connection
 * before any database operations are performed.
 */
import pkg from 'pg';
const { Pool } = pkg;
import type { Pool as PgPool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import fs from 'fs';
import path from 'path';

// Sanitize potentially malformed DATABASE_URL values
function sanitizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return url;
  let s = url;
  s = s.replace(/\s+/g, '');
  s = s.replace(/^postgresal:\/\//i, 'postgresql://');
  s = s.replace(/^postgres:\/\//i, 'postgresql://');
  s = s.replace(/-pool-er/gi, '-pooler');
  s = s.replace(/re-?quire/gi, 'require');
  return s;
}

// Set permanent database URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL)!;
}

/**
 * Initialize database connection
 */
export async function initializeDatabaseConnection(): Promise<{ pool: PgPool, db: any }> {
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