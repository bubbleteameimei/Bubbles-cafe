
import { pool, db } from '../server/db';
import { users, posts } from '../shared/schema';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { readdir } from 'fs/promises';
import path from 'path';

async function initializeDb() {
  console.log('Starting database initialization...');
  
  try {
    // Check if migrations directory exists
    const migrationsDir = path.join(process.cwd(), 'migrations');
    try {
      await readdir(migrationsDir);
      console.log('Migrations directory found');
    } catch (err) {
      console.error('Migrations directory not found, running drizzle-kit generate');
      console.error('Please run: npm run db:generate');
      process.exit(1);
    }
    
    // Run migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migrations completed successfully');
    
    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (tablesExist) {
      console.log('Database tables already exist');
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
    const { rows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'posts'
      );
    `);
    return rows[0].exists;
  } finally {
    client.release();
  }
}

initializeDb();
