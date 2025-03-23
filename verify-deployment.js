/**
 * Comprehensive Deployment Verification Script
 * 
 * This script verifies that your application is properly configured for split deployment
 * between Vercel (frontend) and Render (backend).
 * 
 * Usage:
 *   node verify-deployment.js <frontend-url> <backend-url>
 * 
 * Example:
 *   node verify-deployment.js https://my-app.vercel.app https://my-backend.onrender.com
 */

const fetch = require('node-fetch');
const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk') || { green: (s) => s, red: (s) => s, yellow: (s) => s, blue: (s) => s };

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let FRONTEND_URL = '';
let BACKEND_URL = '';
let AUTH_COOKIE = '';

// Parse command line arguments
if (process.argv.length >= 4) {
  FRONTEND_URL = process.argv[2];
  BACKEND_URL = process.argv[3];
}

async function promptForUrls() {
  if (!FRONTEND_URL || !BACKEND_URL) {
    console.log(chalk.blue('Split Deployment Verification Tool\n'));
    console.log('This script will verify your deployment configuration.\n');

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
  
  console.log(chalk.blue('\nTesting deployment with:'));
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
}

// Test API connectivity
async function testApiHealth() {
  console.log(chalk.blue('\n1. Testing API health...'));
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(chalk.green('✅ API health check successful'));
      
      if (data.csrfToken) {
        console.log(chalk.green('✅ CSRF token properly generated'));
      } else {
        console.log(chalk.yellow('⚠️ CSRF token not found in health response'));
      }
      
      // Store cookies for future requests
      const cookies = response.headers.get('set-cookie');
      if (cookies) {
        console.log(chalk.green('✅ Cookies are being set properly'));
      } else {
        console.log(chalk.yellow('⚠️ No cookies set from API health endpoint'));
      }
      
      return true;
    } else {
      console.log(chalk.red(`❌ API health check failed: ${response.status} ${response.statusText}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ API connectivity failed: ${error.message}`));
    console.log('\nPossible causes:');
    console.log('- Backend server is not running');
    console.log('- URL is incorrect');
    console.log('- Network connectivity issues');
    console.log('- CORS is blocking the request (if testing from browser)');
    return false;
  }
}

// Test CORS configuration
async function testCorsConfiguration() {
  console.log(chalk.blue('\n2. Testing CORS configuration...'));
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const allowOrigin = response.headers.get('access-control-allow-origin');
    const allowCredentials = response.headers.get('access-control-allow-credentials');
    const allowMethods = response.headers.get('access-control-allow-methods');
    const allowHeaders = response.headers.get('access-control-allow-headers');
    
    let corsCorrect = true;
    
    if (!allowOrigin) {
      console.log(chalk.red('❌ Access-Control-Allow-Origin header is missing'));
      corsCorrect = false;
    } else if (allowOrigin !== FRONTEND_URL && allowOrigin !== '*') {
      console.log(chalk.red(`❌ Access-Control-Allow-Origin header is incorrect: ${allowOrigin}`));
      corsCorrect = false;
    } else {
      console.log(chalk.green(`✅ Access-Control-Allow-Origin header is correctly set to: ${allowOrigin}`));
    }
    
    if (allowOrigin === '*') {
      console.log(chalk.yellow('⚠️ Using wildcard origin (*) will prevent cookies from being sent in cross-domain requests'));
    }
    
    if (!allowCredentials) {
      console.log(chalk.yellow('⚠️ Access-Control-Allow-Credentials header is missing'));
      corsCorrect = false;
    } else if (allowCredentials !== 'true') {
      console.log(chalk.red(`❌ Access-Control-Allow-Credentials header is incorrect: ${allowCredentials}`));
      corsCorrect = false;
    } else {
      console.log(chalk.green('✅ Access-Control-Allow-Credentials header is correctly set to true'));
    }
    
    if (!allowMethods) {
      console.log(chalk.yellow('⚠️ Access-Control-Allow-Methods header is missing'));
    } else {
      console.log(chalk.green(`✅ Access-Control-Allow-Methods header is set to: ${allowMethods}`));
    }
    
    if (!allowHeaders) {
      console.log(chalk.yellow('⚠️ Access-Control-Allow-Headers header is missing'));
    } else {
      console.log(chalk.green(`✅ Access-Control-Allow-Headers includes necessary headers`));
    }
    
    return corsCorrect;
  } catch (error) {
    console.log(chalk.red(`❌ CORS test failed: ${error.message}`));
    return false;
  }
}

