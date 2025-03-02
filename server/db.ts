import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const db = drizzle(pool, { schema });

pool.on('connect', async (client) => {
  console.log('New client connected to database');
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      );
    `);
    if (!result.rows[0].exists) {
      console.log('Posts table not found - schema may need initialization');
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


export default db;