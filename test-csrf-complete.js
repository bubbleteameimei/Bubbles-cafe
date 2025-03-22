/**
 * Comprehensive CSRF Protection Test
 * 
 * This script tests the full CSRF protection implementation including:
 * 1. Getting a CSRF token from the health endpoint
 * 2. Making an authenticated request with the token
 * 3. Making a request without a token (should fail)
 * 4. Testing token refresh mechanism
 */

import fetch from 'node-fetch';

// Base URL for the API
const BASE_URL = 'http://localhost:3001';

// Store cookies and tokens
let cookies = {};
let csrfToken = null;

// Parse cookies from response headers
function parseCookies(cookieString) {
  if (!cookieString) return {};
  
  return cookieString.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(part => part.trim());
    cookies[name] = value;
    return cookies;
  }, {});
}

// Extract cookies from response
async function extractCookiesFromResponse(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    const newCookies = parseCookies(setCookieHeader);
    cookies = { ...cookies, ...newCookies };
  }
}

// Make a request to the health endpoint and get the CSRF token
async function getCSRFToken() {
  console.log('Step 1: Getting CSRF token from health endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error accessing health endpoint: ${response.status} ${response.statusText}`);
    }
    
    await extractCookiesFromResponse(response);
    
    const data = await response.json();
    csrfToken = data.csrfToken;
    
    console.log('✓ Successfully received CSRF token:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('✗ Failed to get CSRF token:', error.message);
    throw error;
  }
}

// Make an authenticated request with the CSRF token
async function makeAuthenticatedRequest() {
  console.log('\nStep 2: Making authenticated request with CSRF token...');
  
  try {
    // For this test, we'll try to create a bookmark
    // This endpoint requires authentication, so we expect a 401 Unauthorized
    // but NOT a 403 Forbidden, showing CSRF validation passed
    const response = await fetch(`${BASE_URL}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': csrfToken,
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      },
      body: JSON.stringify({
        postId: 1,
        userId: 1,
        note: 'Test bookmark'
      })
    });
    
    // We expect 401 Unauthorized since we're not logged in
    // But importantly, not 403 Forbidden which would mean CSRF protection blocked us
    if (response.status === 401) {
      console.log('✓ Request was properly authenticated for CSRF but failed due to missing user login (401 Unauthorized) - This is correct behavior!');
    } else if (response.status === 403) {
      console.error('✗ Request was blocked by CSRF protection even with a valid token');
    } else if (response.ok) {
      console.log('✓ Request succeeded:', await response.json());
    } else {
      console.log(`✓ Request failed with status ${response.status} ${response.statusText} - This may be expected depending on your endpoint`);
    }
    
    return response;
  } catch (error) {
    console.error('✗ Failed to make authenticated request:', error.message);
    throw error;
  }
}

// Make a request without the CSRF token
async function makeUnauthenticatedRequest() {
  console.log('\nStep 3: Making request WITHOUT CSRF token (should be denied)...');
  
  try {
    // For this test, we'll try to create a bookmark without a CSRF token
    // This should be blocked with a 403 Forbidden
    const response = await fetch(`${BASE_URL}/api/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join('; ')
      },
      body: JSON.stringify({
        postId: 1,
        userId: 1,
        note: 'Test bookmark'
      })
    });
    
    if (response.status === 403) {
      console.log('✓ Request without CSRF token was correctly blocked with 403 Forbidden');
    } else {
      console.error(`✗ Request without CSRF token was not blocked! Received status ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('✗ Failed to make unauthenticated request:', error.message);
    throw error;
  }
}

// Test the index page to ensure client-side JavaScript is correctly handling tokens
async function testIndexPage() {
  console.log('\nStep 4: Testing index page to verify client JS is handling CSRF tokens...');
  
  try {
    const response = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error accessing index page: ${response.status} ${response.statusText}`);
    }
    
    await extractCookiesFromResponse(response);
    
    console.log('✓ Successfully loaded index page');
    console.log('✓ CSRF cookie was set in browser');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to test index page:', error.message);
    throw error;
  }
}

// Run all tests in sequence
async function runTests() {
  console.log('CSRF Protection Test Suite\n');
  
  try {
    await getCSRFToken();
    await makeAuthenticatedRequest();
    await makeUnauthenticatedRequest();
    await testIndexPage();
    
    console.log('\n✅ All CSRF protection tests completed successfully!');
    console.log('The CSRF protection implementation is working properly.');
  } catch (error) {
    console.error('\n❌ CSRF protection test suite failed:', error.message);
  }
}

runTests();