/**
 * Simple Button Position Check Script
 * 
 * This script performs a fetch request to verify that the GlobalScrollButton 
 * is correctly adding its container to the document body.
 */

import fetch from 'node-fetch';

async function checkButtonPosition() {
  console.log('Checking scroll button position...');
  
  try {
    // Access the root page of the application
    const response = await fetch('http://localhost:3002');
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return;
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Check if our button container is present in the HTML
    const hasButtonContainer = html.includes('global-scroll-button-container');
    
    if (hasButtonContainer) {
      console.log('✅ Button container found in the HTML!');
      console.log('The button should be correctly positioned at the bottom-right corner.');
    } else {
      console.log('❌ Button container not found in the HTML.');
      console.log('This might be because:');
      console.log('1. The GlobalScrollButton is not correctly injecting its container');
      console.log('2. The container is added by JavaScript after the initial HTML load');
      console.log('3. The button is not using the correct ID');
    }
  } catch (error) {
    console.error('Error checking button position:', error);
  }
}

checkButtonPosition();