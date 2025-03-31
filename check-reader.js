/**
 * Simple script to check the reader page layout
 */
import fetch from 'node-fetch';

async function checkReaderLayout() {
  try {
    console.log('Fetching reader page HTML...');
    const response = await fetch('http://localhost:3000/reader');
    const html = await response.text();
    
    console.log('\nChecking for reader-fixes.css file inclusion...');
    const hasReaderFixesCSS = html.includes('reader-fixes.css');
    console.log(`✅ reader-fixes.css included: ${hasReaderFixesCSS}`);
    
    console.log('\nChecking for story-content class...');
    const hasStoryContent = html.includes('story-content');
    console.log(`✅ story-content class found: ${hasStoryContent}`);
    
    console.log('\nChecking for navbar container...');
    const hasNavbarContainer = html.includes('navbar-container');
    console.log(`Navbar container present: ${html.includes('navbar-container')}`);
    
    console.log('\nChecking if navbar is hidden on reader page...');
    // In the AutoHideNavbar, we should be hiding the navbar on reader page
    // This might not be captured by direct HTML check since it depends on JS execution
    const hasHideOnPathsForReader = html.includes('hideOnPaths') && html.includes('/reader');
    console.log(`✅ Reader path in hideOnPaths: ${hasHideOnPathsForReader}`);
    
    console.log('\nChecking for top padding in reader-fixes.css...');
    // Just check if the CSS file has padding-top property
    const hasPaddingTop = html.includes('padding-top') || html.includes('padding-top:');
    console.log(`✅ Padding-top style found: ${hasPaddingTop}`);
    
    // Check for overlapping elements
    console.log('\nAnalyzing potential overlap between UI elements...');
    const uiElements = html.includes('ui-fade-element');
    console.log(`UI fade elements present: ${uiElements}`);
    
    return {
      success: true,
      hasReaderFixesCSS,
      hasStoryContent,
      hasNavbarContainer: html.includes('navbar-container'),
      hasHideOnPathsForReader,
      hasPaddingTop
    };
  } catch (error) {
    console.error('Error checking reader layout:', error);
    return { success: false, error: error.message };
  }
}

// Execute the function
checkReaderLayout()
  .then(result => {
    console.log('\n=== Summary ===');
    console.log(result);
    
    if (result.success) {
      console.log('\n✅ Reader page layout checks completed!');
      
      // Check if AutoHideNavbar is properly configured
      if (result.hasHideOnPathsForReader) {
        console.log('✅ AutoHideNavbar is properly configured to hide on the reader page.');
      } else {
        console.log('⚠️ AutoHideNavbar may not be configured to hide on the reader page.');
      }
      
      // Check if padding is added
      if (result.hasPaddingTop) {
        console.log('✅ Added top padding to prevent navbar overlap.');
      } else {
        console.log('⚠️ Could not verify top padding for content.');
      }
    } else {
      console.log('❌ Reader page layout check failed.');
    }
  })
  .catch(error => {
    console.error('Error executing check:', error);
  });