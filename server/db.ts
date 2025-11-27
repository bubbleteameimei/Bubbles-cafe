import 'dotenv/config';
import dns, { promises as dnsPromises } from 'node:dns';
import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Prefer IPv4 to avoid ENETUNREACH in IPv6-only resolutions
try { dns.setDefaultResultOrder?.('ipv4first'); } catch {}

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

  // Ensure sslmode=require if not present and remove incompatible params
  const [base, query = ''] = s.split('?');
  const params = new URLSearchParams(query);
  params.set('sslmode', params.get('sslmode') || 'require');
  // Node-postgres does not use libpq's channel_binding parameter; remove if present
  params.delete('channel_binding');
  s = base + '?' + params.toString();

  return s;
}

// Resolve database URL from environment with sanitization
// Prefer Supabase connection pooler URL if provided
const DATABASE_URL = sanitizeDatabaseUrl(
  process.env.SUPABASE_POOLER_URL ||
  process.env.SUPABASE_CONNECTION_POOLER_URL ||
  process.env.DB_POOLER_URL ||
  process.env.DATABASE_URL
);

// Create pool with connection retry logic using node-postgres
let pool: pkg.Pool | undefined;
let db: any;

function parsePgUrl(url: string) {
  const u = new URL(url.replace(/^postgresql:/i, 'http:'));
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username || ''),
    password: decodeURIComponent(u.password || ''),
    database: u.pathname.replace(/^\//, '')
  };
}

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
    // Enforce Supabase-only hosts (fail fast if a Neon host is detected)
    const parsedForPrimary = parsePgUrl(DATABASE_URL);
    if (parsedForPrimary.host.endsWith('neon.tech')) {
      throw new Error('Invalid DATABASE_URL host (neon.tech). This project is configured to use Supabase only.');
    }

    // Decide SSL usage: treat any sslmode except "disable" as SSL
    const wantsSSL = (url: string): boolean => {
      try {
        const u = new URL(url.replace(/^postgresql:/i, 'http:'));
        const params = new URLSearchParams(u.search);
        const mode = (params.get('sslmode') || '').toLowerCase();
        if (mode) return mode !== 'disable';
        const host = u.hostname;
        return host.endsWith('supabase.co');
      } catch {
        const s = url.toLowerCase();
        if (s.includes('sslmode=disable')) return false;
        return s.includes('sslmode=') || s.includes('supabase.co') || (process.env.NODE_ENV === 'production');
      }
    };

    const useSSL = wantsSSL(DATABASE_URL);
    const maxClients = Number(process.env.DB_POOL_MAX || 5);
    const idleMs = Number(process.env.DB_POOL_IDLE_MS || 5000);
    const connTimeoutMs = Number(process.env.DB_POOL_CONN_TIMEOUT_MS || 10000);

    // Build discrete config to ensure our ssl options are respected
    pool = new Pool({
      host: parsedForPrimary.host,
      port: parsedForPrimary.port,
      user: parsedForPrimary.user,
      password: parsedForPrimary.password || undefined,
      database: parsedForPrimary.database,
      max: maxClients,
      idleTimeoutMillis: idleMs,
      connectionTimeoutMillis: connTimeoutMs,
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
        // Try IPv4 fallback if initial test failed due to IPv6 issues
        try {
          const msg = String(error instanceof Error ? error.message : error);
          if (msg.includes('ENETUNREACH') || msg.includes('EAI_AGAIN') || msg.includes('ETIMEDOUT')) {
            const parsed = parsedForPrimary;
            // If host is not an IPv4 literal or IPv6 literal, attempt IPv4 resolution
            if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.host) && !/^[0-9a-fA-F:]+$/.test(parsed.host)) {
              const { address } = await dnsPromises.lookup(parsed.host, { family: 4 });
              const fallbackPool = new Pool({
                host: address,
                port: parsed.port,
                user: parsed.user,
                password: parsed.password || undefined,
                database: parsed.database,
                max: maxClients,
                idleTimeoutMillis: idleMs,
                connectionTimeoutMillis: connTimeoutMs,
                ssl: useSSL ? { rejectUnauthorized: false } : undefined
              });
              // Replace pool and drizzle instance
              pool = fallbackPool;
              db = drizzle(pool, { schema });

              // Test the fallback connection with a separate client instance
              let fallbackClient: pkg.PoolClient | undefined;
              try {
                fallbackClient = await pool.connect();
                await fallbackClient.query('SELECT 1');
                try { process.stderr.write('Database connection established via IPv4 fallback\n'); } catch {}
              } finally {
                fallbackClient?.release();
              }
            }
          }
        } catch (fallbackErr) {
          try {
            process.stderr.write(`IPv4 fallback failed: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}\n`);
          } catch {}
        }
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