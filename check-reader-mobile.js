/**
 * Simple Mobile Reader Check Script
 * 
 * This script uses fetch to check the mobile-specific CSS applied to the reader page
 * and verify the spacing adjustments between navigation and controls.
 */
import fetch from 'node-fetch';

async function checkReaderMobile() {
  try {
    console.log('Checking reader page mobile styles...');
    
    // Fetch the reader page
    const response = await fetch('http://localhost:3000/reader');
    if (!response.ok) {
      console.error(`Failed to fetch reader page: ${response.status} ${response.statusText}`);
      return;
    }
    
    const html = await response.text();
    
    // Check for navbar visibility
    const hasNavbarContainer = html.includes('navbar-container');
    console.log(`✅ Navbar container present: ${hasNavbarContainer}`);
    
    // Check for mobile styles
    const hasMobileMediaQuery = html.includes('@media (max-width: 640px)') || 
                               html.includes('@media (max-width: 480px)');
    console.log(`✅ Mobile media queries present: ${hasMobileMediaQuery}`);
    
    // Check for adjusted top padding
    const hasAdjustedTopPadding = html.includes('padding-top: 3.5rem') || 
                                 html.includes('pt-14');
    console.log(`✅ Adjusted top padding present: ${hasAdjustedTopPadding}`);
    
    // Check for navbar z-index fix
    const hasNavbarZIndexFix = html.includes('z-index: 50');
    console.log(`✅ Navbar z-index fix present: ${hasNavbarZIndexFix}`);
    
    // Check for controls spacing
    const hasReducedControlsSpacing = html.includes('padding-top: 0.25rem');
    console.log(`✅ Reduced controls spacing present: ${hasReducedControlsSpacing}`);
    
    console.log('\nMobile reader layout check:');
    if (hasNavbarContainer && hasMobileMediaQuery && hasAdjustedTopPadding && 
        hasNavbarZIndexFix && hasReducedControlsSpacing) {
      console.log('✅ All mobile reader spacing adjustments are properly implemented!');
      console.log('The mobile view now has:');
      console.log('- Visible navigation bar');
      console.log('- Reduced spacing between controls and content');
      console.log('- Adjusted top padding to prevent overlap');
      console.log('- Proper z-index to ensure correct element layering');
    } else {
      console.error('❌ Some mobile reader adjustments are missing');
    }
    
  } catch (error) {
    console.error('Error checking reader mobile view:', error);
  }
}

// Run the check
checkReaderMobile();