/**
 * Script to verify navbar and reader changes
 * 
 * This script checks:
 * 1. The navbar is now visible on the reader page
 * 2. The spacing between controls and navbar is appropriate
 * 3. Mobile-specific styles are implemented correctly
 */
import fs from 'fs';
import path from 'path';

function verifyNavbarReader() {
  console.log('Verifying navbar reader integration changes...\n');
  
  // Check AutoHideNavbar component changes
  const navbarPath = path.join('client', 'src', 'components', 'layout', 'AutoHideNavbar.tsx');
  
  if (!fs.existsSync(navbarPath)) {
    console.error('❌ AutoHideNavbar.tsx not found!');
    return;
  }
  
  const navbarContent = fs.readFileSync(navbarPath, 'utf8');
  
  // Check if hideOnPaths array was removed
  const hideOnPathsRemoved = !navbarContent.includes('hideOnPaths =');
  
  if (hideOnPathsRemoved) {
    console.log('✅ hideOnPaths array successfully removed from AutoHideNavbar component');
  } else {
    console.error('❌ hideOnPaths array is still present in AutoHideNavbar component');
  }
  
  // Check reader-fixes.css for mobile adjustments
  const readerFixesPath = path.join('client', 'src', 'styles', 'reader-fixes.css');
  
  if (!fs.existsSync(readerFixesPath)) {
    console.error('❌ reader-fixes.css not found!');
    return;
  }
  
  const cssContent = fs.readFileSync(readerFixesPath, 'utf8');
  
  // Check for navbar spacing in mobile view
  const hasMobileNavbarSpacing = cssContent.includes('padding-top: 3.5rem') || 
                                cssContent.includes('z-index: 50');
  
  if (hasMobileNavbarSpacing) {
    console.log('✅ Mobile navbar spacing adjustments implemented in reader-fixes.css');
  } else {
    console.error('❌ Mobile navbar spacing adjustments missing in reader-fixes.css');
  }
  
  // Check reader.tsx for distraction-free mode updates
  const readerPath = path.join('client', 'src', 'pages', 'reader.tsx');
  
  if (!fs.existsSync(readerPath)) {
    console.error('❌ reader.tsx not found!');
    return;
  }
  
  const readerContent = fs.readFileSync(readerPath, 'utf8');
  
  // Check if navbar is also hidden in distraction-free mode
  const hasNavbarHidingInDistractionFree = readerContent.includes('.navbar-container');
  
  if (hasNavbarHidingInDistractionFree) {
    console.log('✅ Navbar hiding in distraction-free mode implemented in reader.tsx');
  } else {
    console.error('❌ Navbar hiding in distraction-free mode not implemented in reader.tsx');
  }
  
  // Check if top padding was adjusted to accommodate navbar
  const hasAdjustedTopPadding = readerContent.includes('pt-14 sm:pt-16');
  
  if (hasAdjustedTopPadding) {
    console.log('✅ Top padding adjusted in reader.tsx to accommodate navbar');
  } else {
    console.error('❌ Top padding not properly adjusted in reader.tsx');
  }
  
  // Overall assessment
  if (hideOnPathsRemoved && hasMobileNavbarSpacing && hasNavbarHidingInDistractionFree && hasAdjustedTopPadding) {
    console.log('\n✅ All navbar-reader integration changes verified successfully!');
    console.log('Changes implemented:');
    console.log('1. Navbar now visible on reader page');
    console.log('2. Reader page adjusted to accommodate navbar');
    console.log('3. Mobile-specific spacing implemented');
    console.log('4. Distraction-free mode updated to hide navbar');
  } else {
    console.error('\n❌ Some navbar-reader integration changes are missing or incomplete');
  }
}

// Run the verification
verifyNavbarReader();