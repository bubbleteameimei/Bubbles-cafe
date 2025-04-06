// Using native fetch and crypto
import { createHash } from 'crypto';

// Simple function to generate an ExpressJS style session ID
function generateSessionId() {
  return createHash('sha256').update(Math.random().toString()).digest('hex');
}

async function loginAdmin() {
  console.log('Logging in as admin...');
  
  try {
    const response = await fetch('http://localhost:3003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'vantalison@gmail.com',
        password: 'powerPUFF7'  // Use the known password from fix-admin-password.js
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error:', errorData);
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Login successful:', data);
    
    // Extract cookies from response headers
    const cookieHeader = response.headers.get('set-cookie');
    if (!cookieHeader) {
      throw new Error('No cookies returned from login');
    }
    
    // Parse the cookies
    const cookies = cookieHeader.split(',').map(cookie => cookie.split(';')[0]).join('; ');
    
    return cookies;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

async function fetchAnalytics(cookies) {
  console.log('Fetching analytics data...');
  
  try {
    const response = await fetch('http://localhost:3003/api/admin/analytics', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Analytics fetch error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Analytics data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
}

// Alternative approach using a direct fetch without login
async function fetchPublicAnalytics() {
  console.log('Fetching public analytics data...');
  
  try {
    const response = await fetch('http://localhost:3003/api/analytics/site');
    
    if (!response.ok) {
      console.error('Public analytics fetch error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Failed to fetch public analytics: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Public analytics data:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching public analytics:', error);
    throw error;
  }
}

// Main function to run the tests
async function runTests() {
  try {
    console.log('Starting analytics endpoint tests...');
    
    // Test public analytics endpoint (doesn't require auth)
    console.log('\n--- Testing public analytics endpoint ---');
    await fetchPublicAnalytics();
    
    // Try running admin analytics endpoint test
    console.log('\n--- Testing admin analytics endpoint ---');
    try {
      const cookies = await loginAdmin();
      await fetchAnalytics(cookies);
    } catch (error) {
      console.error('Admin analytics test failed:', error.message);
    }
    
    console.log('\nTests completed');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

// Run the tests
runTests();