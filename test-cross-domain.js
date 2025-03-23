/**
 * Cross-Domain Deployment Test Script
 * 
 * This script tests critical functionality for split deployment scenarios
 * where the frontend is on Vercel and the backend is on Render.
 */

import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let FRONTEND_URL = '';
let BACKEND_URL = '';

async function promptForUrls() {
  console.log('Cross-Domain Deployment Test\n');
  console.log('This script will test your deployment configuration.\n');

  return new Promise((resolve) => {
    rl.question('Enter your frontend URL (e.g., https://your-app.vercel.app): ', (frontendUrl) => {
      FRONTEND_URL = frontendUrl.trim();
      
      rl.question('Enter your backend URL (e.g., https://your-api.onrender.com): ', (backendUrl) => {
        BACKEND_URL = backendUrl.trim();
        resolve();
      });
    });
  });
}

// Test API connectivity
async function testApiConnectivity() {
  console.log('\n1. Testing API connectivity...');
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    if (response.ok) {
      console.log('✅ API health check successful');
      return true;
    } else {
      console.log(`❌ API health check failed: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API connectivity failed: ${error.message}`);
    return false;
  }
}

// Test CORS configuration
async function testCorsConfiguration() {
  console.log('\n2. Testing CORS configuration...');
  
  try {
    // We'll use the OPTIONS method to test preflight requests
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, X-CSRF-Token'
      }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    const credentialsHeader = response.headers.get('access-control-allow-credentials');
    
    if (corsHeader) {
      console.log(`✅ CORS headers present: Access-Control-Allow-Origin: ${corsHeader}`);
      
      if (corsHeader !== '*' && credentialsHeader === 'true') {
        console.log('✅ Credentials allowed for specific origin (good for authentication)');
      } else if (corsHeader === '*' && !credentialsHeader) {
        console.log('⚠️ Wildcard origin without credentials (authentication will not work)');
      }
      
      return true;
    } else {
      console.log('❌ CORS headers missing - deployment will likely fail');
      return false;
    }
  } catch (error) {
    console.log(`❌ CORS test failed: ${error.message}`);
    return false;
  }
}

// Test environment variable configuration
async function testEnvironmentVariables() {
  console.log('\n3. Testing environment configuration...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/config/public`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.frontendUrl && data.frontendUrl === FRONTEND_URL) {
        console.log('✅ FRONTEND_URL environment variable is correctly set on backend');
      } else {
        console.log(`⚠️ FRONTEND_URL may be incorrectly configured on backend: ${data.frontendUrl || 'not set'}`);
      }
      
      // Check other important config values
      console.log('✅ Backend environment configuration retrieved successfully');
      return true;
    } else {
      console.log(`⚠️ Could not retrieve environment configuration: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ Environment config test failed: ${error.message}`);
    return false;
  }
}

// Test authentication flow (basic check)
async function testAuthenticationEndpoint() {
  console.log('\n4. Testing authentication endpoints...');
  
  try {
    // Check if auth endpoints are accessible
    const response = await fetch(`${BACKEND_URL}/api/auth/status`);
    
    if (response.ok) {
      console.log('✅ Authentication endpoint is accessible');
      return true;
    } else {
      console.log(`⚠️ Authentication endpoint returned: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication endpoint test failed: ${error.message}`);
    return false;
  }
}

// Test static asset loading
async function testStaticAssetLoading() {
  console.log('\n5. Testing static asset loading...');
  
  // List of common static asset paths to test
  const assetPaths = [
    '/favicon.ico',
    '/manifest.json',
    '/robots.txt'
  ];
  
  let success = false;
  
  for (const path of assetPaths) {
    try {
      const response = await fetch(`${FRONTEND_URL}${path}`);
      
      if (response.ok) {
        console.log(`✅ Successfully loaded ${path}`);
        success = true;
        break; // We found at least one working asset
      } else {
        console.log(`❌ Failed to load ${path}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error loading ${path}: ${error.message}`);
    }
  }
  
  if (!success) {
    console.log('⚠️ Could not verify any static assets. Check your frontend deployment.');
  }
  
  return success;
}

// Run all tests and provide a summary
async function runTests() {
  await promptForUrls();
  
  console.log('\n=== Starting Cross-Domain Deployment Tests ===\n');
  
  const apiResult = await testApiConnectivity();
  const corsResult = await testCorsConfiguration();
  const envResult = await testEnvironmentVariables();
  const authResult = await testAuthenticationEndpoint();
  const assetResult = await testStaticAssetLoading();
  
  console.log('\n=== Test Summary ===\n');
  console.log(`API Connectivity:     ${apiResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`CORS Configuration:   ${corsResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Environment Config:   ${envResult ? '✅ PASSED' : '⚠️ WARNING'}`);
  console.log(`Authentication:       ${authResult ? '✅ PASSED' : '⚠️ WARNING'}`);
  console.log(`Static Asset Loading: ${assetResult ? '✅ PASSED' : '⚠️ WARNING'}`);
  
  const overallResult = apiResult && corsResult;
  
  console.log('\n=== Overall Assessment ===\n');
  if (overallResult) {
    console.log('✅ Your deployment looks good! Critical tests passed.');
    if (!envResult || !authResult || !assetResult) {
      console.log('⚠️ Some non-critical tests had warnings. Review them before proceeding.');
    }
  } else {
    console.log('❌ Your deployment has issues that need to be addressed.');
    console.log('   Please fix the failed tests before proceeding.');
  }
  
  console.log('\nFor more detailed deployment guidance, refer to DEPLOYMENT_GUIDE.md');
  rl.close();
}

runTests().catch(error => {
  console.error('Test script failed:', error);
  rl.close();
});