/**
 * Admin Login Test Script
 * 
 * This script tests the admin login functionality to verify our bcrypt fix
 */
import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    console.log('Testing admin login with credentials:');
    console.log('- Email: admin@bubblescafe.com');
    console.log('- Password: powerPUFF7');
    
    // First, make a request to get a CSRF token
    const csrfResponse = await fetch('http://localhost:3001/api/health');
    
    if (!csrfResponse.ok) {
      console.error('Error fetching CSRF token:', await csrfResponse.text());
      return;
    }
    
    // Get cookies from response headers
    const cookies = csrfResponse.headers.get('set-cookie');
    console.log('Received cookies:', cookies || 'None');
    
    // Extract CSRF token from cookies
    let csrfToken = '';
    if (cookies) {
      const match = cookies.match(/csrf-token=([^;]+)/);
      if (match) {
        csrfToken = match[1];
        console.log('Found CSRF token:', csrfToken);
      }
    }
    
    // Now attempt to login with admin credentials
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || '',
        'csrf-token': csrfToken || ''
      },
      body: JSON.stringify({
        email: 'admin@bubblescafe.com',
        password: 'powerPUFF7'
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('Login failed with status:', loginResponse.status);
      console.error('Error message:', errorText);
      return;
    }
    
    const loginResult = await loginResponse.json();
    console.log('Login successful! User details:');
    console.log('- ID:', loginResult.id);
    console.log('- Username:', loginResult.username);
    console.log('- Email:', loginResult.email);
    console.log('- Admin status:', loginResult.isAdmin ? 'Administrator' : 'Regular user');
    
    // Now check auth status to confirm we're logged in
    const statusResponse = await fetch('http://localhost:3001/api/auth/status', {
      headers: {
        'Cookie': loginResponse.headers.get('set-cookie') || cookies || ''
      }
    });
    
    const statusResult = await statusResponse.json();
    console.log('\nAuthentication status check:');
    console.log('- Authenticated:', statusResult.isAuthenticated);
    if (statusResult.isAuthenticated) {
      console.log('- Logged in as:', statusResult.user.username);
    }
    
    console.log('\n✅ Authentication test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testAdminLogin();