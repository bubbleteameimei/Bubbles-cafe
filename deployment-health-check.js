#!/usr/bin/env node

/**
 * Simple Deployment Health Check Script
 * 
 * This script performs basic checks to help confirm your deployment configuration
 * is working correctly for the split deployment setup (Vercel + Render).
 * 
 * Usage:
 *   node deployment-health-check.js <frontend-url> <backend-url>
 */

import fetch from 'node-fetch';

// Helper: Format console output
const format = {
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  header: (msg) => console.log(`\n=== ${msg} ===\n`)
};

// Validate command line arguments
if (process.argv.length < 4) {
  console.log('Usage: node deployment-health-check.js <frontend-url> <backend-url>');
  console.log('Example: node deployment-health-check.js https://myapp.vercel.app https://myapi.onrender.com');
  process.exit(1);
}

const frontendUrl = process.argv[2].replace(/\/$/, ''); // Remove trailing slash if present
const backendUrl = process.argv[3].replace(/\/$/, '');  // Remove trailing slash if present

async function runHealthChecks() {
  format.header('DEPLOYMENT HEALTH CHECK');
  format.info(`Frontend URL: ${frontendUrl}`);
  format.info(`Backend URL: ${backendUrl}`);

  // Check 1: Backend health
  format.header('BACKEND HEALTH CHECK');
  try {
    const healthResponse = await fetch(`${backendUrl}/api/health`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      format.success(`Backend is healthy (Environment: ${data.environment})`);
    } else {
      format.error(`Backend health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
    }
  } catch (error) {
    format.error(`Cannot connect to backend: ${error.message}`);
  }

  // Check 2: CORS configuration
  format.header('CORS CONFIGURATION CHECK');
  try {
    const corsResponse = await fetch(`${backendUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const corsHeader = corsResponse.headers.get('access-control-allow-origin');
    const credentialsHeader = corsResponse.headers.get('access-control-allow-credentials');
    
    if (corsHeader) {
      format.success(`CORS is configured (Access-Control-Allow-Origin: ${corsHeader})`);
      
      if (corsHeader === '*') {
        format.warning('Using wildcard (*) origin - authentication with credentials will not work');
      } else if (corsHeader.includes(frontendUrl)) {
        format.success('Frontend origin is correctly allowed in CORS policy');
      } else {
        format.warning(`Frontend origin (${frontendUrl}) is not in the allowed CORS origins`);
      }
      
      if (credentialsHeader === 'true') {
        format.success('Credentials allowed (needed for authentication)');
      } else {
        format.warning('Credentials not allowed - authentication may not work properly');
      }
    } else {
      format.error('CORS headers are missing - cross-domain requests will fail');
    }
  } catch (error) {
    format.error(`CORS test failed: ${error.message}`);
  }

  // Check 3: Environment configuration
  format.header('ENVIRONMENT CONFIGURATION CHECK');
  try {
    const configResponse = await fetch(`${backendUrl}/api/config/public`);
    if (configResponse.ok) {
      const data = await configResponse.json();
      
      if (data.frontendUrl && data.frontendUrl === frontendUrl) {
        format.success('FRONTEND_URL environment variable is correctly set');
      } else if (data.frontendUrl) {
        format.warning(`FRONTEND_URL mismatch: Expected "${frontendUrl}" but got "${data.frontendUrl}"`);
      } else {
        format.warning('FRONTEND_URL is not set on the backend');
      }

      format.success(`Backend is running in ${data.environment} mode`);
    } else {
      format.error(`Could not retrieve environment configuration: ${configResponse.status}`);
    }
  } catch (error) {
    format.error(`Environment check failed: ${error.message}`);
  }

  // Check 4: Authentication endpoint
  format.header('AUTHENTICATION ENDPOINT CHECK');
  try {
    const authResponse = await fetch(`${backendUrl}/api/auth/status`);
    if (authResponse.ok) {
      format.success('Authentication endpoint is accessible');
    } else {
      format.warning(`Authentication endpoint returned status ${authResponse.status}`);
    }
  } catch (error) {
    format.error(`Authentication check failed: ${error.message}`);
  }

  // Check 5: Frontend basic check
  format.header('FRONTEND BASIC CHECK');
  try {
    const frontendResponse = await fetch(frontendUrl);
    if (frontendResponse.ok) {
      format.success('Frontend is accessible');
    } else {
      format.error(`Frontend check failed: ${frontendResponse.status} ${frontendResponse.statusText}`);
    }
  } catch (error) {
    format.error(`Frontend check failed: ${error.message}`);
  }

  format.header('HEALTH CHECK SUMMARY');
  format.info('See DEPLOYMENT_GUIDE.md and PRE_DEPLOYMENT_CHECKLIST.md for more detailed instructions');
  format.info('Use DEPLOYMENT_TESTING.md for comprehensive testing after deployment');
}

runHealthChecks().catch(error => {
  console.error('Health check script failed:', error);
});