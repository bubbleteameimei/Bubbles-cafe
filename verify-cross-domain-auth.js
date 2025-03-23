/**
 * Cross-Domain Authentication Verification Script
 * 
 * This script tests the authentication flow between a Vercel frontend and a Render backend
 * to ensure cookies, CSRF tokens, and sessions work correctly in a split deployment.
 * 
 * Usage:
 *   node verify-cross-domain-auth.js <frontend-url> <backend-url>
 * 
 * Example:
 *   node verify-cross-domain-auth.js https://my-app.vercel.app https://my-backend.onrender.com
 */

const fetch = require('node-fetch');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let FRONTEND_URL = '';
let BACKEND_URL = '';
let AUTH_COOKIE = '';
let CSRF_TOKEN = '';
let TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!'
};

// Parse command line arguments
if (process.argv.length >= 4) {
  FRONTEND_URL = process.argv[2];
  BACKEND_URL = process.argv[3];
}

// Prompt for URLs if not provided
async function promptForUrls() {
  if (!FRONTEND_URL || !BACKEND_URL) {
    console.log('Cross-Domain Authentication Verification Tool\n');

    if (!FRONTEND_URL) {
      FRONTEND_URL = await new Promise((resolve) => {
        rl.question('Enter your frontend URL (e.g., https://your-app.vercel.app): ', (frontendUrl) => {
          resolve(frontendUrl.trim());
        });
      });
    }
    
    if (!BACKEND_URL) {
      BACKEND_URL = await new Promise((resolve) => {
        rl.question('Enter your backend URL (e.g., https://your-api.onrender.com): ', (backendUrl) => {
          resolve(backendUrl.trim());
        });
      });
    }
  }

  // Normalize URLs (remove trailing slashes)
  FRONTEND_URL = FRONTEND_URL.replace(/\/$/, '');
  BACKEND_URL = BACKEND_URL.replace(/\/$/, '');
  
  console.log('\nTesting authentication with:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
}

// Helper function to extract cookies from response
function extractCookies(response) {
  const cookies = {};
  const cookieHeader = response.headers.get('set-cookie');
  
  if (!cookieHeader) {
    return cookies;
  }
  
  // Split cookies and parse each one
  cookieHeader.split(',').forEach(cookie => {
    const parts = cookie.split(';');
    const cookiePart = parts[0].trim();
    const nameValue = cookiePart.split('=');
    
    if (nameValue.length === 2) {
      cookies[nameValue[0]] = nameValue[1];
    }
  });
  
  return cookies;
}

// Step 1: Test CSRF token generation
async function testCsrfTokenGeneration() {
  console.log('\n1. Testing CSRF token generation...');
  
  try {
    // Make request to health endpoint to get CSRF token
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Health endpoint failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.csrfToken) {
      console.log('❌ No CSRF token found in health response');
      return false;
    }
    
    // Extract cookies from response
    const cookies = extractCookies(response);
    const csrfCookie = cookies['XSRF-TOKEN'];
    
    if (!csrfCookie) {
      console.log('❌ No CSRF cookie set in response');
      return false;
    }
    
    console.log('✅ CSRF token successfully generated');
    console.log(`  Token: ${data.csrfToken.substring(0, 8)}...`);
    
    // Save for later use
    CSRF_TOKEN = data.csrfToken;
    
    return true;
  } catch (error) {
    console.log(`❌ CSRF token test failed: ${error.message}`);
    return false;
  }
}

