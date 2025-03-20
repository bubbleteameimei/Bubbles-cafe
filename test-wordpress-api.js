// Test script for WordPress API integration

async function testWordPressApi() {
  console.log('Testing WordPress API integration...');
  
  try {
    // Direct API call to WordPress
    console.log('1. Testing direct WordPress API call:');
    const wpResponse = await fetch('https://public-api.wordpress.com/wp/v2/sites/bubbleteameimei.wordpress.com/posts?per_page=1');
    
    if (!wpResponse.ok) {
      throw new Error(`WordPress API responded with status: ${wpResponse.status}`);
    }
    
    const wpData = await wpResponse.json();
    console.log(`Success! Retrieved ${wpData.length} posts directly from WordPress API`);
    console.log(`First post title: "${wpData[0]?.title?.rendered}"`);
    
    // Test our local API
    console.log('\n2. Testing application posts API:');
    const localResponse = await fetch('http://localhost:3000/api/posts?page=1&limit=2');
    
    if (!localResponse.ok) {
      throw new Error(`Local API responded with status: ${localResponse.status}`);
    }
    
    const localData = await localResponse.json();
    console.log(`Success! Retrieved ${localData.posts?.length} posts from local API`);
    console.log(`First post title: "${localData.posts[0]?.title}"`);
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing WordPress API:', error);
  }
}

// Run the test
testWordPressApi();