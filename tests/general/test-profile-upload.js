import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Function to login and get a session cookie
async function login() {
  console.log('Logging in...');
  
  try {
    const loginCommand = `curl -X POST -c cookies.txt -H "Content-Type: application/json" -d '{"email":"vantalison@gmail.com","password":"powerPUFF7"}' http://localhost:3001/api/auth/login`;
    
    const { stdout, stderr } = await execPromise(loginCommand);
    
    if (stderr) {
      console.error(`Login stderr: ${stderr}`);
    }
    
    console.log('Login response:', stdout);
    
    try {
      const response = JSON.parse(stdout);
      if (response.id && response.email) {
        console.log('✅ Login successful!');
        return true;
      } else if (response.message && response.message.includes('Invalid')) {
        console.log('❌ Login failed!');
        console.log('Error:', response.message);
        return false; 
      } else {
        console.log('❌ Login failed!');
        console.log('Error:', response.error || 'Unknown error');
        return false;
      }
    } catch (parseError) {
      console.error('Error parsing login response:', parseError);
      return false;
    }
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    return false;
  }
}

// Function to test profile image upload
async function testProfileImageUpload() {
  try {
    console.log('Starting profile image upload test...');
    
    // Step 1: Login to get a session cookie
    const loggedIn = await login();
    
    if (!loggedIn) {
      console.log('Skipping image upload test because login failed.');
      return;
    }
    
    // Step 2: Create a curl command to upload a test image
    const curlCommand = `curl -X PATCH -b cookies.txt -F "username=testuser" -F "fullName=Test User" -F "bio=This is a test bio." -F "profileImage=@./test_image.png" http://localhost:3001/api/auth/profile-with-image`;
    
    // Step 3: Execute the curl command
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error(`Curl stderr: ${stderr}`);
    }
    
    console.log('Profile image upload response:');
    console.log(stdout);
    
    // Try to parse the response
    try {
      const response = JSON.parse(stdout);
      console.log('Parsed response:', response);
      
      if (response.id && response.email) {
        console.log('✅ Profile image upload test passed!');
        console.log('Updated profile:', response);
        return true;
      } else if (response.message) {
        console.log('❌ Profile image upload test failed!');
        console.log('Error:', response.message);
        return false;
      } else if (response.error) {
        console.log('❌ Profile image upload test failed!');
        console.log('Error:', response.error);
        return false;
      } else {
        console.log('❌ Profile image upload test failed!');
        console.log('Error: Unknown error');
        return false;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.log('Raw response:', stdout);
    }
  } catch (err) {
    console.error('Error running profile image upload test:', err);
  }
}

// Run the test
testProfileImageUpload();