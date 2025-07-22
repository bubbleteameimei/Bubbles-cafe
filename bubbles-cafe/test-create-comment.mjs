import fetch from 'node-fetch';

async function testCreateComment() {
  try {
    // Test comment creation
    console.log('Testing comment creation API...');
    
    const newComment = {
      content: "This is a test comment " + new Date().toISOString(),
      author: "TestUser"
    };
    
    const response = await fetch('http://localhost:3001/api/posts/6/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Successfully created comment:');
      console.log(JSON.stringify(result, null, 2));
      
      // Check approval field names
      console.log('Approval field check:');
      console.log('- approved field:', result.approved);
      console.log('- is_approved field:', result.is_approved);
      
      // Verify our helper function logic would work
      const isApproved = result.approved === true || result.is_approved === true;
      console.log('Would be shown by our helper function:', isApproved);
    } else {
      console.error('Failed to create comment:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('Error running comment creation test:', error);
  }
}

testCreateComment();
