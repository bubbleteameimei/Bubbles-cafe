import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  console.log('🚀 Setting up database...');
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Create necessary extensions
    console.log('Setting up database extensions...');
    try {
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.log('✅ Extensions created');
    } catch (error) {
      console.log('ℹ️  Extensions already exist or not needed');
    }

    console.log('✅ Database setup complete');
    console.log('⚠️ Automatic database seeding is disabled until a secure admin flow is established.');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch((error) => {
  console.error('Critical error:', error);
  process.exit(1);
});