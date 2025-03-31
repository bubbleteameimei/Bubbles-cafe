/**
 * Simple script to check the footer layout using fetch
 */
import fetch from 'node-fetch';

async function checkFooter() {
  console.log('Checking footer layout...');
  
  try {
    console.log('Fetching homepage content...');
    const response = await fetch('http://localhost:3000/');
    const htmlContent = await response.text();
    
    console.log('Analyzing footer content...');
    
    // Check if footer contains the copyright text
    const hasCopyright = htmlContent.includes('© Bubble\'s Cafe') && 
                      htmlContent.includes('All rights reserved');
    
    // Check if links are present
    const hasLinks = htmlContent.includes('About') && 
                    htmlContent.includes('Contact') &&
                    htmlContent.includes('Privacy') &&
                    htmlContent.includes('Terms');
    
    // Check if centered layout classes are present
    const hasCenteredLayout = 
      htmlContent.includes('items-center') && 
      htmlContent.includes('justify-center') && 
      htmlContent.includes('text-center');
    
    const results = {
      hasCopyright,
      hasLinks,
      hasCenteredLayout
    };
    
    console.log('Footer layout check results:', results);
    
    if (hasCopyright && hasLinks && hasCenteredLayout) {
      console.log('SUCCESS: Footer appears to be properly centered with copyright and links!');
    } else {
      console.log('WARNING: Footer may not be properly formatted:');
      if (!hasCopyright) console.log('- Copyright text not found');
      if (!hasLinks) console.log('- Navigation links not found');
      if (!hasCenteredLayout) console.log('- Centered layout classes not found');
    }
    
    return results;
  } catch (error) {
    console.error('Error checking footer:', error.message);
    return { error: error.message };
  }
}

// Run the check
checkFooter();