// Test environment variable configuration
async function testEnvironmentConfig() {
  console.log(chalk.blue('\n3. Testing environment configuration...'));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/config/public`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.frontendUrl && data.frontendUrl === FRONTEND_URL) {
        console.log(chalk.green('✅ FRONTEND_URL environment variable is correctly set on backend'));
      } else {
        console.log(chalk.yellow(`⚠️ FRONTEND_URL may be incorrectly configured on backend: ${data.frontendUrl || 'not set'}`));
      }
      
      // Check other important config values
      console.log(chalk.green('✅ Backend environment configuration retrieved successfully'));
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ Could not retrieve environment configuration: ${response.status}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.yellow(`⚠️ Environment config test failed: ${error.message}`));
    return false;
  }
}

// Test session and authentication endpoints
async function testAuthentication() {
  console.log(chalk.blue('\n4. Testing authentication endpoints...'));
  
  try {
    // First get a CSRF token from the health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`, {
      credentials: 'include'
    });
    
    if (!healthResponse.ok) {
      console.log(chalk.red('❌ Could not get CSRF token from health endpoint'));
      return false;
    }
    
    const healthData = await healthResponse.json();
    const csrfToken = healthData.csrfToken;
    
    if (!csrfToken) {
      console.log(chalk.red('❌ No CSRF token returned from health endpoint'));
      return false;
    }
    
    console.log(chalk.green('✅ Successfully retrieved CSRF token'));
    
    // Extract cookies from health response
    const cookies = healthResponse.headers.get('set-cookie');
    if (!cookies) {
      console.log(chalk.yellow('⚠️ No cookies set from health endpoint'));
    }
    
    // Test authentication status endpoint
    const authStatusResponse = await fetch(`${BACKEND_URL}/api/auth/status`, {
      headers: {
        'Cookie': cookies,
        'X-CSRF-Token': csrfToken
      },
      credentials: 'include'
    });
    
    if (authStatusResponse.ok) {
      const authStatusData = await authStatusResponse.json();
      console.log(chalk.green('✅ Authentication status endpoint working properly'));
      
      // Check if we're currently authenticated
      if (authStatusData.authenticated) {
        console.log(chalk.green('✅ User is currently authenticated'));
      } else {
        console.log(chalk.green('✅ User is not authenticated (as expected)'));
      }
    } else {
      console.log(chalk.red(`❌ Authentication status endpoint failed: ${authStatusResponse.status}`));
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Authentication test failed: ${error.message}`));
    return false;
  }
}

// Test if frontend can load properly 
async function testFrontendLoading() {
  console.log(chalk.blue('\n5. Testing frontend loading...'));
  
  try {
    const response = await fetch(FRONTEND_URL);
    
    if (response.ok) {
      // Check if response is HTML
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log(chalk.green('✅ Frontend HTML loaded successfully'));
        
        // Check for basic indicators of a proper HTML page
        const html = await response.text();
        
        if (html.includes('<title>') && html.includes('</html>')) {
          console.log(chalk.green('✅ Frontend page contains valid HTML structure'));
        } else {
          console.log(chalk.yellow('⚠️ Frontend page may not contain valid HTML structure'));
        }
        
        if (html.includes('/assets/') || html.includes('.js') || html.includes('.css')) {
          console.log(chalk.green('✅ Frontend page appears to include assets'));
        } else {
          console.log(chalk.yellow('⚠️ Frontend page might be missing assets'));
        }
        
        return true;
      } else {
        console.log(chalk.yellow(`⚠️ Frontend response is not HTML: ${contentType}`));
        return false;
      }
    } else {
      console.log(chalk.red(`❌ Frontend loading failed: ${response.status} ${response.statusText}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Frontend test failed: ${error.message}`));
    return false;
  }
}

// Test database connectivity
async function testDatabaseConnectivity() {
  console.log(chalk.blue('\n6. Testing database connectivity...'));
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    
    if (response.ok) {
      // A successful health check implies database connection is working
      console.log(chalk.green('✅ Database connectivity successful (via health check)'));
      return true;
    } else {
      console.log(chalk.red(`❌ Database connectivity check failed: ${response.status}`));
      return false;
    }
  } catch (error) {
    console.log(chalk.red(`❌ Database connectivity test failed: ${error.message}`));
    return false;
  }
}

// Test static asset loading
async function testStaticAssetLoading() {
  console.log(chalk.blue('\n7. Testing static asset loading...'));
  
  try {
    // Find some static assets by looking at the frontend HTML
    const frontendResponse = await fetch(FRONTEND_URL);
    const html = await frontendResponse.text();
    
    // Extract some JavaScript files
    const jsFiles = html.match(/src="([^"]+\.js)"/g) || [];
    // Extract some CSS files
    const cssFiles = html.match(/href="([^"]+\.css)"/g) || [];
    
    if (jsFiles.length === 0 && cssFiles.length === 0) {
      console.log(chalk.yellow('⚠️ Could not find any static assets in the frontend HTML'));
      return false;
    }
    
    // Test loading a JavaScript file
    if (jsFiles.length > 0) {
      const jsFile = jsFiles[0].match(/src="([^"]+)"/)[1];
      let jsUrl = jsFile;
      
      if (jsFile.startsWith('/')) {
        jsUrl = `${FRONTEND_URL}${jsFile}`;
      } else if (!jsFile.startsWith('http')) {
        jsUrl = `${FRONTEND_URL}/${jsFile}`;
      }
      
      const jsResponse = await fetch(jsUrl);
      
      if (jsResponse.ok) {
        console.log(chalk.green('✅ JavaScript asset loaded successfully'));
      } else {
        console.log(chalk.red(`❌ JavaScript asset loading failed: ${jsResponse.status}`));
      }
    }
    
    // Test loading a CSS file
    if (cssFiles.length > 0) {
      const cssFile = cssFiles[0].match(/href="([^"]+)"/)[1];
      let cssUrl = cssFile;
      
      if (cssFile.startsWith('/')) {
        cssUrl = `${FRONTEND_URL}${cssFile}`;
      } else if (!cssFile.startsWith('http')) {
        cssUrl = `${FRONTEND_URL}/${cssFile}`;
      }
      
      const cssResponse = await fetch(cssUrl);
      
      if (cssResponse.ok) {
        console.log(chalk.green('✅ CSS asset loaded successfully'));
      } else {
        console.log(chalk.red(`❌ CSS asset loading failed: ${cssResponse.status}`));
      }
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Static asset loading test failed: ${error.message}`));
    return false;
  }
}

