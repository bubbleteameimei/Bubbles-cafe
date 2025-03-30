/**
 * Simple CSS Verification Script
 * 
 * This script verifies that the reader-fixes.css file is being loaded
 * and that the padding properties for reader content are being applied.
 */

import fs from 'fs';
import path from 'path';

// Verify that the reader-fixes.css exists and has the expected content
function verifyReaderCSS() {
  console.log('Verifying reader CSS implementation...');
  
  // Check if the reader-fixes.css file exists
  const readerFixesPath = path.join('client', 'src', 'styles', 'reader-fixes.css');
  
  if (!fs.existsSync(readerFixesPath)) {
    console.error('❌ reader-fixes.css file not found!');
    return;
  }
  
  console.log('✅ reader-fixes.css file exists');
  
  // Read the file content
  const cssContent = fs.readFileSync(readerFixesPath, 'utf8');
  
  // Check for the padding declarations
  const hasPaddingLeft = cssContent.includes('padding-left:') || cssContent.includes('padding-left ');
  const hasPaddingRight = cssContent.includes('padding-right:') || cssContent.includes('padding-right ');
  
  if (hasPaddingLeft && hasPaddingRight) {
    console.log('✅ Padding declarations found in reader-fixes.css');
  } else {
    console.log('❌ Missing padding declarations in reader-fixes.css');
  }
  
  // Check if the file is imported in the application
  const imports = checkFileImports();
  if (imports.includes) {
    console.log('✅ reader-fixes.css is imported in the application');
  } else {
    console.log('❌ reader-fixes.css is not imported in the application');
    console.log(`   Suggested import location: ${imports.suggestion}`);
  }
  
  // Verify our overrides don't conflict
  checkCSSOverrides();

  console.log('\nVerification complete!');
}

// Check if the CSS file is imported in any of the main application files
function checkFileImports() {
  const possibleImportLocations = [
    'client/src/main.tsx',
    'client/src/App.tsx',
    'client/src/index.tsx',
    'client/src/components/reader/ReaderPage.tsx'
  ];
  
  for (const location of possibleImportLocations) {
    if (fs.existsSync(location)) {
      const content = fs.readFileSync(location, 'utf8');
      if (content.includes('reader-fixes.css')) {
        return { includes: true, location };
      }
    }
  }
  
  return { includes: false, suggestion: 'client/src/main.tsx' };
}

// Check for any CSS overrides that might conflict
function checkCSSOverrides() {
  console.log('\nChecking for potential CSS overrides...');
  
  // Check index.css
  const indexCssPath = 'client/src/index.css';
  if (fs.existsSync(indexCssPath)) {
    const indexCss = fs.readFileSync(indexCssPath, 'utf8');
    const readerOverrides = indexCss.includes('[data-reader-page]') || 
                           indexCss.includes('.reader-page') ||
                           indexCss.includes('data-reader-page="true"');
    
    if (readerOverrides) {
      console.log('⚠️ Found reader page style overrides in index.css');
      console.log('   - These could potentially conflict with reader-fixes.css');
      
      // Check for padding overrides specifically
      if (indexCss.includes('padding-left: 0') && indexCss.includes('padding-right: 0')) {
        console.log('⚠️ Found padding resets in index.css that might prevent reader-fixes.css padding');
      } else {
        console.log('✅ No direct padding conflicts found in index.css');
      }
    } else {
      console.log('✅ No reader overrides found in index.css');
    }
  }
  
  // Check fullwidth-fix.css
  const fullwidthFixPath = 'client/src/styles/fullwidth-fix.css';
  if (fs.existsSync(fullwidthFixPath)) {
    const fullwidthCss = fs.readFileSync(fullwidthFixPath, 'utf8');
    if (fullwidthCss.includes('.reader-container')) {
      console.log('⚠️ Found reader container styles in fullwidth-fix.css');
      
      if (fullwidthCss.includes('padding-left:') && fullwidthCss.includes('padding-right:')) {
        console.log('⚠️ fullwidth-fix.css contains explicit padding values that might override reader-fixes.css');
      } else {
        console.log('✅ No direct padding conflicts found in fullwidth-fix.css');
      }
    } else {
      console.log('✅ No reader styles found in fullwidth-fix.css');
    }
  }
}

verifyReaderCSS();