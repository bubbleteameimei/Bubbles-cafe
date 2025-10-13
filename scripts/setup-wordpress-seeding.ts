/**
 * WordPress Content Seeding Setup
 * Ensures the DB is ready for WordPress sync and basic settings exist.
 */
import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const useSSL = (() => {
  try {
    const u = new URL(process.env.DATABASE_URL || '');
    return u.hostname.endsWith('supabase.co') || (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require');
  } catch {
    return (process.env.DATABASE_URL || '').toLowerCase().includes('sslmode=require');
  }
})();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined
});

async function setupWordPressSeeding() {
  console.log('🔄 Setting up WordPress content seeding...');
  
  try {
    // Verify database connection
    const result = await pool.query('SELECT current_database()');
    console.log('✅ Connected to database:', result.rows[0].current_database);
    
    // Verify admin user presence
    const adminCheck = await pool.query('SELECT id, username, email FROM users WHERE is_admin = true LIMIT 1');
    if (adminCheck.rows.length === 0) {
      console.log('⚠️ No admin user found. Please create one securely via a controlled process.');
    } else {
      console.log('✅ Admin user exists:', adminCheck.rows[0]);
    }
    
    // Check current posts count
    const postsCount = await pool.query('SELECT COUNT(*) as count FROM posts');
    console.log('📊 Current posts in database:', postsCount.rows[0].count);
    
    // Check for WordPress API connectivity
    console.log('🌐 Testing WordPress API connectivity...');
    try {
      const response = await fetch('https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=1');
      if (response.ok) {
        const posts = await response.json();
        console.log('✅ WordPress API is accessible, found posts:', posts.length);
      } else {
        console.log('⚠️ WordPress API returned status:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ WordPress API connection issue:', (apiError as any)?.message || String(apiError));
    }
    
    // Verify site settings for WordPress sync (category: 'sync')
    console.log('⚙️ Checking site settings...');
    const settingsCheck = await pool.query(`
      SELECT key, value FROM site_settings 
      WHERE category IN ('sync', 'wordpress') 
      ORDER BY key
    `);
    
    if (settingsCheck.rows.length === 0) {
      console.log('Setting up WordPress sync configuration...');
      await pool.query(`
        INSERT INTO site_settings (key, value, category, description, updated_at)
        VALUES 
        ('wordpress_api_url', 'https://bubbleteameimei.wordpress.com/wp-json/wp/v2/posts', 'sync', 'WordPress API endpoint for content sync', NOW()),
        ('wordpress_sync_enabled', 'true', 'sync', 'Enable automatic WordPress content sync', NOW()),
        ('wordpress_sync_interval', '300000', 'sync', 'WordPress sync interval in milliseconds (5 minutes)', NOW()),
        ('last_wordpress_sync', '0', 'sync', 'Timestamp of last successful WordPress sync', NOW())
        ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
      `);
      console.log('✅ WordPress sync settings configured');
    } else {
      console.log('✅ WordPress sync settings exist:', settingsCheck.rows.length);
    }
    
    // Verify analytics table exists for tracking (created in schema)
    console.log('📈 Verifying analytics table...');
    const analyticsCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'analytics'
    `);
    
    if (analyticsCheck.rows[0].count === '0') {
      console.log('Creating analytics table...');
      await pool.query(`
        CREATE TABLE analytics (
          id SERIAL PRIMARY KEY,
          post_id INTEGER NOT NULL REFERENCES posts(id),
          page_views INTEGER DEFAULT 0 NOT NULL,
          unique_visitors INTEGER DEFAULT 0 NOT NULL,
          average_read_time DOUBLE PRECISION DEFAULT 0 NOT NULL,
          bounce_rate DOUBLE PRECISION DEFAULT 0 NOT NULL,
          device_stats JSON DEFAULT '{}' NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
        CREATE INDEX analytics_post_id_idx ON analytics(post_id);
        CREATE INDEX analytics_updated_at_idx ON analytics(updated_at);
      `);
      console.log('✅ Analytics table created');
    } else {
      console.log('✅ Analytics table exists');
    }
    
    // Check if session table exists for express-session store
    console.log('🔐 Verifying session storage...');
    const sessionCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'session'
    `);
    
    if (sessionCheck.rows[0].count === '0') {
      console.log('Creating session table for express-session...');
      await pool.query(`
        CREATE TABLE "session" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        );
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
        CREATE INDEX "IDX_session_expire" ON "session" ("expire");
      `);
      console.log('✅ Session table created');
    } else {
      console.log('✅ Session table exists');
    }
    
    // Final verification of key tables
    console.log('🔍 Final database verification...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'posts', 'comments', 'bookmarks', 'sessions', 'site_settings', 'analytics', 'session')
      ORDER BY table_name
    `);
    
    const requiredTables = ['users', 'posts', 'comments', 'bookmarks', 'sessions', 'site_settings', 'analytics', 'session'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️ Missing required tables:', missingTables.join(', '));
    } else {
      console.log('✅ All required tables exist:', existingTables.join(', '));
    }
    
    console.log('✅ WordPress seeding setup completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Database: Connected and verified`);
    console.log(`   - Posts: ${postsCount.rows[0].count} posts available`);
    console.log(`   - Admin user: ${adminCheck.rows.length > 0 ? 'Ready' : 'Missing'}`);
    console.log(`   - WordPress sync: Configured`);
    console.log(`   - Session store: Ready`);
    console.log(`   - Analytics: Ready`);
    
  } catch (error) {
    console.error('❌ WordPress seeding setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup
setupWordPressSeeding().catch(console.error);