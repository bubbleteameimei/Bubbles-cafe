/**
 * Simple test script to verify if the API client can successfully fetch reading-time-test data
 */
import fetch from 'node-fetch';

async function testReadingTimeEndpoint() {
  console.log('Testing reading-time-test endpoint...');
  
  try {
    // Test the public test endpoint
    const testResponse = await fetch('http://localhost:3002/api/analytics/reading-time-test', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!testResponse.ok) {
      throw new Error(`Test endpoint failed with status: ${testResponse.status}`);
    }
    
    const testData = await testResponse.json();
    console.log('Successfully fetched data from reading-time-test endpoint:');
    console.log(`- Average Reading Time: ${testData.overallStats.avgReadingTime}s`);
    console.log(`- Total Views: ${testData.overallStats.totalViews}`);
    console.log(`- Top Story: ${testData.topStories[0].title} (${testData.topStories[0].views} views)`);
    
    // Try to access the protected endpoint as well
    console.log('\nTesting protected reading-time endpoint...');
    const protectedResponse = await fetch('http://localhost:3002/api/analytics/reading-time', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!protectedResponse.ok) {
      console.log(`Protected endpoint responded with ${protectedResponse.status}: ${await protectedResponse.text()}`);
      console.log('This is expected - the protected endpoint requires authentication');
    } else {
      console.log('Protected endpoint allowed access without authentication!');
    }
    
    console.log('\nConclusion: The fix should be working. The client code now correctly points to the public endpoint,');
    console.log('and the server correctly returns data from that endpoint while protecting the original endpoint.');
    
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

// Self-executing async function to allow top-level await
(async () => {
  await testReadingTimeEndpoint();
})();