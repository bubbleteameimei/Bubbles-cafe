import { pool, db } from '../server/db';
import { users, posts } from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { readdir } from 'fs/promises';
import path from 'path';

async function initializeDb() {
  console.log('Starting database initialization...');

  try {
    // Check if migrations directory exists and contains files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    try {
      const files = await readdir(migrationsDir);
      console.log('Migrations directory found with files:', files);
    } catch (err) {
      console.error('Migrations directory not found or empty');
      console.error('Please run: npm run db:generate');
      process.exit(1);
    }

    // Run migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');

    // Verify tables exist by checking a few key tables
    console.log('Verifying database tables...');
    const tablesExist = await checkTablesExist();
    if (tablesExist) {
      console.log('Database tables verified successfully');
    } else {
      console.error('Tables not created by migrations');
      process.exit(1);
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function checkTablesExist() {
  const client = await pool.connect();
  try {
    // Check multiple key tables
    const results = await Promise.all([
      client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'posts'
        );
      `),
      client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `)
    ]);

    return results.every(result => result.rows[0].exists);
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  } finally {
    client.release();
  }
}

initializeDb();