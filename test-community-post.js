/**
 * Simple test script to validate a community post submission with simplified theme categories
 */

import fetch from 'node-fetch';

async function testCommunityPost() {
  console.log('Testing community post submission with simplified theme category...');
  
  const postData = {
    title: 'Test Story With Simplified Category',
    content: 'This is a test story with a simplified themeCategory. It needs to be at least 25 characters long to meet the validation requirements.',
    themeCategory: 'APOCALYPTIC', // Using one of our simplified categories
    slug: 'test-story-simplified-' + Date.now().toString().slice(-4),
    excerpt: 'This is a test excerpt for a story with simplified categories',
    authorId: 1,
    metadata: {
      isCommunityPost: true,
      isAdminPost: false,
      status: 'publish',
      themeCategory: 'APOCALYPTIC'
    }
  };
  
  try {
    console.log('Submitting test post with category:', postData.themeCategory);
    
    const response = await fetch('http://localhost:3000/api/posts/community', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });
    
    // Get the response as JSON if possible
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }
    
    if (response.ok) {
      console.log('✅ Post created successfully:', responseData);
      
      // Check if the simplified category was saved correctly
      if (responseData.metadata?.themeCategory === 'APOCALYPTIC') {
        console.log('✅ Simplified category was correctly saved in the post metadata!');
      } else {
        console.log('❌ Category was not saved correctly:', responseData.metadata?.themeCategory);
      }
      
      return true;
    } else {
      console.error('❌ Failed to create post:', responseData);
      return false;
    }
  } catch (error) {
    console.error('Error while testing community post submission:', error);
    return false;
  }
}

testCommunityPost();