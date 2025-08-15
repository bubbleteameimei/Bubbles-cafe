const fs = require('fs');
const path = require('path');

/**
 * CSS and Loading Screen Verification Script
 * 
 * This script verifies that the loading screen styles are correctly implemented
 * by examining the CSS properties and z-index.
 */

function verifyLoadingStyles() {
  console.log("Starting loading screen styles verification...");
  
  // Check loading-screen.css
  const loadingCssPath = path.join('client', 'src', 'styles', 'loading-screen.css');
  let loadingCssHighZIndex = false;
  let loadingCssHasCentering = false;
  
  if (fs.existsSync(loadingCssPath)) {
    console.log('✓ loading-screen.css exists');
    const loadingCssContent = fs.readFileSync(loadingCssPath, 'utf8');
    
    // Check for high z-index values
    if (loadingCssContent.includes('z-index: 999999') || 
        loadingCssContent.includes('z-index: 1000000') ||
        loadingCssContent.includes('z-index: 10000')) {
      loadingCssHighZIndex = true;
      console.log('✓ loading-screen.css has high z-index values');
    } else {
      console.log('✗ loading-screen.css does not have high z-index values');
    }
    
    // Check for centering styles
    if (loadingCssContent.includes('transform: translate(-50%, -50%)') || 
        loadingCssContent.includes('top: 50%') || 
        loadingCssContent.includes('left: 50%')) {
      loadingCssHasCentering = true;
      console.log('✓ loading-screen.css has proper centering styles');
    } else {
      console.log('✗ loading-screen.css does not have proper centering styles');
    }
  } else {
    console.log('✗ loading-screen.css does not exist');
  }
  
  // Check LoadingScreen component
  const loadingComponentPath = path.join('client', 'src', 'components', 'ui', 'loading-screen.tsx');
  let loadingComponentHighZIndex = false;
  let loadingComponentHasCentering = false;
  
  if (fs.existsSync(loadingComponentPath)) {
    console.log('✓ LoadingScreen component exists');
    const loadingComponentContent = fs.readFileSync(loadingComponentPath, 'utf8');
    
    // Check for high z-index values in component
    if (loadingComponentContent.includes('z-[999999]') || 
        loadingComponentContent.includes('z-[1000000]') ||
        loadingComponentContent.includes('z-[10000]')) {
      loadingComponentHighZIndex = true;
      console.log('✓ LoadingScreen component has high z-index');
    } else {
      console.log('✗ LoadingScreen component does not have high z-index');
    }
    
    // Check for centering styles in component
    if (loadingComponentContent.includes('transform: translate(-50%, -50%)') || 
        loadingComponentContent.includes('top: 50%') || 
        loadingComponentContent.includes('left: 50%')) {
      loadingComponentHasCentering = true;
      console.log('✓ LoadingScreen component has proper centering styles');
    } else {
      console.log('✗ LoadingScreen component does not have proper centering styles');
    }
    
    // Check for overflow prevention
    if (loadingComponentContent.includes('document.body.style.overflow = \'hidden\'')) {
      console.log('✓ LoadingScreen component prevents scrolling during loading');
    } else {
      console.log('✗ LoadingScreen component does not prevent scrolling during loading');
    }
  } else {
    console.log('✗ LoadingScreen component does not exist');
  }
  
  // Enhanced Page Transition component
  const pageTransitionPath = path.join('client', 'src', 'components', 'enhanced-page-transition.tsx');
  let usesLoadingScreen = false;
  
  if (fs.existsSync(pageTransitionPath)) {
    console.log('✓ enhanced-page-transition.tsx exists');
    const pageTransitionContent = fs.readFileSync(pageTransitionPath, 'utf8');
    
    if (pageTransitionContent.includes('import LoadingScreen') && 
        pageTransitionContent.includes('<LoadingScreen')) {
      usesLoadingScreen = true;
      console.log('✓ EnhancedPageTransition uses LoadingScreen component');
    } else {
      console.log('✗ EnhancedPageTransition does not use LoadingScreen component');
    }
  } else {
    console.log('✗ enhanced-page-transition.tsx does not exist');
  }
  
  // Summarize findings
  console.log('\n=== Loading Screen Implementation Summary ===');
  
  const highZIndex = loadingCssHighZIndex || loadingComponentHighZIndex;
  const properCentering = loadingCssHasCentering || loadingComponentHasCentering;
  
  if (highZIndex && properCentering && usesLoadingScreen) {
    console.log('✅ The loading screen implementation is CORRECT and should display properly above all content');
    console.log('   - High z-index values are used to ensure loading screen appears on top');
    console.log('   - Proper centering is implemented for the loading content');
    console.log('   - The loading screen is properly integrated with the page transition system');
  } else {
    console.log('❌ The loading screen implementation has ISSUES:');
    if (!highZIndex) console.log('   - Missing high z-index values, loading screen may appear below other elements');
    if (!properCentering) console.log('   - Missing proper centering styles, loading content may not be centered');
    if (!usesLoadingScreen) console.log('   - Loading screen is not properly integrated with page transitions');
  }
}

verifyLoadingStyles();