/**
 * Search API Comprehensive Test Report
 * 
 * This script generates a detailed report of search functionality
 * by testing multiple queries and analyzing the response structure.
 */

import fetch from 'node-fetch';
import fs from 'fs';

async function generateSearchReport() {
  const results = [];
  
  // Log to both console and array for file output
  const log = message => {
    console.log(message);
    results.push(message);
  };
  
  log('=== SEARCH FUNCTIONALITY TEST REPORT ===');
  log('Date: ' + new Date().toISOString());
  log('\n');
  
  const testQueries = [
    'blood', // Horror content
    'shadow', // Atmospheric content 
    'help', // Potential help pages
    'privacy', // Policy content
    'about', // About page content
    'security', // Settings pages
    'notification' // Settings pages
  ];
  
  const allContentTypes = {};
  
  for (const query of testQueries) {
    log(`\n=== TESTING QUERY: "${query}" ===`);
    
    try {
      const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        log(`❌ Error fetching results for query "${query}": ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      const totalResults = data.results.length;
      
      log(`✓ Found ${totalResults} results for "${query}"`);
      
      // Analyze content types returned
      const typeCount = {};
      data.results.forEach(result => {
        typeCount[result.type] = (typeCount[result.type] || 0) + 1;
        allContentTypes[result.type] = (allContentTypes[result.type] || 0) + 1;
      });
      
      log('\nResults by content type:');
      Object.entries(typeCount).forEach(([type, count]) => {
        log(`- ${type}: ${count} results (${Math.round(count/totalResults*100)}%)`);
      });
      
      // Show detailed sample of first few results
      log('\nSample results:');
      data.results.slice(0, 2).forEach((result, index) => {
        log(`\n[${index + 1}] ${result.title} (${result.type})`);
        log(`    URL: ${result.url}`);
        log(`    Excerpt: ${result.excerpt.substring(0, 100)}...`);
        
        // Check if there are matches
        if (result.matches && result.matches.length > 0) {
          log(`    Match Context: "${result.matches[0].context.substring(0, 50)}..."`);
        }
      });
      
    } catch (error) {
      log(`❌ Error processing query "${query}":`, error.message);
    }
  }
  
  log('\n=== SEARCH CONTENT TYPE SUMMARY ===');
  log('Content types found across all queries:');
  
  Object.entries(allContentTypes)
    .sort((a, b) => b[1] - a[1]) // Sort by count (highest first)
    .forEach(([type, count]) => {
      log(`- ${type}: ${count} occurrences`);
    });
  
  log('\n=== SEARCH FUNCTIONALITY TEST COMPLETE ===');
  
  // Write results to a file
  fs.writeFileSync('search-test-results.txt', results.join('\n'));
  console.log('Results saved to search-test-results.txt');
}

generateSearchReport();