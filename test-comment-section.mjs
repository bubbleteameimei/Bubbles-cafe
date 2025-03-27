/**
 * Test script for comment section
 */

import fetch from 'node-fetch';

async function testCommentSection() {
  try {
    console.log('Testing comment section functionality...');
    
    // 1. Test the health endpoint
    console.log('\n1. Testing API health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('Health status:', healthResponse.status);
    console.log('Health data:', healthData);
    
    // 2. Check if comments endpoint exists
    console.log('\n2. Testing comments endpoint...');
    try {
      const commentsResponse = await fetch('http://localhost:3001/api/comments?postId=1');
      const commentsData = await commentsResponse.json();
      console.log('Comments endpoint status:', commentsResponse.status);
      console.log(`Found ${commentsData.length || 0} comments`);
      
      // Log a few comments for inspection
      if (commentsData && commentsData.length > 0) {
        console.log('\nSample comments:');
        for (let i = 0; i < Math.min(commentsData.length, 3); i++) {
          const comment = commentsData[i];
          console.log(`- Comment #${i+1}: "${comment.content.substring(0, 30)}..." by ${comment.authorName || 'Anonymous'}`);
        }
      } else {
        console.log('No comments found for post ID 1.');
      }
    } catch (err) {
      console.log('Error fetching comments:', err.message);
    }
    
    // 3. Test posting a comment
    console.log('\n3. Testing comment submission...');
    
    // We won't actually post a comment as it would modify the database
    console.log('Note: Comment submission test is skipped to avoid modifying database.');
    console.log('To test manually:');
    console.log('- Go to a story page with comments enabled');
    console.log('- Try posting a comment as an anonymous user');
    console.log('- Try posting a comment as a logged-in user');
    
    console.log('\nTest completed.');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testCommentSection().catch(console.error);