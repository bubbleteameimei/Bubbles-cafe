/**
 * Simple Style and Component Verification Script
 * 
 * This script verifies:
 * 1. If the reader-fixes.css file exists
 * 2. If it contains appropriate padding rules
 * 3. If the loading-screen.css file exists
 * 4. If the enhanced-page-transition component exists
 */

import fs from 'fs';

function verifyFiles() {
  console.log('Verifying implementation files...');
  
  // Check reader fixes CSS
  const readerCssPath = './client/src/styles/reader-fixes.css';
  let readerCssExists = false;
  let readerCssHasPadding = false;
  
  if (fs.existsSync(readerCssPath)) {
    readerCssExists = true;
    console.log('✓ reader-fixes.css exists');
    
    const readerCssContent = fs.readFileSync(readerCssPath, 'utf8');
    if (
      readerCssContent.includes('padding-left') && 
      readerCssContent.includes('padding-right')
    ) {
      readerCssHasPadding = true;
      console.log('✓ reader-fixes.css contains padding rules');
    } else {
      console.log('✗ reader-fixes.css does not contain padding rules');
    }
  } else {
    console.log('✗ reader-fixes.css does not exist');
  }
  
  // Check loading screen CSS
  const loadingCssPath = './client/src/styles/loading-screen.css';
  let loadingCssExists = false;
  
  if (fs.existsSync(loadingCssPath)) {
    loadingCssExists = true;
    console.log('✓ loading-screen.css exists');
  } else {
    console.log('✗ loading-screen.css does not exist');
  }
  
  // Check enhanced page transition component
  const pageTransitionPath = './client/src/components/enhanced-page-transition.tsx';
  let pageTransitionExists = false;
  let hasAnimatePresence = false;
  
  if (fs.existsSync(pageTransitionPath)) {
    pageTransitionExists = true;
    console.log('✓ enhanced-page-transition.tsx exists');
    
    const pageTransitionContent = fs.readFileSync(pageTransitionPath, 'utf8');
    if (
      pageTransitionContent.includes('AnimatePresence') && 
      pageTransitionContent.includes('motion')
    ) {
      hasAnimatePresence = true;
      console.log('✓ enhanced-page-transition.tsx uses AnimatePresence');
    } else {
      console.log('✗ enhanced-page-transition.tsx does not use AnimatePresence');
    }
  } else {
    console.log('✗ enhanced-page-transition.tsx does not exist');
  }
  
  // Check loading screen component
  const loadingComponentPath = './client/src/components/ui/loading-screen.tsx';
  let loadingComponentExists = false;
  
  if (fs.existsSync(loadingComponentPath)) {
    loadingComponentExists = true;
    console.log('✓ loading-screen.tsx exists');
  } else {
    console.log('✗ loading-screen.tsx does not exist');
  }
  
  // Check App.tsx for EnhancedPageTransition import and usage
  const appPath = './client/src/App.tsx';
  let appImportsPageTransition = false;
  let appUsesPageTransition = false;
  
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    if (appContent.includes("import { EnhancedPageTransition }") || 
        appContent.includes("import EnhancedPageTransition")) {
      appImportsPageTransition = true;
      console.log('✓ App.tsx imports EnhancedPageTransition');
    } else {
      console.log('✗ App.tsx does not import EnhancedPageTransition');
    }
    
    if (appContent.includes("<EnhancedPageTransition")) {
      appUsesPageTransition = true;
      console.log('✓ App.tsx uses EnhancedPageTransition component');
    } else {
      console.log('✗ App.tsx does not use EnhancedPageTransition component');
    }
  } else {
    console.log('✗ App.tsx does not exist');
  }
  
  // Check reader page imports reader-fixes.css
  const readerPagePath = './client/src/pages/reader.tsx';
  let readerImportsCss = false;
  
  if (fs.existsSync(readerPagePath)) {
    const readerContent = fs.readFileSync(readerPagePath, 'utf8');
    
    if (readerContent.includes("reader-fixes.css")) {
      readerImportsCss = true;
      console.log('✓ reader.tsx imports reader-fixes.css');
    } else {
      console.log('✗ reader.tsx does not import reader-fixes.css');
    }
  } else {
    console.log('✗ reader.tsx does not exist');
  }
  
  // Summary
  console.log('\nFeature Implementation Summary:\n');
  
  // Reader page padding
  const readerPaddingImplemented = readerCssExists && readerCssHasPadding && readerImportsCss;
  console.log(`Reader Page Padding: ${readerPaddingImplemented ? '✓ Implemented' : '✗ Not fully implemented'}`);
  
  // Page transition
  const pageTransitionImplemented = 
    pageTransitionExists && 
    hasAnimatePresence && 
    loadingComponentExists && 
    loadingCssExists &&
    appImportsPageTransition &&
    appUsesPageTransition;
  
  console.log(`Enhanced Page Transition: ${pageTransitionImplemented ? '✓ Implemented' : '✗ Not fully implemented'}`);
  
  console.log('\nOverall Status:');
  if (readerPaddingImplemented && pageTransitionImplemented) {
    console.log('✓ All features are properly implemented!');
  } else {
    console.log('✗ Some features are missing or incomplete.');
  }
}

verifyFiles();