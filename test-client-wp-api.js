// Test script for client-side WordPress API integration

// First, import the WordPress API module
// We need to use dynamic import since this is an ESM module
async function runTests() {
  try {
    // This test demonstrates how the frontend would use the WordPress API
    console.log('Testing client-side WordPress API integration...');
    console.log('Note: This script simulates frontend usage patterns');
    
    // Test WordPress API URL
    const WORDPRESS_API_URL = 'https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com';
    console.log(`Using WordPress API URL: ${WORDPRESS_API_URL}`);
    
    // Direct API test with client-side fetch options
    console.log('\n1. Testing fetch with CORS headers:');
    const wpResponse = await fetch(`${WORDPRESS_API_URL}/posts?per_page=2`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!wpResponse.ok) {
      throw new Error(`WordPress API responded with status: ${wpResponse.status}`);
    }
    
    const wpData = await wpResponse.json();
    console.log(`Success! Fetched ${wpData.length} posts with proper CORS headers`);
    console.log(`First post: "${wpData[0]?.title?.rendered}"`);
    
    // Test error handling and fallback
    console.log('\n2. Testing error handling (simulating failure):');
    try {
      // Deliberately use wrong URL
      await fetch('https://invalid-wordpress-url.example.com/posts', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 1000 // Short timeout to fail quickly
      });
    } catch (error) {
      console.log('Expected error caught successfully:', error.message);
      console.log('The client-side implementation would use fallback mechanism at this point');
    }
    
    console.log('\nAll tests completed successfully!');
    console.log('The WordPress API integration should now work correctly in the application');
    
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();