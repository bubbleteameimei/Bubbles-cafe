import fetch from 'node-fetch';

async function testCSRFProtectionForComments() {
  try {
    console.log('Testing CSRF protection in comment system...');
    
    // First, get a CSRF token from the health endpoint
    console.log('Step 1: Getting CSRF token from health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/health', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!healthResponse.ok) {
      throw new Error(`Failed to get health status: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('Health endpoint response:', healthData);
    
    if (!healthData.csrfToken) {
      throw new Error('No CSRF token provided in health response');
    }
    
    const csrfToken = healthData.csrfToken;
    console.log('CSRF token received:', csrfToken);
    
    // Now try to post a comment with the CSRF token
    console.log('\nStep 2: Posting a comment with valid CSRF token...');
    const commentWithToken = await fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        postId: 1,
        content: 'This is a test comment with CSRF token',
        name: 'Test User',
        parent_id: null,
        metadata: {
          author: 'Test User',
          upvotes: 0,
          isAnonymous: true,
          originalContent: 'This is a test comment with CSRF token'
        }
      })
    });
    
    console.log('Response status:', commentWithToken.status);
    
    if (commentWithToken.ok) {
      const commentData = await commentWithToken.json();
      console.log('Comment posted successfully:', commentData);
    } else {
      const errorText = await commentWithToken.text();
      console.error('Failed to post comment with token:', errorText);
    }
    
    // Try posting a comment without the CSRF token
    console.log('\nStep 3: Posting a comment without CSRF token (should fail)...');
    const commentWithoutToken = await fetch('http://localhost:3001/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        postId: 1,
        content: 'This is a test comment without CSRF token',
        name: 'Test User',
        parent_id: null,
        metadata: {
          author: 'Test User',
          upvotes: 0,
          isAnonymous: true,
          originalContent: 'This is a test comment without CSRF token'
        }
      })
    });
    
    console.log('Response status:', commentWithoutToken.status);
    
    if (commentWithoutToken.ok) {
      const commentData = await commentWithoutToken.json();
      console.log('Comment posted without token (unexpected):', commentData);
    } else {
      const errorText = await commentWithoutToken.text();
      console.error('Failed to post comment without token (expected):', errorText);
    }
    
    console.log('\nCSRF protection test completed');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testCSRFProtectionForComments();