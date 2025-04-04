/**
 * User Profile Update Test Script
 * 
 * This script tests the metadata handling in the user profile update functionality.
 * It makes API calls to update a user's profile metadata and verifies that
 * the metadata is properly merged instead of being replaced.
 */

// Using global fetch API (available in Node.js v18+)
import bcrypt from 'bcryptjs';
import pg from 'pg';
const { Pool } = pg;

async function testProfileUpdate() {
  console.log('Starting profile update test...');
  
  // Step 1: Create a user session by logging in
  console.log('Step 1: Logging in to create a session...');
  let sessionCookies = '';
  
  try {
    const loginResponse = await fetch('http://0.0.0.0:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      }),
      redirect: 'manual'
    });
    
    // Extract cookies from the response
    const cookies = loginResponse.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
      sessionCookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');
      console.log('Login successful, cookies obtained');
    } else {
      console.log('Login failed: No cookies returned');
      const loginResponseText = await loginResponse.text();
      console.log('Login response:', loginResponseText);
      return;
    }
  } catch (error) {
    console.error('Login error:', error);
    return;
  }
  
  // Step 2: Get current user profile to see existing metadata and CSRF token
  console.log('\nStep 2: Getting current user profile and CSRF token...');
  let userId = null;
  let currentMetadata = null;
  let csrfToken = null;
  
  try {
    // First get CSRF token by visiting the home page
    const homeResponse = await fetch('http://0.0.0.0:3002/', {
      headers: {
        'Cookie': sessionCookies
      }
    });
    
    // Extract CSRF token from the response cookies
    const cookies = homeResponse.headers.getSetCookie();
    if (cookies && cookies.length > 0) {
      // Find the CSRF token cookie
      const csrfCookie = cookies.find(cookie => cookie.startsWith('XSRF-TOKEN='));
      if (csrfCookie) {
        csrfToken = decodeURIComponent(csrfCookie.split(';')[0].replace('XSRF-TOKEN=', ''));
        console.log('CSRF token obtained');
      }
    }
    
    // Now get user profile
    const profileResponse = await fetch('http://0.0.0.0:3002/api/auth/profile', {
      headers: {
        'Cookie': sessionCookies
      }
    });
    
    if (profileResponse.ok) {
      const userData = await profileResponse.json();
      userId = userData.id;
      currentMetadata = userData.metadata || {};
      
      console.log('Current user profile:');
      console.log('- User ID:', userId);
      console.log('- Username:', userData.username);
      console.log('- Current metadata:', JSON.stringify(currentMetadata, null, 2));
    } else {
      console.log('Failed to get user profile:', await profileResponse.text());
      return;
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    return;
  }
  
  // Step 3: Update user profile with new metadata
  console.log('\nStep 3: Updating user profile with new metadata...');
  
  const newMetadataValue = {
    testField: 'This is a test value',
    updatedAt: new Date().toISOString()
  };
  
  try {
    const updateResponse = await fetch('http://0.0.0.0:3002/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookies,
        'X-XSRF-TOKEN': csrfToken  // Add CSRF token to headers
      },
      body: JSON.stringify({
        metadata: newMetadataValue
      })
    });
    
    if (updateResponse.ok) {
      const updatedData = await updateResponse.json();
      console.log('Profile update successful:');
      console.log('- Updated metadata:', JSON.stringify(updatedData.user.metadata, null, 2));
      
      // Verify if existing fields were preserved
      let allFieldsPreserved = true;
      for (const key in currentMetadata) {
        if (key !== 'testField' && key !== 'updatedAt') {
          if (!(key in updatedData.user.metadata)) {
            console.log(`❌ Field '${key}' was not preserved in the update!`);
            allFieldsPreserved = false;
          }
        }
      }
      
      if (allFieldsPreserved) {
        console.log('✅ All existing metadata fields were properly preserved');
      }
      
      // Verify new fields were added
      if ('testField' in updatedData.user.metadata && 'updatedAt' in updatedData.user.metadata) {
        console.log('✅ New metadata fields were properly added');
      } else {
        console.log('❌ New metadata fields were not added correctly');
      }
    } else {
      console.log('Failed to update profile:', await updateResponse.text());
    }
  } catch (error) {
    console.error('Profile update error:', error);
  }
  
  console.log('\nProfile update test completed');
}

// Export as ESM module
export default testProfileUpdate;

// Run the function
testProfileUpdate();