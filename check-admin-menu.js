/**
 * Simple Admin Menu Check using Direct HTML Inspection
 * This script fetches the HTML and checks for the simplified admin menu structure
 */

import fetch from 'node-fetch';

async function checkAdminMenu() {
  try {
    console.log('Checking admin menu implementation...');
    
    // Get the admin page HTML
    const response = await fetch('http://localhost:3000/admin');
    
    if (!response.ok) {
      console.error(`Failed to fetch admin page: ${response.status} ${response.statusText}`);
      return;
    }
    
    const html = await response.text();
    
    // Define the expected menu items
    const expectedMenuItems = [
      'Dashboard',
      'Content Management',
      'User Management',
      'Insights & Reports'
    ];
    
    // Check for each expected item
    const results = expectedMenuItems.map(item => {
      const found = html.includes(`>${item}<`);
      return { item, found };
    });
    
    // Display results
    console.log('\nAdmin Menu Check Results:');
    console.log('------------------------');
    
    results.forEach(result => {
      console.log(`${result.item}: ${result.found ? '✅ Found' : '❌ Not found'}`);
    });
    
    const foundCount = results.filter(r => r.found).length;
    console.log(`\nFound ${foundCount} out of ${expectedMenuItems.length} expected menu items`);
    
    if (foundCount === expectedMenuItems.length) {
      console.log('\n🎉 SUCCESS: Admin menu consolidation verified in the rendered HTML!');
    } else {
      console.log('\n⚠️ WARNING: Some expected menu items were not found in the rendered HTML.');
    }
    
  } catch (error) {
    console.error('Error checking admin menu:', error);
  }
}

// Run the check
checkAdminMenu();