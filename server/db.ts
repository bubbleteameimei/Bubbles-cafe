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

// Create pool with connection retry logic using node-postgres
let pool: pkg.Pool | undefined;
let db: any;

if (!DATABASE_URL) {
  // Do NOT throw at import time — let the app start and serve non-DB routes.
  try {
    process.stderr.write('DATABASE_URL is not set. Starting without database; DB-dependent routes will be unavailable.\n');
  } catch {}
  // Provide a safe stub that throws only when used
  db = new Proxy({}, {
    get(_target, _prop) {
      return (..._args: unknown[]) => {
        throw new Error('Database not configured. Set DATABASE_URL in the environment.');
      };
    }
  });
} else {
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

    // Test the connection asynchronously without throwing at module import time
    (async () => {
      let client: pkg.PoolClient | undefined;
      try {
        client = await pool!.connect();
        await client.query('SELECT 1');
      } catch (error) {
        try {
          process.stderr.write(`Failed to test database connection: ${error instanceof Error ? error.message : String(error)}\n`);
        } catch {}
        // Do not rethrow — allow app to keep running
      } finally {
        client?.release();
      }
    })();
  } catch (error) {
    try {
      process.stderr.write(`Failed to initialize database: ${error instanceof Error ? error.message : String(error)}\n`);
    } catch {}
    // Provide a stub to avoid hard crash
    db = new Proxy({}, {
      get(_target, _prop) {
        return (..._args: unknown[]) => {
          throw new Error('Database initialization failed.');
        };
      }
    });
  }
}

export { pool, db };