/**
 * Comment Functionality Test Script
 * 
 * This script tests the comment functionality after our schema changes from 'approved' to 'is_approved'
 */

import fetch from 'node-fetch';

async function testCommentCreation() {
  console.log('Testing comment creation...');
  
  try {
    // Create a test comment
    const commentData = {
      content: 'This is a test comment created to verify schema changes.',
      postId: 1, // Use a known post ID
      userId: null, // Anonymous comment
      metadata: {
        author: 'Test User',
        isAnonymous: true
      }
    };

    // Send the comment creation request
    const response = await fetch('http://localhost:3001/api/posts/1/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating comment:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Comment created successfully:', result);
    console.log('is_approved value:', result.is_approved);
    
    // Test if comment can be retrieved
    const getResponse = await fetch(`http://localhost:3001/api/posts/1/comments`);
    const comments = await getResponse.json();
    
    console.log(`Retrieved ${comments.length} comments`);
    
    return true;
  } catch (error) {
    console.error('Test error:', error);
    return false;
  }
}

async function runTests() {
  console.log('Starting comment functionality tests...');
  
  const commentCreationResult = await testCommentCreation();
  
  console.log('\nTest Summary:');
  console.log(`Comment Creation: ${commentCreationResult ? '✅ PASSED' : '❌ FAILED'}`);
}

runTests().catch(console.error);