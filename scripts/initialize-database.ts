import setupDatabase from './setup-db';
import pushSchema from './db-push';
import seedFromWordPressAPI from './api-seed';

async function initializeDatabase() {
  console.log('🚀 Starting complete database initialization...');
  
  try {
    // Step 1: Set up database connection
    console.log('\n📌 STEP 1: Setting up database connection');
    const setupResult = await setupDatabase();
    if (!setupResult) {
      throw new Error('Failed to set up database connection');
    }
    console.log('✅ Database connection set up successfully');
    
    // Step 2: Push schema to database
    console.log('\n📌 STEP 2: Creating database schema');
    const schemaResult = await pushSchema();
    if (!schemaResult) {
      throw new Error('Failed to create database schema');
    }
    console.log('✅ Database schema created successfully');
    
    // Step 3: Seed data from WordPress API
    console.log('\n📌 STEP 3: Seeding data from WordPress API');
    const seedResult = await seedFromWordPressAPI();
    console.log('✅ Data seeded successfully');
    
    // Success!
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('📊 Import summary:', seedResult);
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase().then(success => {
    if (success) {
      console.log('✅ Database is now fully set up and ready to use');
      process.exit(0);
    } else {
      console.error('❌ Database initialization failed');
      process.exit(1);
    }
  });
}

export default initializeDatabase;