/**
 * Simple test to check if the background is visible
 */

import http from 'http';
import fs from 'fs';

async function fetchHomepage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001/', (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        resolve(body);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function checkStyles() {
  try {
    // Fetch the homepage HTML
    console.log('Fetching homepage...');
    const html = await fetchHomepage();
    
    // Look for main container class
    console.log('\n=== Checking Main Container Classes ===');
    const containerRegex = /<div\s+class="[^"]*relative\s+min-h-screen\s+([^"]*)"/;
    const containerMatch = html.match(containerRegex);
    
    if (containerMatch) {
      console.log('Found main container with classes:', containerMatch[0]);
      
      // Check if background color class is present
      if (containerMatch[0].includes('bg-background')) {
        console.log('❌ ISSUE: Container still has bg-background class');
      } else if (containerMatch[0].includes('bg-transparent')) {
        console.log('✅ SUCCESS: Container has bg-transparent class');
      } else {
        console.log('⚠️ WARNING: Container has neither bg-background nor bg-transparent');
      }
    } else {
      console.log('Could not find main container in HTML');
    }
    
    // Check for background image styles
    console.log('\n=== Checking Background Image CSS ===');
    if (html.includes('background-image: url') || html.includes('background: url')) {
      console.log('✅ Found background image CSS in the page');
    } else {
      console.log('❌ Could not find background image CSS');
    }
    
    // Check for z-index styles
    console.log('\n=== Checking Z-Index Values ===');
    if (html.includes('z-index: -10') || html.includes('z-index:-10')) {
      console.log('✅ Found z-index: -10 which should place background behind content');
    } else {
      console.log('⚠️ Could not find specific z-index: -10 for background');
    }
    
    // Save the HTML for inspection
    fs.writeFileSync('./homepage-check.html', html);
    console.log('\nSaved HTML to homepage-check.html for manual inspection');
    
    console.log('\nTest completed!');
  } catch (error) {
    console.error('Error testing background:', error);
  }
}

checkStyles();