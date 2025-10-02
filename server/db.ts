import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Load environment variables from .env file if it exists
if (existsSync(path.join(process.cwd(), '.env'))) {
  try {
    const envContent = readFileSync(path.join(process.cwd(), '.env'), 'utf8');
    const envLines = envContent.split('\n');
    envLines.forEach(line => {
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
    try {
      process.stderr.write(`Could not load .env file: ${error instanceof Error ? error.message : String(error)}\n`);
    } catch {}
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
  s = s.replace(/re-?quire/gi, 'require');
  // Normalize protocol case
  s = s.replace(/^POSTGRESQL:\/\//, 'postgresql://');
  // Ensure sslmode=require if not present
  const [base, query = ''] = s.split('?');
  const params = new URLSearchParams(query);
  params.set('sslmode', params.get('sslmode') || 'require');
  s = base + '?' + params.toString();
  return s;
}

// Resolve database URL from environment with sanitization
const DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL);

if (!DATABASE_URL) {
  const msg = 'DATABASE_URL is not set. Please configure your environment.';
  try {
    process.stderr.write(msg + '\n');
  } catch {}
  throw new Error(msg);
}

// Create pool with connection retry logic using node-postgres
let pool: pkg.Pool;
let db: ReturnType<typeof drizzle>;

try {
  const useSSL = DATABASE_URL.includes('sslmode=require');
  pool = new Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined
  });

  // Hook pool events
  pool.on('error', (err: Error) => {
    try {
      process.stderr.write(`Unexpected error on idle client: ${err.message}\n`);
    } catch {}
  });

  db = drizzle(pool, { schema });

  // Test the connection
  (async () => {
    let client: pkg.PoolClient | undefined;
    try {
      client = await pool.connect();
      await client.query('SELECT 1');
    } catch (error) {
      try {
        process.stderr.write(`Failed to test database connection: ${error instanceof Error ? error.message : String(error)}\n`);
      } catch {}
      throw error;
    } finally {
      client?.release();
    }
  })();
} catch (error) {
  try {
    process.stderr.write(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}\n`);
  } catch {}
  throw error;
}

export { pool, db };