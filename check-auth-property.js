/**
 * Simple auth property verification script
 * 
 * This script fetches the authentication state and verifies
 * that the isAuthenticated property is correctly accessible.
 */

import fetch from 'node-fetch';

async function checkAuthState() {
  console.log('Checking auth state consistency...');
  
  try {
    // Fetch the auth state endpoint
    const response = await fetch('http://localhost:3002/api/auth/status');
    
    if (!response.ok) {
      console.error(`Error fetching auth state: ${response.status} ${response.statusText}`);
      return;
    }
    
    const authData = await response.json();
    console.log('Auth data received:');
    console.log(JSON.stringify(authData, null, 2));
    
    // Check property naming
    if ('isAuthenticated' in authData) {
      console.log('✅ Auth data has isAuthenticated property');
    } else {
      console.error('❌ Auth data is missing isAuthenticated property');
    }
    
    if ('authenticated' in authData) {
      console.log('⚠️ Auth data still has the old authenticated property');
    } else {
      console.log('✅ Auth data does not have the old authenticated property');
    }
    
  } catch (error) {
    console.error('Error checking auth state:', error);
  }
}

checkAuthState();