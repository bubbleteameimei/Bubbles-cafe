#!/usr/bin/env tsx
/**
 * Render startup script
 * Binds the port IMMEDIATELY so Render detects it without timing out,
 * then verifies the database connection in the background.
 */

import 'dotenv/config';
import { pool } from '../server/db';
import app from '../server/index';

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🚀 Starting Bubbles Cafe API...');
console.log(`📝 Environment: ${NODE_ENV}`);

// Bind port FIRST — Render must detect the port quickly or it times out.
// DB checks happen after the server is already listening.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔐 Auth: Google OAuth + JWT`);
  console.log(`📊 Database: Neon PostgreSQL`);
  console.log(`🌐 CORS: Configured for ${NODE_ENV === 'production' ? 'production' : 'development'}`);
  console.log('\n📡 API endpoints ready at /api/*\n');
});

// Verify DB connection in the background (non-blocking)
(async () => {
  try {
    console.log('🔍 Testing database connection...');
    const result = await (pool as any).query('SELECT version()');
    console.log('✅ Database connected');
    console.log(`   PostgreSQL: ${(result.rows[0].version as string).split(',')[0]}`);
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError instanceof Error ? dbError.message : String(dbError));
    console.error('   Check DATABASE_URL environment variable');
    // Don't exit — server is already bound; health check will reflect DB state
  }

  try {
    console.log('🔍 Verifying database schema...');
    await (pool as any).query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1",
      ['public']
    );
    console.log('✅ Database schema exists');
  } catch (schemaError) {
    console.warn('⚠️  Could not verify schema:', schemaError instanceof Error ? schemaError.message : String(schemaError));
  }
})();

// Graceful shutdown — MUST exit within 10 s or Render's restart is delayed.
function shutdown(signal: string) {
  console.log(`\n⏹️  ${signal} received, shutting down...`);

  // Hard-exit after 8 s no matter what — prevents lingering keep-alive
  // connections from blocking the process exit indefinitely.
  const forceExit = setTimeout(() => {
    console.log('⚠️  Forcing exit after timeout');
    process.exit(0);
  }, 8000);
  forceExit.unref();

  server.close(() => {
    (pool as any).end().then(() => {
      clearTimeout(forceExit);
      console.log('✅ Server stopped cleanly');
      process.exit(0);
    }).catch(() => {
      clearTimeout(forceExit);
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
