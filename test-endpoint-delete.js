/**
 * Test Delete Post Endpoint
 * 
 * This script tests the API endpoint for deleting posts.
 */

import fetch from 'node-fetch';

async function testDeleteEndpoint() {
  try {
    console.log('Testing post delete endpoint...');
    
    // Test unauthorized access first
    console.log('\nTesting without authentication:');
    // Using the Replit environment URL
    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
      : 'http://localhost:3000';
    console.log(`Using API URL: ${baseUrl}/api/posts/27`);
    const unauthorizedResponse = await fetch(`${baseUrl}/api/posts/27`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${unauthorizedResponse.status}`);
    console.log('Response:', await unauthorizedResponse.text());
    
    // Next, we'd ideally test with authentication but that would require getting a valid session
    // which would involve logging in. For testing purposes, we can use the SQL-based test instead.
    console.log('\nNote: To test deletion with proper authentication, you would need to:');
    console.log('1. Log in through the application to get a valid session');
    console.log('2. Use the browser to make the delete request with proper authorization');
    
    // Optional: Test with credentials if available
    // This would require a valid session cookie
    
  } catch (error) {
    console.error('Error testing delete endpoint:', error);
  }
}

testDeleteEndpoint();