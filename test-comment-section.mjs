import fetch from 'node-fetch';
import { exec } from 'child_process';

async function testCommentSection() {
  try {
    // Test API endpoint
    console.log('Testing comment section API...');
    const response = await fetch('http://localhost:3001/api/posts/6/comments');
    
    if (response.ok) {
      const comments = await response.json();
      console.log(`Successfully retrieved ${comments.length} comments for post 6`);
      console.log('Sample comment:', JSON.stringify(comments[0], null, 2));
      
      // Check approval field
      if (comments.length > 0) {
        const firstComment = comments[0];
        console.log('First comment approval status:');
        console.log('- approved field:', firstComment.approved);
        console.log('- is_approved field:', firstComment.is_approved);
        
        // Verify our helper function logic
        const isApproved = firstComment.approved === true || firstComment.is_approved === true;
        console.log('Would be shown by our helper function:', isApproved);
      }
    } else {
      console.error('Failed to fetch comments:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error running comment section test:', error);
  }
}

testCommentSection();
