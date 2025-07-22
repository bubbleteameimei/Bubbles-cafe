/**
 * Fix WordPress post flags in the database
 * Update all WordPress-imported posts to be admin posts, not community posts
 */
import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function fixWordPressFlags() {
  console.log('Starting WordPress flags fix...');
  
  try {
    // Update all posts that have WordPress metadata to be admin posts
    const result = await db.execute(sql`
      UPDATE posts 
      SET "isAdminPost" = true, 
          "isCommunityPost" = false 
      WHERE metadata->>'wordpressId' IS NOT NULL
         OR metadata->>'importSource' = 'wordpress-api'
         OR metadata->>'source' = 'wordpress_api'
    `);
    
    console.log(`Updated ${result.rowCount} WordPress posts to admin posts`);
    
    // Verify the changes
    const verification = await db.execute(sql`
      SELECT 
        id, 
        title, 
        "isAdminPost", 
        "isCommunityPost",
        metadata->>'wordpressId' as wordpress_id,
        metadata->>'importSource' as import_source
      FROM posts 
      WHERE metadata->>'wordpressId' IS NOT NULL 
      LIMIT 5
    `);
    
    console.log('\nVerification - First 5 WordPress posts:');
    verification.rows.forEach(row => {
      console.log(`- ID: ${row.id}, Title: ${row.title}, isAdmin: ${row.isAdminPost}, isCommunity: ${row.isCommunityPost}, WP ID: ${row.wordpress_id}`);
    });
    
    console.log('\n✅ WordPress flags fix completed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing WordPress flags:', error);
    throw error;
  }
}

fixWordPressFlags()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });