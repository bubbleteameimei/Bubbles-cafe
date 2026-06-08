#!/usr/bin/env tsx
/**
 * Render Setup Script
 * Verifies and initializes the environment for Render deployment
 */

import 'dotenv/config';
import { pool } from '../server/db';

const requiredEnvVars = [
  'DATABASE_URL',
  'CSRF_SECRET',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

const optionalEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GMAIL',
  'GMAIL_APP_PASSWORD',
];

async function main() {
  console.log('\n🔧 Render Setup Verification\n');

  // Check required environment variables
  console.log('📋 Checking required environment variables...');
  const missingRequired = requiredEnvVars.filter(v => !process.env[v]);

  if (missingRequired.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingRequired.forEach(v => console.error(`   - ${v}`));
    process.exit(1);
  }

  console.log('✅ All required environment variables are set\n');

  // Check secret lengths
  console.log('🔐 Checking secret key lengths...');
  const secretChecks = [
    { name: 'CSRF_SECRET', minLength: 32 },
    { name: 'JWT_SECRET', minLength: 32 },
    { name: 'JWT_REFRESH_SECRET', minLength: 32 },
    { name: 'SESSION_SECRET', minLength: 32 },
  ];

  const badSecrets = secretChecks.filter(
    check => (process.env[check.name] || '').length < check.minLength
  );

  if (badSecrets.length > 0) {
    console.error('\n❌ Secrets are too short (minimum 32 characters):');
    badSecrets.forEach(s => {
      const actual = (process.env[s.name] || '').length;
      console.error(`   - ${s.name}: ${actual} chars (need ${s.minLength})`);
    });
    process.exit(1);
  }

  console.log('✅ All secrets meet minimum length requirements\n');

  // Check optional variables
  console.log('📋 Checking optional environment variables...');
  const missingOptional = optionalEnvVars.filter(v => !process.env[v]);

  if (missingOptional.length > 0) {
    console.warn('⚠️  Some optional variables are not set:');
    missingOptional.forEach(v => console.warn(`   - ${v}`));
  } else {
    console.log('✅ All optional environment variables are configured\n');
  }

  // Test database connection
  console.log('\n🔍 Testing database connection...');
  try {
    const result = await (pool as any).query('SELECT version()');
    const versionInfo = (result.rows[0].version as string).split(',')[0];
    console.log(`✅ Database connected`);
    console.log(`   ${versionInfo}\n`);
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}`);
    console.error('\n⚠️  Ensure:');
    console.error('   1. DATABASE_URL is correct');
    console.error('   2. Connection string includes ?sslmode=require');
    console.error('   3. Neon IP is not restricted\n');
    process.exit(1);
  }

  // Check if schema exists
  console.log('🔍 Verifying database schema...');
  try {
    const result = await (pool as any).query(
      "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tableCount = parseInt(result.rows[0].table_count);

    if (tableCount === 0) {
      console.warn('⚠️  No tables found in database');
      console.warn('   Run migrations: npm run db:migrate\n');
    } else {
      console.log(`✅ Database schema exists (${tableCount} tables)\n`);

      // List tables
      const tables = await (pool as any).query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
      );

      console.log('📊 Tables:');
      tables.rows.forEach((t: any) => console.log(`   - ${t.table_name}`));
      console.log('');
    }
  } catch (error) {
    console.error('⚠️  Could not verify schema:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}\n`);
  }

  // Summary
  console.log('✅ Setup verification complete!\n');
  console.log('🚀 Ready to deploy on Render\n');
  console.log('Next steps:');
  console.log('  1. Push code to GitHub');
  console.log('  2. Render will auto-deploy');
  console.log('  3. Monitor logs in Render dashboard');
  console.log('  4. Test endpoints: curl https://api.bubbles-cafe.space/api/health\n');

  // Close connection
  try {
    await (pool as any).end();
  } catch (err) {
    // Ignore
  }

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
