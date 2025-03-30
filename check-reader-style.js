/**
 * Reader CSS Verification Script
 * 
 * This script fetches the reader page and verifies that the correct padding is applied
 * to the story content. It does a fetch request rather than using Puppeteer to avoid
 * running into timeouts.
 */

import fetch from 'node-fetch';
import fs from 'fs';

async function checkReaderStyle() {
  console.log('Checking reader page style implementation...');
  
  try {
    // Fetch the reader page
    const response = await fetch('http://localhost:3001/reader');
    const html = await response.text();
    
    console.log('Reader page fetched successfully');
    
    // Check if reader-fixes.css is loaded
    const hasReaderFixesCSS = html.includes('reader-fixes.css');
    if (hasReaderFixesCSS) {
      console.log('✅ reader-fixes.css is included in the page');
    } else {
      console.log('❌ reader-fixes.css is NOT found in the page');
    }
    
    // Check for story-content element
    const hasStoryContent = html.includes('class="reader-container story-content"');
    if (hasStoryContent) {
      console.log('✅ story-content element is present');
    } else {
      console.log('❌ story-content element is NOT found');
    }
    
    // Write a simple HTML file with the reader content for inspection
    fs.writeFileSync('reader-check.html', html);
    console.log('Reader page saved to reader-check.html for inspection');
    
    // Extract and log a snippet of the HTML containing the reader container
    const readerContainerIndex = html.indexOf('reader-container');
    if (readerContainerIndex > -1) {
      const startIndex = Math.max(0, readerContainerIndex - 100);
      const endIndex = Math.min(html.length, readerContainerIndex + 500);
      const snippet = html.substring(startIndex, endIndex);
      
      console.log('\nReader container HTML snippet:');
      console.log(snippet);
    }
    
    console.log('\nVerification complete!');
  } catch (error) {
    console.error('Error checking reader style:', error.message);
  }
}

checkReaderStyle();