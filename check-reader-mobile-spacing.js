/**
 * Simple Reader Mobile Spacing Check Script
 * 
 * This script validates that the CSS changes to reduce space between 
 * reader header and controls in mobile view have been properly implemented.
 */
import fs from 'fs';
import path from 'path';

function checkReaderCSSforMobileSpacing() {
  console.log('Checking reader mobile spacing implementation...\n');
  
  // Check the reader CSS file
  const readerCSSPath = path.join('client', 'src', 'styles', 'reader-fixes.css');
  
  if (!fs.existsSync(readerCSSPath)) {
    console.error('❌ reader-fixes.css not found');
    return;
  }
  
  const cssContent = fs.readFileSync(readerCSSPath, 'utf8');
  
  // Check for mobile media query
  const hasMobileQuery = cssContent.includes('@media (max-width: 640px)');
  
  if (hasMobileQuery) {
    console.log('✅ Mobile media query found in reader-fixes.css');
  } else {
    console.error('❌ Mobile media query missing in reader-fixes.css');
  }
  
  // Check for reduced padding in controls
  const hasReducedControlsPadding = cssContent.includes('padding-top: 0.25rem');
  
  if (hasReducedControlsPadding) {
    console.log('✅ Reduced controls padding found in reader-fixes.css');
  } else {
    console.error('❌ Reduced controls padding missing in reader-fixes.css');
  }
  
  // Check for adjusted top padding for navbar
  const hasAdjustedNavbarPadding = cssContent.includes('padding-top: 3.5rem');
  
  if (hasAdjustedNavbarPadding) {
    console.log('✅ Adjusted top padding for navbar found in reader-fixes.css');
  } else {
    console.error('❌ Adjusted top padding for navbar missing in reader-fixes.css');
  }
  
  // Check for z-index fix
  const hasZIndexFix = cssContent.includes('z-index: 50');
  
  if (hasZIndexFix) {
    console.log('✅ Z-index fix for navbar found in reader-fixes.css');
  } else {
    console.error('❌ Z-index fix for navbar missing in reader-fixes.css');
  }
  
  // Check the reader component for padding adjustments
  const readerComponentPath = path.join('client', 'src', 'pages', 'reader.tsx');
  
  if (!fs.existsSync(readerComponentPath)) {
    console.error('❌ reader.tsx not found');
    return;
  }
  
  const readerContent = fs.readFileSync(readerComponentPath, 'utf8');
  
  // Check for adjusted base padding in reader component
  const hasBaseReaderPadding = readerContent.includes('pt-14 sm:pt-16') || 
                              readerContent.includes('pt-14');
  
  if (hasBaseReaderPadding) {
    console.log('✅ Adjusted base padding found in reader.tsx');
  } else {
    console.error('❌ Adjusted base padding missing in reader.tsx');
  }
  
  // Check for distraction-free mode navbar handling
  const hasDistractionFreeNavbar = readerContent.includes('.navbar-container');
  
  if (hasDistractionFreeNavbar) {
    console.log('✅ Navbar handling in distraction-free mode found in reader.tsx');
  } else {
    console.error('❌ Navbar handling in distraction-free mode missing in reader.tsx');
  }
  
  // Overall assessment
  if (hasMobileQuery && hasReducedControlsPadding && hasAdjustedNavbarPadding && 
      hasZIndexFix && hasBaseReaderPadding && hasDistractionFreeNavbar) {
    console.log('\n✅ All mobile spacing adjustments are properly implemented!');
    console.log('This will ensure:');
    console.log('1. The navbar is visible on the reader page');
    console.log('2. The spacing between controls and navbar is appropriate for mobile');
    console.log('3. Elements don\'t overlap due to proper z-index and padding');
    console.log('4. Distraction-free mode properly hides the navbar');
  } else {
    console.error('\n❌ Some mobile spacing adjustments are missing or incomplete');
  }
}

// Run the check
checkReaderCSSforMobileSpacing();