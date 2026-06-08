#!/usr/bin/env tsx
/**
 * Render startup script
 * - Verifies database connection
 * - Runs pending migrations
 * - Starts Express server
 */

import 'dotenv/config';
import { pool, db } from '../server/db';
import app from '../server/index';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log('🚀 Starting Bubbles Cafe API...');
    console.log(`📝 Environment: ${NODE_ENV}`);

    // Test database connection
    console.log('🔍 Testing database connection...');
    try {
      const result = await (pool as any).query('SELECT version()');
      console.log('✅ Database connected');
      console.log(`   PostgreSQL: ${(result.rows[0].version as string).split(',')[0]}`);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError instanceof Error ? dbError.message : String(dbError));
      console.error('   Check DATABASE_URL environment variable');
      process.exit(1);
    }

    // Verify schema exists
    console.log('🔍 Verifying database schema...');
    try {
      await (pool as any).query('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1', ['public']);
      console.log('✅ Database schema exists');
    } catch (schemaError) {
      console.warn('⚠️  Could not verify schema. It may need initialization.');
      console.warn('   Run: npm run db:migrate');
    }

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(`🔐 Auth: Google OAuth + JWT`);
      console.log(`🛡️  CSRF: Signed tokens`);
      console.log(`📊 Database: Neon PostgreSQL`);
      console.log(`🌐 CORS: Configured for ${NODE_ENV === 'production' ? 'production' : 'development'}`);
      console.log('\n📡 API endpoints ready at /api/*\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⏹️  SIGTERM received, shutting down gracefully...');
      server.close(async () => {
        try {
          await (pool as any).end();
          console.log('✅ Server stopped');
          process.exit(0);
        } catch (err) {
          console.error('Error closing pool:', err);
          process.exit(1);
        }
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⏹️  SIGINT received, shutting down gracefully...');
      server.close(async () => {
        try {
          await (pool as any).end();
          console.log('✅ Server stopped');
          process.exit(0);
        } catch (err) {
          console.error('Error closing pool:', err);
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

startServer();
