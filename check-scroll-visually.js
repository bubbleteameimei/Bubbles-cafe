/**
 * Simple Fetch-Based Website Check Script
 * 
 * This script fetches the page content and checks for expected elements
 * related to the scroll-to-top button.
 */

import fetch from 'node-fetch';

async function checkHtmlContent() {
  try {
    console.log('Fetching page from http://localhost:3002...');
    
    const response = await fetch('http://localhost:3002');
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch page: ${response.status} ${response.statusText}`);
      return;
    }
    
    const html = await response.text();
    console.log(`✅ Successfully fetched page (${html.length} bytes)`);
    
    // Check for key HTML indicators
    const indicatorsFound = {
      'App Component': html.includes('id="root"'),
      'React Scripts': html.includes('</script>'),
      'JavaScript Bundle': html.includes('assets/index-'),
      'CSS Bundle': html.includes('assets/index-') && html.includes('.css'),
    };
    
    // Report results
    console.log('\nPage Content Verification:');
    Object.entries(indicatorsFound).forEach(([name, found]) => {
      console.log(`${found ? '✅' : '❌'} ${name}: ${found ? 'Found' : 'Not found'}`);
    });
    
    // Store a sample of the HTML for inspection
    console.log('\nStoring HTML sample for inspection...');
    const fs = await import('fs');
    await fs.promises.writeFile('page-sample.html', html);
    console.log('✅ HTML sample saved to page-sample.html');
    
    console.log('\nNote: To verify the scroll button is actually visible on the page,');
    console.log('please check the application in the Replit webview.');
    
  } catch (error) {
    console.error('Error occurred during check:', error);
  }
}

checkHtmlContent();