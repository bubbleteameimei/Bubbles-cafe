/**
 * Database Connection Initialization Module
 * 
 * This script handles explicitly initializing the database connection
 * before any database operations are performed.
 */
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

/**
 * Initialize database connection
 */
export async function initializeDatabaseConnection(): Promise<{ pool: typeof Pool, db: any }> {
  // Use the Neon database configuration directly
  const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_P6ghCZR2BASQ@ep-young-bread-aeojmse9-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  
  // Set the DATABASE_URL to the Neon configuration
  const databaseUrl = process.env.DATABASE_URL || NEON_DATABASE_URL;
  process.env.DATABASE_URL = databaseUrl;
  
  console.log('🔗 Using Neon database for connection initialization');
  
  // Create the connection pool
  const pool = new Pool({ 
    connectionString: databaseUrl,
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