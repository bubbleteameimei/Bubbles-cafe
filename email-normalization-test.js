// Email Case Sensitivity Test Script
// This script tests the email normalization feature to ensure consistent login
// regardless of email case.

// Simulates a login attempt with different letter cases in the email
async function testEmailCaseSensitivity(email, password) {
  console.log("\n=== EMAIL CASE SENSITIVITY TEST ===");
  console.log(`Testing with original email: ${email}`);
  
  // Create variations of the email with different casings
  const variations = [
    email.toLowerCase(),
    email.toUpperCase(),
    email.charAt(0).toUpperCase() + email.slice(1).toLowerCase(),
    email.split('@')[0].toUpperCase() + '@' + email.split('@')[1].toLowerCase()
  ];
  
  console.log("Testing these email variations:");
  variations.forEach((variation, index) => {
    console.log(`${index + 1}. ${variation}`);
  });
  
  // Test each variation
  for (const emailVariation of variations) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailVariation,
          password: password
        }),
      });
      
      const data = await response.json();
      console.log(`\nLogin attempt with ${emailVariation}:`);
      
      if (response.ok) {
        console.log('✅ SUCCESS: Login successful');
        console.log('User ID:', data.id);
        console.log('Username:', data.username);
      } else {
        console.log('❌ FAILED: Login unsuccessful');
        console.log('Error:', data.message);
      }
    } catch (error) {
      console.error(`❌ FAILED: Error testing ${emailVariation}:`, error);
    }
  }
  
  console.log("\n=== TEST COMPLETE ===");
}

// Function to run the test
// Replace with actual test credentials before running
async function runTest() {
  // Use an email address that exists in your system
  const testEmail = "test@example.com";
  const testPassword = "password123";
  
  await testEmailCaseSensitivity(testEmail, testPassword);
}

// Uncomment and run this in the browser console to test
// runTest();

console.log(`
EMAIL NORMALIZATION TEST SCRIPT
-------------------------------
This script tests whether the email normalization fix is working properly.

To use this script:
1. Log into the application and open your browser's developer console
2. Copy and paste this entire script into the console
3. Change the testEmail and testPassword in the runTest function to match a real account
4. Run the test by typing runTest() in the console

The test will attempt to log in with different variations of the same email address.
All attempts should succeed if email normalization is working correctly.
`);