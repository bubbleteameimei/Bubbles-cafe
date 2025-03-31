/**
 * Test Delete Post SQL
 * 
 * This script tests deleting a post directly at the database level
 * without requiring authentication.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { postsTable } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function testSqlDelete() {
  try {
    console.log('Testing direct SQL delete functionality...');
    
    // Use the DATABASE_URL from environment
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Connect to the database
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);
    
    const postId = 27; // ID of the test post we created earlier
    
    // First check if the post exists
    console.log(`Checking if post ${postId} exists...`);
    const existingPost = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);
    
    if (existingPost.length === 0) {
      console.log(`Post ${postId} does not exist.`);
      return;
    }
    
    console.log(`Found post: "${existingPost[0].title}"`);
    
    // Delete the post
    console.log(`Deleting post ${postId}...`);
    const deletedPost = await db.delete(postsTable)
      .where(eq(postsTable.id, postId))
      .returning();
    
    console.log('Delete operation completed.');
    console.log('Deleted post:', deletedPost);
    
    // Verify deletion
    console.log(`Verifying post ${postId} has been deleted...`);
    const checkPost = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, postId))
      .limit(1);
    
    if (checkPost.length === 0) {
      console.log(`✅ Post ${postId} successfully deleted!`);
    } else {
      console.log(`❌ Post ${postId} still exists after deletion!`);
    }
    
    // Close the connection
    await client.end();
    
  } catch (error) {
    console.error('Error testing SQL delete:', error);
  }
}

testSqlDelete();