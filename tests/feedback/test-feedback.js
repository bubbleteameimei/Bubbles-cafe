// Test script for the feedback API
import fetch from 'node-fetch';

async function testFeedbackSubmission() {
  console.log('Testing feedback submission...');
  
  const feedbackData = {
    type: 'bug',
    content: 'This is a test feedback for bug reporting',
    // rating field removed
    page: '/test-page',
    category: 'bug',
    browser: 'Chrome',
    operatingSystem: 'Windows',
    screenResolution: '1920x1080',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    metadata: {
      name: 'Test User',
      email: 'test@example.com'
    }
  };

  try {
    console.log('Submitting feedback data:', JSON.stringify(feedbackData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(feedbackData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Feedback submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Error submitting feedback:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception when submitting feedback:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testFeedbackSubmission().then(result => {
  console.log(`Test ${result.success ? 'PASSED' : 'FAILED'}`);
  if (!result.success) {
    console.error('Test failed with error:', result.error);
    process.exit(1);
  }
});