/**
 * Simple Screenshot Script using Fetch
 * 
 * This script fetches the HTML content from the local server
 * and checks for expected elements, bypassing the need for Puppeteer.
 */

import fetch from 'node-fetch';
import * as fs from 'fs';

async function checkPage() {
  console.log('Starting page check...');
  
  try {
    // Fetch the homepage HTML
    const response = await fetch('http://localhost:3001/');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Save the HTML content to a file for inspection
    fs.writeFileSync('homepage-content.html', html);
    console.log('✅ HTML content saved to homepage-content.html');
    
    // Basic checks for expected elements
    const checks = [
      { name: 'Root div', pattern: '<div id="root"', required: true },
      { name: 'Loading screen component', pattern: 'loading-screen', required: false },
      { name: 'Table of contents', pattern: 'table-of-contents', required: false },
      { name: 'Navigation bar', pattern: 'navigation-bar', required: false }
    ];
    
    console.log('\nPage Content Analysis:');
    console.log('---------------------');
    
    checks.forEach(check => {
      const found = html.includes(check.pattern);
      console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'Found' : 'Not found'}${check.required && !found ? ' (REQUIRED)' : ''}`);
    });
    
    // Check for fullwidth CSS
    const hasFullwidthStyles = html.includes('fullwidth') || html.includes('full-width') || html.includes('width: 100%') || html.includes('width:100%');
    console.log(`${hasFullwidthStyles ? '✅' : '❓'} Fullwidth styles: ${hasFullwidthStyles ? 'Detected' : 'Not explicitly found'}`);
    
    console.log('\nAnalysis complete! Check homepage-content.html for full HTML content.');
  } catch (error) {
    console.error('Error checking page:', error.message);
  }
}

checkPage();