/**
 * Profile Update Test Script
 * 
 * This script tests updating a user's profile by:
 * 1. Logging in as an existing user
 * 2. Getting the current profile data
 * 3. Updating the profile with new metadata
 * 4. Verifying the metadata was saved correctly
 */

// Use the global fetch API built into Node.js
const BASE_URL = 'http://localhost:3002';

// Store cookies between requests for maintaining session
let cookieString = '';

async function loginUser(email, password) {
  console.log(`Logging in as ${email}...`);
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  
  // Save cookies for future requests
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookieString = setCookie;
    console.log('Session cookies received');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Login failed:', data);
    throw new Error('Login failed');
  }
  
  console.log('Login successful!');
  return data;
}

async function getProfile() {
  console.log('Fetching profile...');
  
  const response = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: cookieString ? {
      'Cookie': cookieString,
    } : {},
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Profile fetch failed:', data);
    throw new Error('Profile fetch failed');
  }
  
  console.log('Profile fetched successfully!');
  return data;
}

async function updateProfile(profileData) {
  console.log('Updating profile...');
  
  const response = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieString ? { 'Cookie': cookieString } : {})
    },
    body: JSON.stringify(profileData),
    credentials: 'include',
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('Profile update failed:', data);
    throw new Error('Profile update failed');
  }
  
  console.log('Profile updated successfully!');
  return data;
}

async function testProfileUpdate() {
  try {
    // Use the admin user with the updated password
    await loginUser('vantalison@gmail.com', 'testpassword123');
    
    // Get current profile
    const profile = await getProfile();
    console.log('Current profile:', profile);
    
    // Create update with metadata
    const timestamp = new Date().toISOString();
    const update = {
      username: profile.username, // Keep the same username
      metadata: {
        displayName: `Test Name ${timestamp.substring(11, 19)}`,
        bio: `Test bio updated at ${timestamp}`,
        photoURL: 'https://example.com/avatar.png',
      }
    };
    
    // Update profile
    await updateProfile(update);
    
    // Verify update by fetching profile again
    const updatedProfile = await getProfile();
    console.log('Updated profile:', updatedProfile);
    
    // Verify metadata was saved
    if (updatedProfile.fullName === update.metadata.displayName &&
        updatedProfile.bio === update.metadata.bio &&
        updatedProfile.avatar === update.metadata.photoURL) {
      console.log('✅ SUCCESS: Profile metadata was saved correctly!');
    } else {
      console.log('❌ FAIL: Profile metadata was not saved correctly!');
      console.log('Expected:', update.metadata);
      console.log('Actual:', {
        displayName: updatedProfile.fullName,
        bio: updatedProfile.bio,
        photoURL: updatedProfile.avatar
      });
    }
    
  } catch (error) {
    console.error('Error during profile test:', error);
  }
}

testProfileUpdate();