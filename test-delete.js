/**
 * Test Delete Functionality
 * 
 * This script tests the delete post endpoint directly against the database.
 */
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function testDelete() {
  console.log('Starting delete test...');
  
  try {
    // Create a database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Connected to database, creating test post...');
    
    // 1. Create a test post
    const insertResult = await pool.query(
      `INSERT INTO posts (title, content, slug, "authorId", "themeCategory", "isSecret", "matureContent", metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, title, slug`,
      [
        'Test Post for Deletion', 
        'This is a test post that will be deleted.',
        'test-delete-post-' + Date.now(),
        1, // Admin user
        'HORROR',
        false,
        false,
        JSON.stringify({
          isCommunityPost: true,
          isAdminPost: false
        })
      ]
    );
    
    if (insertResult.rows.length === 0) {
      throw new Error('Failed to create test post');
    }
    
    const testPost = insertResult.rows[0];
    console.log(`Created test post with ID: ${testPost.id}, Title: "${testPost.title}", Slug: "${testPost.slug}"`);
    
    // 2. Verify the post exists
    const verifyResult = await pool.query(
      'SELECT id, title FROM posts WHERE id = $1',
      [testPost.id]
    );
    
    if (verifyResult.rows.length === 0) {
      throw new Error(`Post with ID ${testPost.id} was not found after creation`);
    }
    
    console.log(`Verified post exists. Now attempting to delete post with ID: ${testPost.id}`);
    
    // 3. Delete the post
    const deleteResult = await pool.query(
      'DELETE FROM posts WHERE id = $1 RETURNING id, title',
      [testPost.id]
    );
    
    if (deleteResult.rows.length === 0) {
      throw new Error(`Failed to delete post with ID ${testPost.id}`);
    }
    
    console.log(`Successfully deleted post with ID: ${deleteResult.rows[0].id}, Title: "${deleteResult.rows[0].title}"`);
    
    // 4. Verify the post was deleted
    const verifyDeleteResult = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [testPost.id]
    );
    
    if (verifyDeleteResult.rows.length > 0) {
      throw new Error(`Post with ID ${testPost.id} still exists after deletion`);
    }
    
    console.log(`Verified post with ID ${testPost.id} was successfully deleted`);
    console.log('Delete test completed successfully!');
    
    // Close the connection
    await pool.end();
    
  } catch (error) {
    console.error('Error in delete test:', error);
  }
}

testDelete();