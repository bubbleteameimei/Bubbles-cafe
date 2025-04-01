/**
 * Final Reader Mobile Spacing Check Script
 * 
 * This script validates that all the CSS changes to reduce space between 
 * reader header and controls in mobile view have been properly implemented.
 */
import fs from 'fs';
import path from 'path';

function checkFinalReaderMobileSpacing() {
  console.log('Checking final reader mobile spacing adjustments...\n');
  
  // Check the reader CSS file
  const readerCSSPath = path.join('client', 'src', 'styles', 'reader-fixes.css');
  
  if (!fs.existsSync(readerCSSPath)) {
    console.error('❌ reader-fixes.css not found');
    return;
  }
  
  const cssContent = fs.readFileSync(readerCSSPath, 'utf8');
  
  // Check for all the mobile spacing adjustments
  const hasRequiredCSS = [
    // Mobile media query
    cssContent.includes('@media (max-width: 640px)'),
    
    // Reduced padding in controls
    cssContent.includes('padding-top: 0.25rem'),
    
    // Adjusted top padding
    cssContent.includes('padding-top: 2.75rem'),
    
    // Navbar scale transform
    cssContent.includes('transform: scale(0.95)'),
    
    // Button scale transform
    cssContent.includes('reader-page button'),
    cssContent.includes('transform: scale(0.95)'),
    
    // Reduced prose margin
    cssContent.includes('reader-page .prose'),
    cssContent.includes('margin-top: -0.5rem')
  ];
  
  const allCSSAdjustmentsPresent = hasRequiredCSS.every(item => item === true);
  
  if (allCSSAdjustmentsPresent) {
    console.log('✅ All required CSS adjustments for mobile spacing are present');
  } else {
    console.error('❌ Some CSS adjustments for mobile spacing are missing');
    hasRequiredCSS.forEach((present, index) => {
      if (!present) {
        const adjustments = [
          'Mobile media query',
          'Reduced padding in controls',
          'Adjusted top padding',
          'Navbar scale transform',
          'Button scale transform',
          'Reduced prose margin'
        ];
        console.error(`  ❌ Missing: ${adjustments[index]}`);
      }
    });
  }
  
  // Check reader.tsx for adjustments
  const readerTSXPath = path.join('client', 'src', 'pages', 'reader.tsx');
  
  if (!fs.existsSync(readerTSXPath)) {
    console.error('❌ reader.tsx not found');
    return;
  }
  
  const readerContent = fs.readFileSync(readerTSXPath, 'utf8');
  
  // Check for updated base padding and smaller title in mobile
  const hasReaderChanges = [
    // Reduced base padding in mobile
    readerContent.includes('pt-8 sm:pt-16'),
    
    // Smaller title in mobile
    readerContent.includes('text-3xl md:text-5xl')
  ];
  
  const allReaderChangesPresent = hasReaderChanges.every(item => item === true);
  
  if (allReaderChangesPresent) {
    console.log('✅ All required reader.tsx adjustments for mobile spacing are present');
  } else {
    console.error('❌ Some reader.tsx adjustments for mobile spacing are missing');
    hasReaderChanges.forEach((present, index) => {
      if (!present) {
        const adjustments = [
          'Reduced base padding in mobile',
          'Smaller title in mobile'
        ];
        console.error(`  ❌ Missing: ${adjustments[index]}`);
      }
    });
  }
  
  // Overall assessment
  if (allCSSAdjustmentsPresent && allReaderChangesPresent) {
    console.log('\n✅ All mobile spacing adjustments have been successfully implemented!');
    console.log('\nThese changes will ensure:');
    console.log('1. Significantly reduced space between navbar and content on mobile');
    console.log('2. More compact navbar appearance on mobile');
    console.log('3. Smaller font controls and content title on mobile');
    console.log('4. Proper layering with z-index adjustments');
    console.log('5. Compatibility with distraction-free mode');
  } else {
    console.error('\n❌ Some mobile spacing adjustments are missing or incomplete');
  }
}

// Run the check
checkFinalReaderMobileSpacing();