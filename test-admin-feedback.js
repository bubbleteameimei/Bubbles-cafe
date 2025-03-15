// Test script for the admin feedback API functionality

// First, let's simulate a login to get a session cookie
async function loginAsAdmin() {
  console.log('Logging in as admin...');
  
  const credentials = {
    email: 'vantalison@gmail.com',
    password: 'Password123!'  // We'll need to update this with the correct password
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
      credentials: 'include' // Important for cookie session handling
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Login successful!');
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Login failed:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception during login:', error);
    return { success: false, error: error.message };
  }
}

// Get all feedback as admin
async function getAllFeedback() {
  console.log('Fetching all feedback...');
  
  try {
    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Important for cookie session handling
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Retrieved all feedback successfully!');
      console.log(`Retrieved ${result.feedback.length} feedback items`);
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Error retrieving feedback:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception when retrieving feedback:', error);
    return { success: false, error: error.message };
  }
}

// Update feedback status
async function updateFeedbackStatus(feedbackId, newStatus) {
  console.log(`Updating feedback ${feedbackId} status to ${newStatus}...`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus }),
      credentials: 'include' // Important for cookie session handling
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Feedback status updated successfully!');
      console.log('Updated feedback:', JSON.stringify(result.feedback, null, 2));
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Error updating feedback status:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception when updating feedback status:', error);
    return { success: false, error: error.message };
  }
}

// Run the tests
async function runTests() {
  // Step 1: Login
  const loginResult = await loginAsAdmin();
  if (!loginResult.success) {
    console.error('Login failed, cannot proceed with other tests');
    return false;
  }
  
  // Step 2: Get all feedback
  const feedbackResult = await getAllFeedback();
  if (!feedbackResult.success) {
    console.error('Could not retrieve feedback');
    return false;
  }
  
  // Get the first feedback item to update
  if (feedbackResult.data.feedback && feedbackResult.data.feedback.length > 0) {
    const feedbackId = feedbackResult.data.feedback[0].id;
    
    // Step 3: Update feedback status
    const updateResult = await updateFeedbackStatus(feedbackId, 'reviewed');
    if (!updateResult.success) {
      console.error('Could not update feedback status');
      return false;
    }
  } else {
    console.log('No feedback items found to update');
  }
  
  return true;
}

// Execute the test suite
runTests()
  .then(success => {
    console.log(`Overall test ${success ? 'PASSED' : 'FAILED'}`);
    if (!success) {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during tests:', error);
    process.exit(1);
  });