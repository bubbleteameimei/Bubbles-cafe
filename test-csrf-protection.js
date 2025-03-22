/**
 * CSRF Protection Test
 * 
 * This script tests the CSRF protection implementation to ensure it is working correctly.
 * It performs the following steps:
 * 1. Makes a GET request to get a CSRF token from the server
 * 2. Extracts the token from the cookie
 * 3. Makes a POST request with the token to a protected endpoint
 * 4. Makes a POST request without the token to confirm it fails
 */

// Use built-in fetch
// Simple cookie parser function
function parseCookies(cookieString) {
  const cookies = {};
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      cookies[name] = value;
    }
  });
  
  return cookies;
}

async function testCSRFProtection() {
  try {
    console.log('Running CSRF protection test...');
    
    // Step 1: Get a CSRF token by making a GET request
    console.log('\n1. Requesting CSRF token from server...');
    const tokenResponse = await fetch('http://localhost:3001/health', {
      method: 'GET'
    });
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get CSRF token: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }
    
    // Extract the CSRF token from the Set-Cookie header
    const setCookieHeader = tokenResponse.headers.get('set-cookie');
    if (!setCookieHeader) {
      throw new Error('No cookies returned from server');
    }
    
    const cookies = setCookieHeader.split(',');
    let csrfToken = null;
    
    // Parse each cookie to find the CSRF token
    for (const cookie of cookies) {
      if (cookie.includes('XSRF-TOKEN')) {
        const tokenPart = cookie.split(';')[0];
        const tokenValue = tokenPart.split('=')[1];
        csrfToken = tokenValue;
        break;
      }
    }
    
    if (!csrfToken) {
      throw new Error('CSRF token not found in cookies');
    }
    
    console.log(`CSRF token obtained: ${csrfToken.substring(0, 10)}...`);
    
    // Also extract the session cookie for authentication
    let sessionCookie = null;
    for (const cookie of cookies) {
      if (cookie.includes('connect.sid')) {
        sessionCookie = cookie.split(';')[0];
        break;
      }
    }
    
    // Step 2: Test a protected endpoint with the CSRF token
    console.log('\n2. Testing protected endpoint WITH CSRF token...');
    const protectedResponse = await fetch('http://localhost:3001/api/user/feedback', {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
        'X-CSRF-Token': csrfToken
      }
    });
    
    console.log(`Response status: ${protectedResponse.status} ${protectedResponse.statusText}`);
    // This might still fail with 401 Unauthorized because we're not authenticated,
    // but it shouldn't fail with 403 Forbidden due to CSRF protection
    
    if (protectedResponse.status === 403) {
      const responseData = await protectedResponse.json();
      if (responseData.error && responseData.error.includes('CSRF')) {
        throw new Error('CSRF protection failed even with token provided');
      }
    }
    
    // Step 3: Test the same protected endpoint without the CSRF token
    console.log('\n3. Testing protected endpoint WITHOUT CSRF token...');
    const unprotectedResponse = await fetch('http://localhost:3001/api/user/feedback', {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    console.log(`Response status: ${unprotectedResponse.status} ${unprotectedResponse.statusText}`);
    
    // It should fail with a 403 Forbidden for CSRF token missing
    if (unprotectedResponse.status === 403) {
      const responseData = await unprotectedResponse.json();
      if (responseData.error && responseData.error.includes('CSRF')) {
        console.log('✅ CSRF protection successfully blocked request without token');
      } else {
        console.log('⚠️ Request was blocked but not due to CSRF protection');
      }
    } else if (unprotectedResponse.status === 401) {
      console.log('⚠️ Request failed with 401 Unauthorized instead of 403 Forbidden');
      console.log('This could be because the endpoint requires authentication');
    } else if (unprotectedResponse.ok) {
      console.log('❌ CSRF protection FAILED: Request succeeded without token');
    } else {
      console.log(`⚠️ Request failed with unexpected status: ${unprotectedResponse.status}`);
    }
    
    // Test a real mutation that should be protected
    console.log('\n4. Testing POST request WITH CSRF token...');
    const postWithTokenResponse = await fetch('http://localhost:3001/api/bookmarks', {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postId: 1, tags: ['test'] })
    });
    
    console.log(`Response status: ${postWithTokenResponse.status} ${postWithTokenResponse.statusText}`);
    
    // This might still fail with 401 Unauthorized because we're not authenticated,
    // but it shouldn't fail with 403 Forbidden due to CSRF protection
    
    // Test the same mutation without the CSRF token
    console.log('\n5. Testing POST request WITHOUT CSRF token...');
    const postWithoutTokenResponse = await fetch('http://localhost:3001/api/bookmarks', {
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ postId: 1, tags: ['test'] })
    });
    
    console.log(`Response status: ${postWithoutTokenResponse.status} ${postWithoutTokenResponse.statusText}`);
    
    if (postWithoutTokenResponse.status === 403) {
      const responseData = await postWithoutTokenResponse.json();
      if (responseData.error && responseData.error.includes('CSRF')) {
        console.log('✅ CSRF protection successfully blocked POST request without token');
      }
    } else {
      console.log('❌ CSRF protection FAILED for POST request: Request without token was not blocked properly');
    }
    
    console.log('\nCSRF protection test completed');
    
  } catch (error) {
    console.error('Error in CSRF protection test:', error);
  }
}

// Run the test
testCSRFProtection();