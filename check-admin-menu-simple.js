/**
 * Simple Admin Menu Check using Direct HTML Inspection
 * This script fetches the HTML and checks for the simplified admin menu structure
 */

import fetch from 'node-fetch';
import fs from 'node:fs/promises';

async function checkAdminMenu() {
  console.log('Checking admin menu structure using direct HTML inspection');
  
  try {
    const response = await fetch('http://localhost:3000/');
    const html = await response.text();
    
    // Save the HTML for examination
    await fs.writeFile('admin-menu-check.html', html);
    console.log('Saved HTML for inspection to admin-menu-check.html');
    
    // Check for our consolidated menu items in the HTML
    const menuItems = [
      'Dashboard',
      'Content Management',
      'User Management',
      'Insights & Reports'
    ];
    
    // Client-rendered content may not be visible in the source HTML
    // We'll check for React component code that would render these items
    const results = menuItems.map(item => {
      // Look for characteristic patterns in the JavaScript code that would render these items
      const patterns = [
        `>${item}<`, // Direct text content
        `"${item}"`, // As a string literal
        `'${item}'`, // As a string literal with single quotes
        `{item === '${item}'}` // In a conditional
      ];
      
      const found = patterns.some(pattern => html.includes(pattern));
      return { item, found };
    });
    
    console.log('\nAdmin Menu Consolidation Check Results:');
    console.log('--------------------------------------');
    
    let foundCount = 0;
    results.forEach(({ item, found }) => {
      console.log(`${item}: ${found ? 'Found ✅' : 'Not found ❌'}`);
      if (found) foundCount++;
    });
    
    const totalItems = results.length;
    const percentage = Math.round((foundCount / totalItems) * 100);
    
    console.log('\nSummary:');
    console.log(`Found ${foundCount} out of ${totalItems} consolidated menu items (${percentage}%)`);
    
    if (foundCount > 0) {
      console.log('\nNote: Even though items were detected in the HTML, they might not be visible without:');
      console.log('1. Being logged in as an admin user');
      console.log('2. Client-side JavaScript rendering the admin menu');
      
      console.log('\nAdditional evidence of consolidation:');
      // Check for isActive conditions that handle multiple routes (a sign of menu consolidation)
      const hasConsolidatedRoutes = html.includes('location === \'/admin/stories\' || location === \'/admin/content\'') || 
                                    html.includes('location === \'/admin/users\' || location === \'/admin/content-moderation\'') ||
                                    html.includes('location === \'/admin/analytics\' || location === \'/admin/site-statistics\'');
                                    
      console.log(`Multiple route handling detected: ${hasConsolidatedRoutes ? 'Yes ✅' : 'No ❌'}`);
      
      if (hasConsolidatedRoutes) {
        console.log('\n🎉 SUCCESS: Code shows evidence of menu consolidation with multiple route handling!');
      }
    } else {
      console.log('\n❌ FAILED: Could not find evidence of admin menu consolidation in the HTML.');
    }
    
  } catch (error) {
    console.error('Error during admin menu check:', error);
  }
}

checkAdminMenu().catch(console.error);