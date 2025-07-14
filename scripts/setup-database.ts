import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { seedDatabase } from '../server/seed';

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
    
    // Initialize the database with seed data
    console.log('🌱 Seeding database...');
    await seedDatabase();
    console.log('✅ Database seeding complete');

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