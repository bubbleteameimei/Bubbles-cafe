// Simple script to check for the redirect logic in feedback.tsx

import fs from 'fs';

try {
  const feedbackCode = fs.readFileSync('./client/src/pages/feedback.tsx', 'utf8');
  
  // Look for redirect pattern
  if (feedbackCode.includes('if (!isAuthenticated)') && 
      feedbackCode.includes('return <Redirect to="/login?redirect=/feedback"')) {
    console.log('✅ SUCCESS: Feedback page includes redirect logic to login page.');
    console.log('The non-authenticated users will be redirected to login page with the correct redirect parameter.');
  } else {
    console.log('❌ FAIL: Could not find expected redirect logic in feedback.tsx');
  }
} catch (error) {
  console.error('Error reading feedback.tsx:', error);
}