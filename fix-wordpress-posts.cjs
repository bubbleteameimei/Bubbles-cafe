const { Client } = require('pg');


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
    
    // 1. Verify an admin user exists (do not create or modify users)
    console.log('1. Verifying admin user presence...');
    const existingAdmin = await client.query(`
      SELECT id, username, email, is_admin
      FROM users
      WHERE is_admin = true
      LIMIT 1
    `);
    if (existingAdmin.rows.length === 0) {
      throw new Error('No admin user found. Please create one securely before running fixes.');
    }
    const adminId = existingAdmin.rows[0].id;
    
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