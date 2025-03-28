import { initializeDatabaseConnection } from './connect-db';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

async function initializeDb() {
  console.log('🚀 Starting database initialization and migrations...');

  let pool, db;
  
  try {
    // Initialize database connection
    console.log('🔌 Connecting to database...');
    const connection = await initializeDatabaseConnection();
    pool = connection.pool;
    db = connection.db;
    
    // Run migrations
    console.log('📄 Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('✅ Migrations completed successfully');

    console.log('🎉 Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      console.log('🔌 Closing database connection...');
      await pool.end();
    }
  }
}

initializeDb().catch(err => {
  console.error('Unhandled error during database initialization:', err);
  process.exit(1);
});