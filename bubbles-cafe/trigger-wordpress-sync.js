/**
 * Trigger WordPress sync using direct database calls
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// WordPress API endpoint
const WP_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';

async function triggerWordPressSync() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting WordPress sync...');
    
    // Get or create admin user
    let adminUser;
    const adminQuery = await pool.query(`
      SELECT id FROM users WHERE username = 'admin' LIMIT 1
    `);
    
    if (adminQuery.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await pool.query(`
        INSERT INTO users (username, email, password_hash, is_admin, created_at)
        VALUES ('admin', 'admin@example.com', $1, true, NOW())
        RETURNING id
      `, [hashedPassword]);
      adminUser = newAdmin.rows[0];
      console.log('Created admin user');
    } else {
      adminUser = adminQuery.rows[0];
      console.log('Found existing admin user');
    }
    
    // Fetch WordPress posts
    console.log('Fetching WordPress posts...');
    const response = await fetch(`${WP_API_URL}/posts?per_page=20`);
    
    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }
    
    const wpPosts = await response.json();
    console.log(`Retrieved ${wpPosts.length} posts from WordPress`);
    
    let created = 0;
    let updated = 0;
    
    // Process each post
    for (const wpPost of wpPosts) {
      try {
        const title = wpPost.title.rendered;
        const content = wpPost.content.rendered.replace(/<[^>]+>/g, ''); // Strip HTML
        const excerpt = wpPost.excerpt?.rendered 
          ? wpPost.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 200) + '...'
          : content.substring(0, 200) + '...';
        const slug = wpPost.slug;
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);
        
        // Check if post exists
        const existingPost = await pool.query(`
          SELECT id FROM posts WHERE slug = $1
        `, [slug]);
        
        if (existingPost.rows.length === 0) {
          // Create new post
          await pool.query(`
            INSERT INTO posts (
              title, content, excerpt, slug, author_id, 
              is_secret, "isAdminPost", created_at, mature_content, 
              reading_time_minutes, wordpress_id, wordpress_date,
              word_count, reading_time, is_published
            ) VALUES (
              $1, $2, $3, $4, $5, 
              false, false, NOW(), false, 
              $6, $7, $8,
              $9, $10, true
            )
          `, [
            title, content, excerpt, slug, adminUser.id,
            readingTime, wpPost.id, wpPost.date,
            wordCount, readingTime
          ]);
          created++;
          console.log(`Created post: ${title}`);
        } else {
          // Update existing post
          await pool.query(`
            UPDATE posts SET 
              title = $1, content = $2, excerpt = $3,
              reading_time_minutes = $4, wordpress_date = $5,
              word_count = $6, reading_time = $7
            WHERE slug = $8
          `, [
            title, content, excerpt, readingTime, wpPost.date,
            wordCount, readingTime, slug
          ]);
          updated++;
          console.log(`Updated post: ${title}`);
        }
      } catch (error) {
        console.error(`Error processing post "${wpPost.title.rendered}":`, error.message);
      }
    }
    
    console.log(`WordPress sync completed! Created: ${created}, Updated: ${updated}`);
    return { created, updated };
    
  } finally {
    await pool.end();
  }
}

// Run the sync
triggerWordPressSync()
  .then(result => {
    console.log('Sync completed:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Sync failed:', error);
    process.exit(1);
  });