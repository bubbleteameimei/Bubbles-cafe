const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString
});

async function fixWordPressPosts() {
  try {
    await client.connect();
    console.log('Fixing WordPress posts and admin configuration...\n');
    
    // 1. First, ensure vantalison@gmail.com is the only admin
    console.log('1. Setting up admin user...');
    
    // Remove admin privileges from other users
    const removedAdmins = await client.query(`
      UPDATE users SET is_admin = false 
      WHERE email != 'vantalison@gmail.com' AND is_admin = true
      RETURNING email
    `);
    
    if (removedAdmins.rows.length > 0) {
      console.log(`Removed admin privileges from: ${removedAdmins.rows.map(u => u.email).join(', ')}`);
    }
    
    // Get or create vantalison@gmail.com admin
    const existingAdmin = await client.query(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE email = 'vantalison@gmail.com'
      LIMIT 1
    `);
    
    let adminId;
    if (existingAdmin.rows.length > 0) {
      adminId = existingAdmin.rows[0].id;
      const hashedPassword = await bcrypt.hash("admin124", 12);
      await client.query(`
        UPDATE users SET is_admin = true, username = 'vantalison', password_hash = $1
        WHERE email = 'vantalison@gmail.com'
      `, [hashedPassword]);
      console.log(`Updated admin user vantalison@gmail.com (ID: ${adminId})`);
    } else {
      const hashedPassword = await bcrypt.hash("admin124", 12);
      const newAdmin = await client.query(`
        INSERT INTO users (username, email, password_hash, is_admin, created_at)
        VALUES ('vantalison', 'vantalison@gmail.com', $1, true, NOW())
        RETURNING id
      `, [hashedPassword]);
      adminId = newAdmin.rows[0].id;
      console.log(`Created admin user vantalison@gmail.com (ID: ${adminId})`);
    }
    
    // 2. Fix all WordPress posts
    console.log('\n2. Fixing WordPress posts...');
    
    // Get all posts that are from WordPress (have wordpress metadata or specific patterns)
    const wordpressPosts = await client.query(`
      SELECT id, title, author_id, "isAdminPost", metadata
      FROM posts 
      WHERE 
        metadata::text LIKE '%wordpress%' OR 
        metadata::text LIKE '%importSource%' OR
        slug IN ('blood', 'word', 'hunger', 'song', 'journal', 'nostalgia', 'cave', 'therapist', 'bleach', 'machine', 'bug', 'drive', 'mirror', 'car', 'doll', 'cookbook', 'skin', 'tunnel', 'chase', 'descent', 'rain')
    `);
    
    console.log(`Found ${wordpressPosts.rows.length} WordPress posts to fix`);
    
    // Update each WordPress post
    for (const post of wordpressPosts.rows) {
      const currentMetadata = post.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        isWordPressPost: true,
        excludeFromCommunity: true,
        source: 'wordpress_api',
        lastUpdated: new Date().toISOString()
      };
      
      await client.query(`
        UPDATE posts SET
          "isAdminPost" = true,
          author_id = $1,
          metadata = $2
        WHERE id = $3
      `, [adminId, JSON.stringify(updatedMetadata), post.id]);
      
      console.log(`Fixed post: "${post.title}" (ID: ${post.id})`);
    }
    
    // 3. Verify the changes
    console.log('\n3. Verification...');
    
    const adminPostCount = await client.query(`
      SELECT COUNT(*) as count FROM posts WHERE "isAdminPost" = true
    `);
    
    const wordpressPostCount = await client.query(`
      SELECT COUNT(*) as count FROM posts 
      WHERE metadata::text LIKE '%isWordPressPost%'
    `);
    
    const communityPostCount = await client.query(`
      SELECT COUNT(*) as count FROM posts 
      WHERE "isAdminPost" = false OR "isAdminPost" IS NULL
    `);
    
    console.log(`\nSummary:`);
    console.log(`- Admin posts: ${adminPostCount.rows[0].count}`);
    console.log(`- WordPress posts: ${wordpressPostCount.rows[0].count}`);
    console.log(`- Community posts: ${communityPostCount.rows[0].count}`);
    console.log(`- Admin user: vantalison@gmail.com (ID: ${adminId})`);
    
    console.log('\n✅ WordPress posts fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing WordPress posts:', error.message);
  } finally {
    await client.end();
  }
}

fixWordPressPosts();