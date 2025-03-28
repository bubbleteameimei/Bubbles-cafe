import fetch from 'node-fetch';

// Test the auth functionality
async function testAuth() {
  console.log("Testing auth functionality...");
  
  try {
    // Test login with invalid credentials
    console.log("\nTesting invalid login...");
    const invalidLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    });
    
    console.log(`Invalid login status: ${invalidLoginResponse.status}`);
    
    // Test registration - note this will only work once for each email
    console.log("\nTesting registration...");
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
      }),
    });
    
    console.log(`Registration status: ${registerResponse.status}`);
    
    if (registerResponse.ok) {
      const userData = await registerResponse.json();
      console.log(`User registered successfully with ID: ${userData.id}`);
    }
    
    // Check auth status
    console.log("\nChecking auth status...");
    const statusResponse = await fetch('http://localhost:5000/api/auth/status');
    const statusData = await statusResponse.json();
    
    console.log(`Auth status: ${JSON.stringify(statusData)}`);
    
    console.log("\nAuth functionality test completed");
    
  } catch (error) {
    console.error("Error testing auth functionality:", error);
  }
}

testAuth();