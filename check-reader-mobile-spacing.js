/**
 * Simple Reader Mobile Spacing Check Script
 * 
 * This script validates that the CSS changes to reduce space between 
 * reader header and controls in mobile view have been properly implemented.
 */

import fs from 'fs';
import path from 'path';

function checkReaderCSSforMobileSpacing() {
  console.log('Checking reader-fixes.css for mobile spacing adjustments...');
  
  const readerFixesPath = path.join('client', 'src', 'styles', 'reader-fixes.css');
  
  if (!fs.existsSync(readerFixesPath)) {
    console.error('❌ reader-fixes.css file not found!');
    return;
  }
  
  // Read the CSS file
  const cssContent = fs.readFileSync(readerFixesPath, 'utf8');
  
  // Check for mobile-specific media queries
  const hasMobileMediaQuery = cssContent.includes('@media (max-width: 640px)') || 
                              cssContent.includes('@media (max-width: 480px)');
  
  if (hasMobileMediaQuery) {
    console.log('✅ Mobile media queries found in reader-fixes.css');
  } else {
    console.error('❌ No mobile media queries found in reader-fixes.css');
    return;
  }
  
  // Check for reduced padding in mobile view
  const hasReducedPadding = cssContent.includes('padding-top: 3rem') || 
                           cssContent.includes('padding-top: 0.5rem') ||
                           cssContent.includes('padding-top: 0.25rem');
  
  if (hasReducedPadding) {
    console.log('✅ Reduced padding for mobile view found');
  } else {
    console.error('❌ No reduced padding for mobile view found');
  }
  
  // Check if reader page container has reduced padding in JSX
  const readerPagePath = path.join('client', 'src', 'pages', 'reader.tsx');
  const readerContent = fs.readFileSync(readerPagePath, 'utf8');
  
  const hasReducedMainPadding = readerContent.includes('pt-8 sm:pt-16');
  
  if (hasReducedMainPadding) {
    console.log('✅ Reader page has reduced top padding for mobile (pt-8) with desktop value preserved (sm:pt-16)');
  } else {
    console.error('❌ Reader page does not have properly configured responsive padding');
  }
  
  // Overall assessment
  if (hasMobileMediaQuery && hasReducedPadding && hasReducedMainPadding) {
    console.log('\n✅ All mobile spacing adjustments verified successfully!');
    console.log('The reader page now has:');
    console.log('- Reduced top padding on mobile devices');
    console.log('- Compact controls spacing on small screens');
    console.log('- Preserved desktop spacing for larger screens');
  } else {
    console.error('\n❌ Some mobile spacing adjustments are missing');
  }
}

// Run the check
checkReaderCSSforMobileSpacing();