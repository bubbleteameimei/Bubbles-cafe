/**
 * Database Connection Initialization Module
 *
 * This script handles explicitly initializing the database connection
 * before any database operations are performed.
 */
import dns from 'node:dns';
import { promises as dnsPromises } from 'node:dns';
import pkg from 'pg';
const { Pool } = pkg;
import type { Pool as PgPool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import fs from 'fs';
import path from 'path';

// Prefer IPv4 to avoid ENETUNREACH when IPv6 is unreachable
try { dns.setDefaultResultOrder?.('ipv4first'); } catch {}

/**
 * Basic sanitizer for DATABASE_URL values
 */
function sanitizeDatabaseUrl(url?: string): string | undefined {
  if (!url) return url;
  let s = url.trim();
  s = s.replace(/\s+/g, '');
  s = s.replace(/^postgresal:\/\//i, 'postgresql://');
  s = s.replace(/^postgres:\/\//i, 'postgresql://');
  s = s.replace(/-pool-er/gi, '-pooler');
  s = s.replace(/re-?quire/gi, 'require');
  // Remove libpq-only channel_binding param which node-postgres does not use
  s = s.replace(/[?&]channel_binding=require/gi, '');
  // Ensure sslmode=require is present
  if (!/[?&]sslmode=/i.test(s)) {
    s += (s.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  return s;
}

/**
 * Parse a PostgreSQL connection string using URL with scheme swap
 */
function parsePgUrl(url: string) {
  // Swap scheme to http for URL parsing then map fields back
  const u = new URL(url.replace(/^postgresql:/i, 'http:'));
  // NOTE: u.username/u.password are already percent-decoded
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    user: decodeURIComponent(u.username || ''),
    password: decodeURIComponent(u.password || ''),
    database: u.pathname.replace(/^\//, ''),
    search: u.search || ''
  };
}

/**
 * Determine if SSL should be used based on connection string parameters and host.
 * Treat any sslmode except "disable" as requiring SSL for node-postgres.
 */
function wantsSSL(connString: string): boolean {
  try {
    const u = new URL(connString.replace(/^postgresql:/i, 'http:'));
    const params = new URLSearchParams(u.search);
    const mode = (params.get('sslmode') || '').toLowerCase();
    if (mode) return mode !== 'disable';
    const host = u.hostname;
    // Heuristic for common hosted providers
    return host.endsWith('supabase.co') || host.endsWith('neon.tech') || host.includes('render');
  } catch {
    const s = connString.toLowerCase();
    if (s.includes('sslmode=disable')) return false;
    return s.includes('sslmode=') || s.includes('supabase.co') || (process.env.NODE_ENV === 'production');
  }
}

/**
 * Build a connection config object for pg Pool, optionally overriding host
 * Always supply discrete fields to ensure our ssl options are respected.
 */
function buildPgConfig(connString: string, hostOverride?: string) {
  const p = parsePgUrl(connString);
  const useSSL = wantsSSL(connString);

  return {
    host: hostOverride || p.host,
    port: p.port,
    user: p.user,
    password: p.password || undefined,
    database: p.database,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    maxUses: 5000,
    keepAlive: true,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined
  } as pkg.PoolConfig;
}

/**
 * Resolve the host in a connection string to an IPv4 address if possible.
 * Returns undefined if resolution fails or host is already an IPv4 literal.
 */
async function resolveIPv4Host(connString: string): Promise<string | undefined> {
  try {
    const { host } = parsePgUrl(connString);
    // If host already looks like an IPv4 literal, keep it
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return host;
    // If host appears to be an IPv6 literal, we cannot coerce — return undefined
    if (/^[0-9a-fA-F:]+$/.test(host)) return undefined;
    const res = await dnsPromises.lookup(host, { family: 4 });
    return res?.address;
  } catch {
    return undefined;
  }
}

// Prefer Supabase connection pooler URL if provided via environment
const POOLER_URL = sanitizeDatabaseUrl(
  process.env.SUPABASE_POOLER_URL ||
  process.env.SUPABASE_CONNECTION_POOLER_URL ||
  process.env.DB_POOLER_URL
);
if (POOLER_URL) {
  process.env.DATABASE_URL = POOLER_URL;
}

// Do not set a default DATABASE_URL here. It must be provided by the environment (.env or platform).
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
        const dbUrlMatch = envContent.match(/DATABASE_URL["']?=(.*?)[\"']?$/m);

        if (dbUrlMatch && dbUrlMatch[1]) {
          process.env.DATABASE_URL = sanitizeDatabaseUrl(dbUrlMatch[1])!;
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

  const originalUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL)!;

  // Attempt to create pool with IPv4-first resolution; on ENETUNREACH fallback to explicit IPv4
  let pool = new Pool(buildPgConfig(originalUrl));
  let db = drizzle(pool, { schema });

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
  } catch (error: any) {
    const message = String(error?.message || '');
    // If IPv6 route is unreachable, try forcing IPv4 by resolving host to an IPv4 literal
    if (message.includes('ENETUNREACH') || message.includes('EAI_AGAIN') || message.includes('ETIMEDOUT')) {
      try {
        console.log('🌐 IPv6 connection failed, attempting IPv4 fallback...');
        const ipv4 = await resolveIPv4Host(originalUrl);
        if (ipv4) {
          // Replace pool with IPv4 override
          pool = new Pool(buildPgConfig(originalUrl, ipv4));
          db = drizzle(pool, { schema });
          client = await pool.connect();
          const result = await client.query('SELECT 1 as connected');
          if (result.rows[0].connected === 1) {
            console.log('✅ Database connection successful via IPv4 fallback');
            return { pool, db };
          }
        } else {
          console.warn('⚠️ Could not resolve IPv4 address for database host');
        }
      } catch (fallbackErr) {
        console.error('❌ IPv4 fallback connection failed:', fallbackErr);
      } finally {
        try { client?.release(); } catch {}
      }
    }

    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    try { client?.release(); } catch {}
  }
}