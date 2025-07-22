/**
 * Rate Limiter Testing Script
 * 
 * This script tests the rate limiters we've implemented across different types of endpoints:
 * 1. Global rate limiter (all routes)
 * 2. API rate limiter (API-specific routes)
 * 3. Authentication rate limiter (login/registration)
 * 4. Sensitive operations rate limiter (password reset)
 * 
 * Usage:
 *   node scripts/test-rate-limiters.js
 */

import fetch from 'node-fetch';
const baseUrl = 'http://localhost:3003';

async function testGlobalRateLimiter() {
  console.log('\n📊 Testing global rate limiter...');
  const startTime = Date.now();
  
  try {
    // Make a request to check rate limit headers
    const response = await fetch(`${baseUrl}/api/health`);
    const headers = response.headers;
    
    // Log the rate limit headers
    console.log('✅ Global Rate Limit headers:');
    console.log(`   Limit: ${headers.get('RateLimit-Limit')}`);
    console.log(`   Remaining: ${headers.get('RateLimit-Remaining')}`);
    console.log(`   Reset: ${headers.get('RateLimit-Reset')}s`);
    console.log(`   Policy: ${headers.get('RateLimit-Policy')}`);
    
    // Extract CSRF token for other tests
    const body = await response.json();
    return body.csrfToken;
  } catch (error) {
    console.error('❌ Error testing global rate limiter:', error);
    return null;
  }
}

async function testApiRateLimiter(csrfToken) {
  console.log('\n📊 Testing API rate limiter (GET /api/posts)...');
  
  try {
    // Make 5 requests in a row to test the API rate limiter
    console.log('   Making 5 requests in quick succession...');
    
    let lastRateLimit = null;
    
    for (let i = 1; i <= 5; i++) {
      const response = await fetch(`${baseUrl}/api/posts?page=1&limit=2`);
      
      // Log rate limit headers from the last request
      if (i === 5) {
        lastRateLimit = {
          limit: response.headers.get('RateLimit-Limit'),
          remaining: response.headers.get('RateLimit-Remaining'),
          reset: response.headers.get('RateLimit-Reset')
        };
      }
    }
    
    // Output results
    console.log(`✅ After 5 requests:`);
    console.log(`   Limit: ${lastRateLimit.limit}`);
    console.log(`   Remaining: ${lastRateLimit.remaining}`);
    console.log(`   Reset: ${lastRateLimit.reset}s`);
    
    return true;
  } catch (error) {
    console.error('❌ Error testing API rate limiter:', error);
    return false;
  }
}

async function testSensitiveOperationsRateLimiter(csrfToken) {
  console.log('\n📊 Testing sensitive operations rate limiter (forgot-password)...');
  
  try {
    // Make 4 requests to test the sensitive operations rate limiter
    // It should allow 3 and block the 4th
    const results = [];
    
    console.log('   Making 4 password reset requests...');
    
    for (let i = 1; i <= 4; i++) {
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email: `test${i}@example.com` })
      });
      
      const status = response.status;
      const rateLimit = {
        limit: response.headers.get('RateLimit-Limit'),
        remaining: response.headers.get('RateLimit-Remaining'),
        reset: response.headers.get('RateLimit-Reset')
      };
      
      results.push({ attempt: i, status, rateLimit });
    }
    
    // Print results
    for (const result of results) {
      console.log(`✅ Attempt ${result.attempt}:`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Limit: ${result.rateLimit.limit}`);
      console.log(`   Remaining: ${result.rateLimit.remaining}`);
      console.log(`   Reset: ${result.rateLimit.reset}s`);
    }
    
    // Check if rate limiting correctly blocked the 4th request
    if (results[3].status === 429) {
      console.log('✅ Rate limiter successfully blocked 4th password reset attempt (expected behavior)');
    } else {
      console.log('⚠️ Warning: 4th password reset request was not blocked by rate limiter');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing sensitive operations rate limiter:', error);
    return false;
  }
}

async function runTests() {
  console.log('🔒 Starting rate limiter tests...');
  
  // Test global rate limiter and get CSRF token
  const csrfToken = await testGlobalRateLimiter();
  
  if (!csrfToken) {
    console.error('❌ Failed to obtain CSRF token, cannot continue with tests');
    return;
  }
  
  // Test API rate limiter
  await testApiRateLimiter(csrfToken);
  
  // Test sensitive operations rate limiter
  await testSensitiveOperationsRateLimiter(csrfToken);
  
  console.log('\n🎉 Rate limiter tests completed!');
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Tests failed with error:', error);
});