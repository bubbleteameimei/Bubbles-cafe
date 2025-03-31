/**
 * Simple Admin Menu Check using Direct HTML Inspection
 * This script fetches the HTML and checks for the simplified admin menu structure
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkAdminMenu() {
  try {
    console.log('Checking admin menu implementation in sidebar-menu.tsx...');
    
    // Define paths to check
    const sidebarMenuPath = path.join('client', 'src', 'components', 'ui', 'sidebar-menu.tsx');
    
    // Check if files exist
    if (!fs.existsSync(sidebarMenuPath)) {
      console.error(`File not found: ${sidebarMenuPath}`);
      return;
    }
    
    // Read the sidebar menu file
    const fileContent = fs.readFileSync(sidebarMenuPath, 'utf8');
    
    // Define the expected menu items
    const expectedMenuItems = [
      'Dashboard',
      'Content Management',
      'User Management',
      'Insights & Reports'
    ];
    
    // Check if each menu item is present
    const results = expectedMenuItems.map(item => {
      const found = fileContent.includes(`<span>${item}</span>`);
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
    
    // Check each merged section for proper route handling
    console.log('\nRoute Consolidation Check:');
    console.log('-------------------------');
    
    // Content Management
    const contentManagementRoutesFound = fileContent.includes('/admin/stories') && 
      fileContent.includes('/admin/content') && 
      fileContent.includes('/admin/wordpress-sync');
    
    console.log(`Content Management routes: ${contentManagementRoutesFound ? '✅ Found' : '❌ Not found'}`);
    
    // User Management
    const userManagementRoutesFound = fileContent.includes('/admin/users') && 
      fileContent.includes('/admin/content-moderation');
    
    console.log(`User Management routes: ${userManagementRoutesFound ? '✅ Found' : '❌ Not found'}`);
    
    // Insights & Reports
    const insightsRoutesFound = fileContent.includes('/admin/analytics') && 
      fileContent.includes('/admin/site-statistics') &&
      fileContent.includes('/admin/feedback') &&
      fileContent.includes('/admin/bug-reports');
    
    console.log(`Insights & Reports routes: ${insightsRoutesFound ? '✅ Found' : '❌ Not found'}`);
    
    const routesScore = [contentManagementRoutesFound, userManagementRoutesFound, insightsRoutesFound]
      .filter(Boolean).length;
    
    // Final assessment
    const totalScore = foundCount + routesScore;
    const maxScore = expectedMenuItems.length + 3; // 4 menu items + 3 route groups
    const percentComplete = Math.round((totalScore / maxScore) * 100);
    
    console.log(`\nImplementation Score: ${percentComplete}%`);
    
    if (percentComplete >= 90) {
      console.log('\n🎉 SUCCESS: Admin menu consolidation has been successfully implemented!');
    } else if (percentComplete >= 70) {
      console.log('\n⚠️ PARTIAL SUCCESS: Most of the admin menu consolidation is complete, but some elements may be missing.');
    } else {
      console.log('\n❌ FAILED: Admin menu consolidation has not been properly implemented.');
    }
    
  } catch (error) {
    console.error('Error checking admin menu:', error);
  }
}

// Run the check
checkAdminMenu();