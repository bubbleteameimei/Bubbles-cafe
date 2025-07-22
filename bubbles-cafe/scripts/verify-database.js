/**
 * Database Verification Script
 * Uses the same connection method as the server
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not found");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function verifyDatabase() {
  try {
    console.log('Verifying database connection and tables...');
    
    // Test connection
    const versionResult = await pool.query('SELECT version()');
    console.log('✅ Database connected successfully');
    
    // List all tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', tables.join(', '));
    
    // Check posts table
    if (tables.includes('posts')) {
      const postCount = await pool.query('SELECT COUNT(*) FROM posts');
      console.log('📊 Posts in database:', postCount.rows[0].count);
      
      // Show recent posts
      const recentPosts = await pool.query('SELECT title, theme_category, created_at FROM posts ORDER BY created_at DESC LIMIT 5');
      console.log('📝 Recent posts:');
      recentPosts.rows.forEach(post => {
        console.log(`  - ${post.title} (${post.theme_category || 'No category'})`);
      });
    }
    
    // Check users table
    if (tables.includes('users')) {
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log('👥 Users in database:', userCount.rows[0].count);
      
      const adminUsers = await pool.query('SELECT username, email FROM users WHERE is_admin = true');
      console.log('🔑 Admin users:', adminUsers.rows.length);
      adminUsers.rows.forEach(admin => {
        console.log(`  - ${admin.username} (${admin.email})`);
      });
    }
    
    // Verify required tables exist
    const requiredTables = ['users', 'posts', 'comments', 'bookmarks', 'sessions'];
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing required tables:', missingTables.join(', '));
    } else {
      console.log('✅ All required tables exist');
    }
    
    console.log('✅ Database verification completed');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyDatabase();