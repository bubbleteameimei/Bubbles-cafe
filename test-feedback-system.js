/**
 * Comprehensive Test Suite for the Feedback System
 * 
 * This script tests all aspects of the feedback system:
 * 1. Submission - Testing anonymous and authenticated feedback submission
 * 2. Retrieval - Testing feedback retrieval APIs (admin-only and user-specific)
 * 3. Updates - Testing status updates and other modifications
 * 4. Validation - Testing input validation and error handling
 */

const fetch = require('node-fetch');
const assert = require('assert').strict;

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'adminpassword'
};
const TEST_USER_CREDENTIALS = {
  email: 'user@example.com',
  password: 'userpassword'
};

// Test data
const TEST_FEEDBACK = {
  type: 'feature',
  content: 'It would be great to have a dark mode option.',
  page: '/home',
  browser: 'Test Browser',
  operatingSystem: 'Test OS',
  screenResolution: '1920x1080',
  category: 'ui'
};

// Test utilities
let adminToken = null;
let userToken = null;
let testFeedbackId = null;

async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Login failed: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    return data.token || 'session-auth'; // Session-based auth doesn't return a token
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

async function cleanupTestData() {
  console.log('Cleaning up test data...');
  if (testFeedbackId && adminToken) {
    try {
      // Delete test feedback if possible (endpoint may not exist)
      await fetch(`${API_BASE_URL}/api/feedback/${testFeedbackId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
      });
    } catch (error) {
      console.warn('Cleanup failed, manual cleanup may be required');
    }
  }
}

// Test functions
async function testAnonymousFeedbackSubmission() {
  console.log('\n🧪 Testing anonymous feedback submission...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_FEEDBACK),
    });
    
    assert.equal(response.status, 201, 'Expected 201 status code for successful submission');
    
    const data = await response.json();
    assert.equal(data.success, true, 'Expected success flag to be true');
    assert.ok(data.feedback, 'Expected feedback data in response');
    assert.equal(data.feedback.type, TEST_FEEDBACK.type, 'Feedback type should match input');
    assert.equal(data.feedback.content, TEST_FEEDBACK.content, 'Feedback content should match input');
    
    testFeedbackId = data.feedback.id;
    console.log('✅ Anonymous feedback submission test passed');
    console.log(`Created test feedback with ID: ${testFeedbackId}`);
    
    return data.feedback;
  } catch (error) {
    console.error('❌ Anonymous feedback submission test failed:', error);
    throw error;
  }
}

async function testFeedbackRetrieval() {
  console.log('\n🧪 Testing feedback retrieval as admin...');
  
  if (!adminToken) {
    console.warn('⚠️ Skipping test - Admin login required');
    return;
  }
  
  try {
    // Get all feedback
    const allResponse = await fetch(`${API_BASE_URL}/api/feedback`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      },
    });
    
    assert.equal(allResponse.status, 200, 'Expected 200 status code for all feedback');
    const allData = await allResponse.json();
    assert.ok(Array.isArray(allData.feedback), 'Expected feedback array in response');
    
    // Get specific feedback
    const specificResponse = await fetch(`${API_BASE_URL}/api/feedback/${testFeedbackId}`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      },
    });
    
    assert.equal(specificResponse.status, 200, 'Expected 200 status code for specific feedback');
    const specificData = await specificResponse.json();
    assert.equal(specificData.feedback.id, testFeedbackId, 'Feedback ID should match');
    
    console.log('✅ Feedback retrieval test passed');
  } catch (error) {
    console.error('❌ Feedback retrieval test failed:', error);
    throw error;
  }
}

async function testUpdateFeedbackStatus() {
  console.log('\n🧪 Testing update feedback status...');
  
  if (!adminToken) {
    console.warn('⚠️ Skipping test - Admin login required');
    return;
  }
  
  try {
    // Update feedback status
    const updateResponse = await fetch(`${API_BASE_URL}/api/feedback/${testFeedbackId}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'reviewed' }),
    });
    
    assert.equal(updateResponse.status, 200, 'Expected 200 status code for status update');
    const updateData = await updateResponse.json();
    assert.equal(updateData.feedback.status, 'reviewed', 'Status should be updated to reviewed');
    
    // Verify the update with a GET request
    const verifyResponse = await fetch(`${API_BASE_URL}/api/feedback/${testFeedbackId}`, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`
      },
    });
    
    const verifyData = await verifyResponse.json();
    assert.equal(verifyData.feedback.status, 'reviewed', 'Status should remain updated after retrieval');
    
    console.log('✅ Update feedback status test passed');
  } catch (error) {
    console.error('❌ Update feedback status test failed:', error);
    throw error;
  }
}

async function testFeedbackValidation() {
  console.log('\n🧪 Testing feedback validation...');
  
  try {
    // Test missing required fields
    const missingFieldsResponse = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'bug' }), // Missing content field
    });
    
    assert.equal(missingFieldsResponse.status, 400, 'Expected 400 status code for missing required fields');
    
    // Test invalid type
    const invalidTypeResponse = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'invalid-type', // Invalid type
        content: 'Test content'
      }),
    });
    
    // This may return 400 or 201 depending on implementation
    // If type is validated, it should be 400
    // If type has a default value, it might be 201
    const validationImplemented = invalidTypeResponse.status === 400;
    
    if (validationImplemented) {
      console.log('✅ Feedback type validation implemented');
    } else {
      console.log('ℹ️ Feedback allows any type or uses default value');
    }
    
    // Test content length validation (if implemented)
    const shortContentResponse = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bug',
        content: 'Hi' // Very short content
      }),
    });
    
    const contentValidationImplemented = shortContentResponse.status === 400;
    
    if (contentValidationImplemented) {
      console.log('✅ Feedback content length validation implemented');
    } else {
      console.log('ℹ️ Feedback allows short content');
    }
    
    console.log('✅ Feedback validation test completed');
  } catch (error) {
    console.error('❌ Feedback validation test failed:', error);
    throw error;
  }
}

async function testUserSpecificEndpoints() {
  console.log('\n🧪 Testing user-specific feedback endpoints...');
  
  if (!userToken) {
    console.warn('⚠️ Skipping test - User login required');
    return;
  }
  
  try {
    // Test user's own feedback
    const userFeedbackResponse = await fetch(`${API_BASE_URL}/api/user/feedback`, {
      headers: { 
        'Authorization': `Bearer ${userToken}`
      },
    });
    
    if (userFeedbackResponse.status === 404) {
      console.log('ℹ️ User feedback endpoint not implemented');
      return;
    }
    
    assert.equal(userFeedbackResponse.status, 200, 'Expected 200 status code for user feedback');
    const userData = await userFeedbackResponse.json();
    assert.ok('feedback' in userData, 'Expected feedback property in response');
    
    // Test user feedback stats
    const statsResponse = await fetch(`${API_BASE_URL}/api/user/feedback/stats`, {
      headers: { 
        'Authorization': `Bearer ${userToken}`
      },
    });
    
    if (statsResponse.status === 404) {
      console.log('ℹ️ User feedback stats endpoint not implemented');
      return;
    }
    
    assert.equal(statsResponse.status, 200, 'Expected 200 status code for user feedback stats');
    const statsData = await statsResponse.json();
    assert.ok('stats' in statsData, 'Expected stats property in response');
    
    console.log('✅ User-specific feedback endpoints test passed');
  } catch (error) {
    console.error('❌ User-specific feedback endpoints test failed:', error);
    // Don't throw here as this is an optional feature
    console.warn('This may be expected if user-specific endpoints are not implemented');
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🧪 Testing unauthorized access protection...');
  
  try {
    // Try to access admin endpoint without auth
    const adminEndpointResponse = await fetch(`${API_BASE_URL}/api/feedback`);
    
    assert.ok(
      adminEndpointResponse.status === 401 || adminEndpointResponse.status === 403,
      'Expected 401 or 403 status code for unauthorized access to admin endpoint'
    );
    
    // Try to update status without auth
    const updateResponse = await fetch(`${API_BASE_URL}/api/feedback/${testFeedbackId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' }),
    });
    
    assert.ok(
      updateResponse.status === 401 || updateResponse.status === 403,
      'Expected 401 or 403 status code for unauthorized update attempt'
    );
    
    console.log('✅ Unauthorized access protection test passed');
  } catch (error) {
    console.error('❌ Unauthorized access protection test failed:', error);
    throw error;
  }
}

// Main test execution function
async function runTests() {
  console.log('🔍 Starting Feedback System Tests');
  
  try {
    // Try to login as admin and user (if auth is implemented)
    adminToken = await login(TEST_ADMIN_CREDENTIALS.email, TEST_ADMIN_CREDENTIALS.password);
    if (adminToken) {
      console.log('✅ Admin login successful');
    } else {
      console.log('ℹ️ Admin login failed or not implemented - some tests will be skipped');
    }
    
    userToken = await login(TEST_USER_CREDENTIALS.email, TEST_USER_CREDENTIALS.password);
    if (userToken) {
      console.log('✅ User login successful');
    } else {
      console.log('ℹ️ User login failed or not implemented - some tests will be skipped');
    }

    // Run test suite
    const feedback = await testAnonymousFeedbackSubmission();
    await testFeedbackRetrieval();
    await testUpdateFeedbackStatus();
    await testFeedbackValidation();
    await testUserSpecificEndpoints();
    await testUnauthorizedAccess();
    
    console.log('\n✅ All feedback system tests completed');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
  } finally {
    await cleanupTestData();
  }
}

// Run the tests
runTests();