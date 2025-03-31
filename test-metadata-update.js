/**
 * Profile metadata update test script
 * 
 * This script tests updating a user's profile metadata to verify the fix
 */

const BASE_URL = 'http://localhost:3002';
let cookieString = '';

// Function to handle login and get session cookie
async function login() {
  console.log('Logging in as vantalison@gmail.com...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'vantalison@gmail.com',
      password: 'password123'
    }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const data = await response.json();
    console.error('Login failed:', data);
    throw new Error('Login failed');
  }
  
  // Save cookies for future requests
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookieString = setCookie;
    console.log('Session cookies received:', cookieString);
  }
  
  const data = await response.json();
  console.log('Login successful!');
  return data;
}

// Function to update user profile metadata
async function updateProfileMetadata() {
  console.log('Updating profile metadata...');
  
  const timestamp = new Date().toISOString();
  const metadata = {
    fullName: `Test User ${timestamp.substring(11, 19)}`,
    bio: `Test bio updated at ${timestamp}`,
    avatar: 'https://example.com/avatar.png'
  };
  
  const response = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieString ? { 'Cookie': cookieString } : {})
    },
    body: JSON.stringify({ metadata }),
    credentials: 'include'
  });
  
  if (!response.ok) {
    const data = await response.json();
    console.error('Profile update failed:', data);
    throw new Error('Profile update failed');
  }
  
  const data = await response.json();
  console.log('Profile metadata updated successfully!');
  return data;
}

// Function to get current user profile
async function getProfile() {
  console.log('Fetching user profile...');
  
  const response = await fetch(`${BASE_URL}/api/auth/profile`, {
    headers: cookieString ? {
      'Cookie': cookieString
    } : {},
    credentials: 'include'
  });
  
  if (!response.ok) {
    const data = await response.json();
    console.error('Profile fetch failed:', data);
    throw new Error('Profile fetch failed');
  }
  
  const data = await response.json();
  console.log('Profile fetched successfully!');
  return data;
}

// Function to check database state
async function checkDatabase() {
  console.log('Checking database state with direct SQL query...');
  
  // This function would typically use the execute_sql_tool but we'll leave it as a placeholder
  // and run the SQL separately in our test
  console.log('Please run: SELECT id, username, email, metadata FROM users WHERE email = \'vantalison@gmail.com\';');
}

async function runTest() {
  try {
    // Step 1: Login
    await login();
    
    // Step 2: Get initial profile
    const initialProfile = await getProfile();
    console.log('Initial profile:', initialProfile);
    
    // Step 3: Update profile metadata
    const updateResult = await updateProfileMetadata();
    console.log('Update result:', updateResult);
    
    // Step 4: Get updated profile to verify
    const updatedProfile = await getProfile();
    console.log('Updated profile:', updatedProfile);
    
    // Step 5: Verify the metadata was saved correctly
    const timestamp = updateResult.fullName.split(' ')[2]; // Extract timestamp from fullName
    console.log('\n--- Verification Results ---');
    console.log('Timestamp from update:', timestamp);
    
    if (updatedProfile.fullName === updateResult.fullName &&
        updatedProfile.bio === updateResult.bio &&
        updatedProfile.avatar === updateResult.avatar) {
      console.log('✅ SUCCESS: Profile metadata was saved correctly!');
    } else {
      console.log('❌ FAIL: Profile metadata was not saved correctly!');
      console.log('Expected:', {
        fullName: updateResult.fullName,
        bio: updateResult.bio,
        avatar: updateResult.avatar
      });
      console.log('Actual:', {
        fullName: updatedProfile.fullName,
        bio: updatedProfile.bio,
        avatar: updatedProfile.avatar
      });
    }
    
    // Step 6: Check database state (manual step)
    checkDatabase();
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

runTest();