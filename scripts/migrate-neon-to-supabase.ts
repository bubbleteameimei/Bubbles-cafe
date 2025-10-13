/**
 * Neon -> Supabase Migration Script
 *
 * This script automates:
 *  - pg_dump from Neon
 *  - pg_restore into Supabase
 *
 * Usage:
 *  1) Set Neon source (either URL or components):
 *     NEON_DATABASE_URL=postgresql://user:pass@ep-xxxxx-pooler.neon.tech/neondb?sslmode=require
 *     OR
 *     NEON_PGHOST=ep-xxxxx-pooler.neon.tech
 *     NEON_PGPORT=5432
 *     NEON_PGUSER=neon_user
 *     NEON_PGPASSWORD=neon_password
 *     NEON_PGDATABASE=neondb
 *
 *  2) Set Supabase target (either URL or components):
 *     SUPABASE_DATABASE_URL=postgresql://postgres:pass@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require
 *     OR
 *     SUPABASE_PGHOST=db.<PROJECT_REF>.supabase.co
 *     SUPABASE_PGPORT=5432
 *     SUPABASE_PGUSER=postgres
 *     SUPABASE_PGPASSWORD=supabase_password
 *     SUPABASE_PGDATABASE=postgres
 *
 *  3) Run:
 *     npx tsx scripts/migrate-neon-to-supabase.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseConnectionString } from 'pg-connection-string';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

type Creds = {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
};

function credsFromUrl(url: string): Creds {
  const parsed = parseConnectionString(url);
  return {
    host: parsed.host || 'localhost',
    port: String(parsed.port || 5432),
    user: parsed.user || 'postgres',
    password: parsed.password || '',
    database: parsed.database || 'postgres',
  };
}

function resolveSourceCreds(): Creds {
  const url = process.env.NEON_DATABASE_URL;
  if (url && url.trim()) {
    return credsFromUrl(url);
  }
  const host = process.env.NEON_PGHOST;
  const port = process.env.NEON_PGPORT || '5432';
  const user = process.env.NEON_PGUSER;
  const password = process.env.NEON_PGPASSWORD || '';
  const database = process.env.NEON_PGDATABASE;

  if (!host || !user || !database) {
    throw new Error('Missing Neon source credentials. Provide NEON_DATABASE_URL or NEON_PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE');
  }
  return { host, port, user, password, database };
}

function resolveTargetCreds(): Creds {
  const url = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (url && url.trim()) {
    return credsFromUrl(url);
  }
  const host = process.env.SUPABASE_PGHOST;
  const port = process.env.SUPABASE_PGPORT || '5432';
  const user = process.env.SUPABASE_PGUSER || 'postgres';
  const password = process.env.SUPABASE_PGPASSWORD || '';
  const database = process.env.SUPABASE_PGDATABASE || 'postgres';

  if (!host || !user || !database) {
    throw new Error('Missing Supabase target credentials. Provide SUPABASE_DATABASE_URL (or DATABASE_URL) or SUPABASE_PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE');
  }
  return { host, port, user, password, database };
}

async function migrate() {
  console.log('🚚 Starting Neon -> Supabase migration');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupsDir = path.join(projectRoot, 'backups');
  await fs.mkdir(backupsDir, { recursive: true });
  const dumpPath = path.join(backupsDir, `neon-to-supabase-${timestamp}.dump`);

  const neon = resolveSourceCreds();
  const supa = resolveTargetCreds();

  console.log('📤 Dumping from Neon...');
  const dumpCmd = `pg_dump -Fc --no-owner --no-privileges -h "${neon.host}" -p "${neon.port}" -U "${neon.user}" -d "${neon.database}" -f "${dumpPath}"`;
  await execAsync(dumpCmd, { env: { ...process.env, PGPASSWORD: neon.password } });
  console.log(`✅ Dump created: ${dumpPath}`);

  console.log('📥 Restoring into Supabase...');
  const restoreCmd = `pg_restore --no-owner --no-privileges -h "${supa.host}" -p "${supa.port}" -U "${supa.user}" -d "${supa.database}" -v "${dumpPath}"`;
  await execAsync(restoreCmd, { env: { ...process.env, PGPASSWORD: supa.password } });
  console.log('✅ Restore completed');

  console.log('\n🔧 Optional: ensure required extensions exist on Supabase (if your schema uses them):');
  console.log('  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  console.log('  CREATE EXTENSION IF NOT EXISTS "pg_trgm";');

  console.log('\n🎉 Migration done. Now update DATABASE_URL in your environment to point to Supabase.');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});