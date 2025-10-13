import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from '../shared/schema';
import bcrypt from 'bcryptjs';

async function setupDatabase() {
  console.log('🚀 Starting complete database setup...');
  
  try {
    // First, try to get DATABASE_URL from environment
    let databaseUrl = process.env.DATABASE_URL;
    
    // If DATABASE_URL is not set, construct it from individual components
    if (!databaseUrl || databaseUrl.trim() === '') {
      const pgHost = process.env.PGHOST;
      const pgPort = process.env.PGPORT || '5432';
      const pgUser = process.env.PGUSER;
      const pgPassword = process.env.PGPASSWORD;
      const pgDatabase = process.env.PGDATABASE;
      
      if (pgHost && pgUser && pgDatabase) {
        databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}`;
        console.log('✅ Constructed DATABASE_URL from environment variables');
      } else {
        console.error('❌ No DATABASE_URL found and cannot construct from components');
        console.log('Available environment variables:', {
          PGHOST: pgHost ? 'set' : 'not set',
          PGPORT: pgPort ? 'set' : 'not set',
          PGUSER: pgUser ? 'set' : 'not set',
          PGPASSWORD: pgPassword ? 'set' : 'not set',
          PGDATABASE: pgDatabase ? 'set' : 'not set'
        });
        process.exit(1);
      }
    }
    
    console.log('🔌 Connecting to database...');
    
    // Create connection pool using node-postgres
    const useSSL = (databaseUrl || '').toLowerCase().includes('sslmode=require');
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined
    });
    const db = drizzle(pool, { schema });
    
    // Test the connection
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');
    
    // Create necessary extensions
    console.log('🔧 Setting up database extensions...');
    try {
      await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.log('✅ UUID extension created');
    } catch (error) {
      console.log('ℹ️  UUID extension already exists or not needed');
    }
    
    // Skip admin user creation. Verify presence only.
    console.log('👤 Verifying admin user presence...');
    try {
      const existingAdmin = await db.select()
        .from(schema.users)
        .where(sql`is_admin = true`)
        .limit(1);
      if (existingAdmin.length === 0) {
        console.log('⚠️ No admin user found. Please create one securely via a controlled process.');
      } else {
        console.log('✅ Admin user exists');
      }
    } catch (error) {
      console.error('⚠️  Error verifying admin user:', error);
    }
    
    // Create basic site settings
    console.log('⚙️  Setting up site settings...');
    try {
      const existingSettings = await db.select()
        .from(schema.siteSettings)
        .where(sql`key = 'site_name'`)
        .limit(1);
      
      if (existingSettings.length === 0) {
        await db.insert(schema.siteSettings).values([
          {
            key: 'site_name',
            value: 'Interactive Storytelling Platform',
            category: 'general',
            description: 'The name of the website'
          },
          {
            key: 'site_description',
            value: 'A modern platform for interactive storytelling',
            category: 'general',
            description: 'Site description for SEO'
          },
          {
            key: 'wordpress_sync_enabled',
            value: 'true',
            category: 'sync',
            description: 'Enable WordPress content synchronization'
          },
          {
            key: 'wordpress_api_url',
            value: 'https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts',
            category: 'sync',
            description: 'WordPress API endpoint for content sync'
          }
        ]);
        console.log('✅ Site settings created');
      } else {
        console.log('✅ Site settings already exist');
      }
    } catch (error) {
      console.error('⚠️  Error setting up site settings:', error);
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Set up periodic WordPress sync
    console.log('🔄 Setting up WordPress content sync...');
    try {
      const { seedDatabase } = await import('../server/seed');
      await seedDatabase();
      console.log('✅ WordPress content sync completed');
    } catch (error) {
      console.error('⚠️  Error during WordPress sync:', error);
    }
    
    await pool.end();
    console.log('✅ Database connection closed');
    
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