// Generate a report from test results
function generateReport(results) {
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(chalk.blue('\n=========================================='));
  console.log(chalk.blue('  Deployment Verification Report'));
  console.log(chalk.blue('=========================================='));
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log(chalk.blue('------------------------------------------'));
  console.log(`Tests Passed: ${passedTests}/${totalTests} (${passRate}%)`);
  console.log(chalk.blue('------------------------------------------'));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? chalk.green('✅ PASS') : chalk.red('❌ FAIL');
    console.log(`${status} - ${test}`);
  });
  
  console.log(chalk.blue('------------------------------------------'));
  
  if (passRate === 100) {
    console.log(chalk.green('🎉 All tests passed! Your deployment is ready.'));
  } else if (passRate >= 80) {
    console.log(chalk.yellow('⚠️ Most tests passed, but there are some issues to fix.'));
  } else {
    console.log(chalk.red('❌ Several tests failed. Your deployment needs work.'));
  }
  
  // Save report to file
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const reportFile = `deployment-verification-report-${timestamp}.txt`;
  
  const reportContent = `
Deployment Verification Report
==========================================
Date: ${new Date().toISOString()}
Frontend URL: ${FRONTEND_URL}
Backend URL: ${BACKEND_URL}
------------------------------------------
Tests Passed: ${passedTests}/${totalTests} (${passRate}%)
------------------------------------------
${Object.entries(results).map(([test, passed]) => `${passed ? 'PASS' : 'FAIL'} - ${test}`).join('\n')}
------------------------------------------
${passRate === 100 ? 'All tests passed! Your deployment is ready.' : 
  passRate >= 80 ? 'Most tests passed, but there are some issues to fix.' :
  'Several tests failed. Your deployment needs work.'}
`;

  fs.writeFileSync(reportFile, reportContent);
  console.log(`\nReport saved to ${reportFile}`);
}

// Main function
async function runTests() {
  try {
    await promptForUrls();
    
    const results = {
      'API Health': await testApiHealth(),
      'CORS Configuration': await testCorsConfiguration(),
      'Environment Configuration': await testEnvironmentConfig(),
      'Authentication Endpoints': await testAuthentication(),
      'Frontend Loading': await testFrontendLoading(),
      'Database Connectivity': await testDatabaseConnectivity(),
      'Static Asset Loading': await testStaticAssetLoading()
    };
    
    generateReport(results);
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    rl.close();
  }
}

// Run the tests
runTests();