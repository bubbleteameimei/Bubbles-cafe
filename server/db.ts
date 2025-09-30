import 'dotenv/config';
import { neonConfig, Pool as NeonPool } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import pg from 'pg';
const { Pool: PgPool } = pg;
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';

// Load environment variables from .env file if it exists
if (existsSync(path.join(process.cwd(), '.env'))) {
  try {
    const envContent = readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    const envLines = envContent.split('\n');

    envLines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      }
    });
  } catch (error) {
    console.warn('Could not load .env file:', error);
  }
}

// Normalize and sanitize potentially malformed DATABASE_URL values
function sanitizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return url;
  let s = url.trim();
  s = s.replace(/\s+/g, '');
  s = s.replace(/^postgresal:\/\//i, 'postgresql://');
  s = s.replace(/^postgres:\/\//i, 'postgresql://');
  s = s.replace(/-pool-er/gi, '-pooler');
  // Normalize protocol case
  s = s.replace(/^POSTGRESQL:\/\//, 'postgresql://');
  // Remove duplicate sslmode parameters
  const [base, query = ''] = s.split('?');
  const params = new URLSearchParams(query);
  // Ensure require
  params.set('sslmode', params.get('sslmode') || 'require');
  s = base + '?' + params.toString();
  return s;
}

// Resolve database URL from environment with sanitization
const DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);

console.log('Environment check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set. Please configure your environment.');
  console.error('Available env vars:', Object.keys(process.env).filter((key) => key.includes('DATABASE')));
  throw new Error('DATABASE_URL is required');
}

// Decide which driver to use based on the URL
function isNeonUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return /neon\.tech$/i.test(u.hostname) || /neon/i.test(u.hostname);
  } catch {
    return url.includes('neon.tech');
  }
}

let pool: any;
let db: any;

try {
  if (isNeonUrl(DATABASE_URL)) {
    // Neon serverless over WebSocket
    try {
      neonConfig.webSocketConstructor = ws;
    } catch (err) {
      console.error('Error configuring Neon WebSocket:', err);
    }

    pool = new NeonPool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err: any) => {
      console.error('Unexpected error on idle Neon client', err);
    });

    db = drizzleNeon({ client: pool, schema });
  } else {
    // Standard Postgres (Render PostgreSQL, etc.)
    pool = new PgPool({
      connectionString: DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err: any) => {
      console.error('Unexpected error on idle pg client', err);
    });

    db = drizzlePg(pool, { schema });
  }
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

export { pool, db };