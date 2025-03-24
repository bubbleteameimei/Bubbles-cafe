import { pool, db } from '../server/db';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';

async function initializeDb() {
  console.log('Starting database initialization...');

  try {
    // Run migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initializeDb();