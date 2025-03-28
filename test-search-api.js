/**
 * Test Script for Search API
 * 
 * This script tests the search API with the new default settings and verifies the response.
 */

import fetch from 'node-fetch';

async function testSearch() {
  try {
    const searchQuery = 'blood';
    console.log(`Testing search API with query: "${searchQuery}"`);
    
    const response = await fetch(`http://localhost:3001/api/search?q=${searchQuery}`);
    
    if (!response.ok) {
      throw new Error(`Search request failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`Found ${data.results.length} results`);
    console.log('\nContent types found:');
    
    // Count results by type
    const typeCount = {};
    data.results.forEach(result => {
      typeCount[result.type] = (typeCount[result.type] || 0) + 1;
    });
    
    // Print type counts
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} results`);
    });
    
    console.log('\nFirst 3 results:');
    data.results.slice(0, 3).forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.title} (${result.type})`);
      console.log(`    URL: ${result.url}`);
      console.log(`    Excerpt: ${result.excerpt.substring(0, 100)}...`);
      console.log(`    Matches: ${result.matches.length}`);
    });
    
    console.log('\nSearch test completed successfully');
  } catch (error) {
    console.error('Error testing search API:', error.message);
  }
}

testSearch();