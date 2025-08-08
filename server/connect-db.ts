import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

export async function initializeDatabaseConnection(): Promise<{ pool: any; db: any }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn('DATABASE_URL is not set; database features will be unavailable.');
    // Create a dummy pool/db that throws on use to keep server booting without DB
    const dummy = {
      connect: async () => { throw new Error('No database configured'); }
    } as any;
    return { pool: dummy, db: {} };
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 5000,
    keepAlive: true
  });

  const db = drizzle(pool, { schema });

  let client: any;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
  } finally {
    if (client) client.release();
  }

  return { pool, db };
}