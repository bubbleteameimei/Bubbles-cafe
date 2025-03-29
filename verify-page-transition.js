/**
 * Page Transition and Reader Padding Verification Script
 * 
 * This script verifies that:
 * 1. The enhanced page transition component is properly implemented and loaded
 * 2. The reader page's story content has the correct padding
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

async function verifyImplementation() {
  console.log('Starting verification of page transition and reader padding...');
  
  let browser;
  try {
    // Launch browser
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport to desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Check for EnhancedPageTransition component
    console.log('Checking for EnhancedPageTransition component...');
    const pageTransitionCheck = await page.evaluate(() => {
      const pageContent = document.documentElement.innerHTML;
      return {
        hasEnhancedPageTransition: pageContent.includes('EnhancedPageTransition') || 
                                   document.querySelector('[role="dialog"]') !== null,
        hasAnimatePresence: pageContent.includes('AnimatePresence'),
        hasLoadingScreen: document.querySelector('.loader') !== null ||
                         pageContent.includes('LoadingScreen')
      };
    });
    
    console.log('Page transition components check:');
    console.log(`- EnhancedPageTransition: ${pageTransitionCheck.hasEnhancedPageTransition ? 'Found' : 'Not found'}`);
    console.log(`- AnimatePresence: ${pageTransitionCheck.hasAnimatePresence ? 'Found' : 'Not found'}`);
    console.log(`- LoadingScreen: ${pageTransitionCheck.hasLoadingScreen ? 'Found' : 'Not found'}`);
    
    // Capture screenshot of the homepage
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: 'homepage-screenshot.png' });
    
    // Navigate to reader page
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3000/reader', { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await page.waitForSelector('.reader-container', { timeout: 5000 }).catch(() => {
      console.log('Warning: .reader-container not found within timeout');
    });
    
    // Check reader page padding
    console.log('Checking reader page padding...');
    const readerPaddingCheck = await page.evaluate(() => {
      const readerContainer = document.querySelector('.reader-container.story-content');
      
      if (!readerContainer) {
        return { 
          hasReaderContainer: false,
          paddingLeft: 'Not found',
          paddingRight: 'Not found',
          hasCssFile: false
        };
      }
      
      // Check if CSS file is loaded
      const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      const hasReaderFixesCss = cssLinks.some(link => link.href.includes('reader-fixes.css'));
      
      // Get computed styles
      const computedStyle = window.getComputedStyle(readerContainer);
      
      return {
        hasReaderContainer: true,
        paddingLeft: computedStyle.paddingLeft,
        paddingRight: computedStyle.paddingRight,
        hasCssFile: hasReaderFixesCss
      };
    });
    
    console.log('Reader padding check:');
    console.log(`- Reader container found: ${readerPaddingCheck.hasReaderContainer ? 'Yes' : 'No'}`);
    console.log(`- Padding left: ${readerPaddingCheck.paddingLeft}`);
    console.log(`- Padding right: ${readerPaddingCheck.paddingRight}`);
    console.log(`- reader-fixes.css loaded: ${readerPaddingCheck.hasCssFile ? 'Yes' : 'No'}`);
    
    // Capture screenshot of the reader page
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-screenshot.png' });
    
    // Trigger an actual page transition
    console.log('Testing actual page transition from reader to homepage...');
    await page.evaluate(() => {
      // Programmatically trigger navigation to homepage
      const event = new CustomEvent('click');
      const homeLink = document.querySelector('a[href="/"]') || 
                      document.createElement('a');
      
      if (!homeLink.href) {
        homeLink.href = '/';
        document.body.appendChild(homeLink);
      }
      
      homeLink.dispatchEvent(event);
    });
    
    // Wait to see if loading screen appears
    console.log('Waiting for loading screen to appear...');
    
    // Short delay to allow time for loading screen to appear
    await page.waitForTimeout(300);
    
    // Check if loading screen is visible
    const loadingScreenCheck = await page.evaluate(() => {
      const loadingElement = document.querySelector('.loader') || 
                            document.querySelector('[role="dialog"][aria-modal="true"]');
      return {
        isLoadingVisible: loadingElement !== null && 
                          window.getComputedStyle(loadingElement).display !== 'none',
      };
    });
    
    console.log(`- Loading screen appeared during transition: ${loadingScreenCheck.isLoadingVisible ? 'Yes' : 'No'}`);
    
    if (loadingScreenCheck.isLoadingVisible) {
      console.log('Taking screenshot of loading screen...');
      await page.screenshot({ path: 'loading-screen.png' });
    }
    
    // Wait for transition to complete and return to homepage
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'after-transition.png' });
    
    console.log('\nVerification complete!');
    console.log('Screenshots saved:');
    console.log('- homepage-screenshot.png');
    console.log('- reader-screenshot.png');
    if (loadingScreenCheck.isLoadingVisible) {
      console.log('- loading-screen.png');
    }
    console.log('- after-transition.png');
    
    // Summary
    console.log('\nSummary:');
    
    const pageTransitionImplemented = 
      pageTransitionCheck.hasEnhancedPageTransition &&
      pageTransitionCheck.hasAnimatePresence;
    
    const readerPaddingImplemented = 
      readerPaddingCheck.hasReaderContainer &&
      readerPaddingCheck.paddingLeft !== '0px' &&
      readerPaddingCheck.paddingRight !== '0px';
    
    console.log(`- Page transition components: ${pageTransitionImplemented ? '✓ Implemented' : '✗ Missing components'}`);
    console.log(`- Reader padding: ${readerPaddingImplemented ? '✓ Implemented' : '✗ Not properly implemented'}`);
    console.log(`- Loading screen during transition: ${loadingScreenCheck.isLoadingVisible ? '✓ Working' : '✗ Not visible'}`);
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
}

// Run the verification
verifyImplementation();