/**
 * Test Search API
 * 
 * This script tests the search API to verify it's working correctly.
 */

import fetch from 'node-fetch';

async function testSearch() {
  try {
    console.log('Testing search API with query "blood"...');
    const response = await fetch('http://localhost:3001/api/search?q=blood');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Search results:');
    console.log(JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('Search test failed:', error.message);
    return null;
  }
}

testSearch();