// Comprehensive feedback testing script to validate the entire feedback system

const URL_BASE = 'http://localhost:3000';

// Test feedback submission with missing fields
async function testInvalidFeedback() {
  console.log('Testing feedback validation...');
  
  const incompleteData = {
    // Missing 'type' - required field
    content: 'This is test feedback without a type'
  };
  
  try {
    console.log('Submitting incomplete feedback:', JSON.stringify(incompleteData, null, 2));
    
    const response = await fetch(`${URL_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(incompleteData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.error('Validation error: Incomplete feedback was accepted!');
      return { success: false, data: result };
    } else {
      const errorData = await response.json();
      console.log('Validation worked: Server correctly rejected incomplete feedback');
      console.log('Error response:', JSON.stringify(errorData, null, 2));
      return { success: true, error: errorData };
    }
  } catch (error) {
    console.error('Exception during validation test:', error);
    return { success: false, error: error.message };
  }
}

// Test feedback with minimum required fields
async function testMinimalFeedback() {
  console.log('Testing minimal valid feedback...');
  
  const minimalData = {
    type: 'general',
    content: 'This is minimal test feedback with only required fields'
  };
  
  try {
    console.log('Submitting minimal feedback:', JSON.stringify(minimalData, null, 2));
    
    const response = await fetch(`${URL_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Minimal feedback accepted successfully');
      console.log('Response:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Error submitting minimal feedback:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception during minimal feedback test:', error);
    return { success: false, error: error.message };
  }
}

// Test feedback with all possible fields
async function testCompleteFeedback() {
  console.log('Testing complete feedback submission...');
  
  const completeData = {
    type: 'feature',
    content: 'This is a comprehensive test of the feedback system with all fields',
    // rating field removed
    page: '/test-complete-feedback',
    category: 'enhancement',
    browser: 'Mozilla Firefox',
    operatingSystem: 'macOS',
    screenResolution: '2560x1440',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
    metadata: {
      name: 'Complete Test',
      email: 'complete@test.com',
      additionalInfo: 'This is a test of all fields'
    }
  };
  
  try {
    console.log('Submitting complete feedback data:', JSON.stringify(completeData, null, 2));
    
    const response = await fetch(`${URL_BASE}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(completeData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Complete feedback submitted successfully!');
      console.log('Response:', JSON.stringify(result, null, 2));
      return { success: true, data: result };
    } else {
      const errorData = await response.json();
      console.error('Error submitting complete feedback:', errorData);
      return { success: false, error: errorData };
    }
  } catch (error) {
    console.error('Exception when submitting complete feedback:', error);
    return { success: false, error: error.message };
  }
}

// Run all the tests
async function runTests() {
  console.log('=== Starting Feedback Validation Tests ===');
  
  // Test 1: Invalid feedback (missing required fields)
  const invalidTest = await testInvalidFeedback();
  
  // Test 2: Minimal valid feedback
  const minimalTest = await testMinimalFeedback();
  
  // Test 3: Complete feedback with all fields
  const completeTest = await testCompleteFeedback();
  
  // Check if all tests succeeded  
  const allPassed = 
    (invalidTest.success === true) && 
    (minimalTest.success === true) && 
    (completeTest.success === true);
  
  console.log('=== Feedback Validation Tests Complete ===');
  console.log(`Overall test result: ${allPassed ? 'PASSED' : 'FAILED'}`);
  
  return {
    passed: allPassed,
    invalidTest,
    minimalTest,
    completeTest
  };
}

// Execute all tests
runTests().then(results => {
  if (!results.passed) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('All tests passed successfully!');
  }
});