// Step 2: Test registration (optional)
async function testRegistration() {
  console.log('\n2. Testing user registration...');
  
  const testUserEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'X-CSRF-Token': CSRF_TOKEN
      },
      body: JSON.stringify({
        email: testUserEmail,
        password: testPassword,
        username: `testuser${Date.now()}`,
        fullName: 'Test User'
      })
    });
    
    if (!response.ok) {
      // This might be expected if registration is disabled or requires approval
      console.log(`⚠️ Registration test skipped: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User registration successful');
      
      // Update test user for login test
      TEST_USER = {
        email: testUserEmail,
        password: testPassword
      };
      
      return true;
    } else {
      console.log(`❌ Registration failed: ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Registration test failed: ${error.message}`);
    return false;
  }
}

// Step 3: Test login
async function testLogin() {
  console.log('\n3. Testing user login...');
  
  try {
    // Attempt to login with test user
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': FRONTEND_URL,
        'X-CSRF-Token': CSRF_TOKEN
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });
    
    // Extract cookies from response
    const cookies = extractCookies(response);
    const sessionCookie = cookies['connect.sid'] || Object.values(cookies)[0];
    
    if (!sessionCookie) {
      console.log('❌ No session cookie set after login');
      return false;
    }
    
    // Store cookie for future requests
    AUTH_COOKIE = `connect.sid=${sessionCookie}`;
    
    if (!response.ok) {
      console.log(`❌ Login failed: ${response.status} ${response.statusText}`);
      
      try {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      } catch (e) {
        // Ignore parsing errors
      }
      
      return false;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login successful');
      return true;
    } else {
      console.log(`❌ Login failed: ${data.message || 'Unknown error'}`);
      
      console.log('\nPlease make sure your test user exists. Try creating it manually in development.');
      console.log(`Email: ${TEST_USER.email}`);
      console.log(`Password: ${TEST_USER.password}`);
      
      return false;
    }
  } catch (error) {
    console.log(`❌ Login test failed: ${error.message}`);
    return false;
  }
}

// Step 4: Test authentication check
async function testAuthCheck() {
  console.log('\n4. Testing authentication check...');
  
  try {
    // Check authentication status with session cookie
    const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Cookie': AUTH_COOKIE,
        'X-CSRF-Token': CSRF_TOKEN
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Auth check failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.authenticated) {
      console.log('✅ Authentication check successful');
      console.log(`   User ID: ${data.user?.id}`);
      console.log(`   Email: ${data.user?.email}`);
      return true;
    } else {
      console.log('❌ Authentication check failed: Not authenticated');
      return false;
    }
  } catch (error) {
    console.log(`❌ Auth check test failed: ${error.message}`);
    return false;
  }
}

// Step 5: Test protected route access
async function testProtectedRouteAccess() {
  console.log('\n5. Testing protected route access...');
  
  try {
    // Try to access a protected route with session cookie
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Cookie': AUTH_COOKIE,
        'X-CSRF-Token': CSRF_TOKEN
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Protected route access failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data && (data.id || data.user)) {
      console.log('✅ Protected route access successful');
      return true;
    } else {
      console.log('❌ Protected route returned invalid data');
      return false;
    }
  } catch (error) {
    console.log(`❌ Protected route test failed: ${error.message}`);
    return false;
  }
}

// Step 6: Test Logout
async function testLogout() {
  console.log('\n6. Testing user logout...');
  
  try {
    // Logout with session cookie
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Cookie': AUTH_COOKIE,
        'X-CSRF-Token': CSRF_TOKEN
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Logout failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    console.log('✅ Logout successful');
    
    // Verify logout by checking auth status
    const authCheckResponse = await fetch(`${BACKEND_URL}/api/auth/status`, {
      method: 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'Cookie': AUTH_COOKIE,
        'X-CSRF-Token': CSRF_TOKEN
      }
    });
    
    const authCheckData = await authCheckResponse.json();
    
    if (!authCheckData.authenticated) {
      console.log('✅ Auth check confirms user is logged out');
      return true;
    } else {
      console.log('❌ User still shows as authenticated after logout');
      return false;
    }
  } catch (error) {
    console.log(`❌ Logout test failed: ${error.message}`);
    return false;
  }
}

// Generate a report
function generateReport(results) {
  console.log('\n==================================================');
  console.log('CROSS-DOMAIN AUTHENTICATION VERIFICATION REPORT');
  console.log('==================================================');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('--------------------------------------------------');
  
  let passedCount = 0;
  const totalCount = Object.keys(results).length;
  
  for (const [test, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${test}`);
    
    if (passed) {
      passedCount++;
    }
  }
  
  const passRate = Math.round((passedCount / totalCount) * 100);
  
  console.log('--------------------------------------------------');
  console.log(`OVERALL RESULT: ${passedCount}/${totalCount} tests passed (${passRate}%)`);
  
  if (passRate === 100) {
    console.log('\n✅ AUTHENTICATION SYSTEM VERIFIED');
    console.log('Your cross-domain authentication is working correctly!');
  } else if (passRate >= 60) {
    console.log('\n⚠️ AUTHENTICATION SYSTEM PARTIALLY WORKING');
    console.log('Most tests passed, but there are some issues to fix.');
  } else {
    console.log('\n❌ AUTHENTICATION SYSTEM NEEDS WORK');
    console.log('Several critical tests failed. Review the results and fix the issues.');
  }
  
  console.log('\nCommon issues to check:');
  console.log('1. Cookie settings: secure, httpOnly, sameSite');
  console.log('2. CORS configuration: allowed origins, credentials');
  console.log('3. CSRF token implementation');
  console.log('4. Session configuration');
  console.log('5. Environment variables (FRONTEND_URL on backend)');
}

// Main function
async function runTests() {
  try {
    await promptForUrls();
    
    // Run tests sequentially
    const csrfTokenGenerated = await testCsrfTokenGeneration();
    
    // Skip registration test for now to avoid creating too many test users
    // const registrationSuccessful = await testRegistration();
    const registrationSuccessful = true;
    
    const loginSuccessful = csrfTokenGenerated && await testLogin();
    const authCheckSuccessful = loginSuccessful && await testAuthCheck();
    const protectedRouteAccessible = loginSuccessful && await testProtectedRouteAccess();
    const logoutSuccessful = loginSuccessful && await testLogout();
    
    // Generate report
    generateReport({
      'CSRF Token Generation': csrfTokenGenerated,
      'User Login': loginSuccessful,
      'Authentication Check': authCheckSuccessful,
      'Protected Route Access': protectedRouteAccessible,
      'User Logout': logoutSuccessful
    });
    
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    rl.close();
  }
}

// Run all tests
runTests();