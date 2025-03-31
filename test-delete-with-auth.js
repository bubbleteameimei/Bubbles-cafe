/**
 * Test Delete Functionality with Authentication
 * 
 * This script tests the delete post endpoint with authentication.
 */
import fetch from 'node-fetch';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

async function testDeleteWithAuth() {
  console.log('Starting delete test with authentication...');
  
  try {
    // Create a database connection for direct operations
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 1. Create a test post directly in the database
    console.log('Creating test post in database...');
    const insertResult = await pool.query(
      `INSERT INTO posts (title, content, slug, "authorId", "themeCategory", "isSecret", "matureContent", metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, title, slug`,
      [
        'API Delete Test Post', 
        'This is a test post that will be deleted through the API.',
        'api-delete-test-post-' + Date.now(),
        1, // Admin user
        'HORROR',
        false,
        false,
        JSON.stringify({
          isCommunityPost: false,
          isAdminPost: true
        })
      ]
    );
    
    if (insertResult.rows.length === 0) {
      throw new Error('Failed to create test post');
    }
    
    const testPost = insertResult.rows[0];
    console.log(`Created test post with ID: ${testPost.id}, Title: "${testPost.title}", Slug: "${testPost.slug}"`);
    
    // 2. Login to get a session cookie
    console.log('Logging in as admin to get authenticated session...');
    const adminLoginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'  // Update with actual admin password
      }),
      redirect: 'manual'
    });
    
    if (!adminLoginResponse.ok) {
      const responseBody = await adminLoginResponse.text();
      throw new Error(`Failed to login: ${adminLoginResponse.status} ${adminLoginResponse.statusText}\n${responseBody}`);
    }
    
    // Extract session cookie
    const cookies = adminLoginResponse.headers.get('set-cookie');
    if (!cookies) {
      throw new Error('No cookies returned from login');
    }
    
    console.log('Successfully logged in, got session cookie');
    
    // 3. Get CSRF token
    console.log('Fetching CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/csrf-token', {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!csrfResponse.ok) {
      throw new Error(`Failed to get CSRF token: ${csrfResponse.status} ${csrfResponse.statusText}`);
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    
    if (!csrfToken) {
      throw new Error('No CSRF token found in response');
    }
    
    console.log(`Got CSRF token: ${csrfToken}`);
    
    // 4. Delete the post through the API
    console.log(`Deleting post with ID ${testPost.id} through API...`);
    const deleteResponse = await fetch(`http://localhost:3000/api/posts/${testPost.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      }
    });
    
    const deleteResponseBody = await deleteResponse.text();
    
    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete post: ${deleteResponse.status} ${deleteResponse.statusText}\n${deleteResponseBody}`);
    }
    
    console.log(`API delete response: ${deleteResponseBody}`);
    
    // 5. Verify the post was deleted
    const verifyDeleteResult = await pool.query(
      'SELECT id FROM posts WHERE id = $1',
      [testPost.id]
    );
    
    if (verifyDeleteResult.rows.length > 0) {
      throw new Error(`Post with ID ${testPost.id} still exists after deletion`);
    }
    
    console.log(`Verified post with ID ${testPost.id} was successfully deleted through the API`);
    console.log('Delete with authentication test completed successfully!');
    
    // Close the connection
    await pool.end();
    
  } catch (error) {
    console.error('Error in delete with auth test:', error);
  }
}

testDeleteWithAuth();