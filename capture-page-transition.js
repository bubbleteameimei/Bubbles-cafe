/**
 * Page Transition Screenshot Script
 * 
 * This script captures the loading screen during page transitions.
 */

import { exec } from 'child_process';
import puppeteer from 'puppeteer';

async function capturePageTransition() {
  try {
    console.log('Launching browser...');
    
    // Use the system's Chrome installation
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
    });
    
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set viewport to a common screen size
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    
    // Go to the homepage first
    console.log('Navigating to homepage...');
    await page.goto('https://3001-0-0-0-0-0-0.spock.replit.dev', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the page to be fully loaded
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set up a listener to capture the transition
    let transitionCaptured = false;
    
    page.on('request', async (request) => {
      // When a new navigation request happens and we haven't captured yet
      if (request.isNavigationRequest() && !transitionCaptured) {
        // Wait a small amount of time for the loading screen to appear
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('Navigation detected, capturing loading screen...');
        await page.screenshot({ path: 'loading-screen.png', fullPage: false });
        console.log('Loading screen captured as loading-screen.png');
        transitionCaptured = true;
      }
    });
    
    // Instead of clicking, let's navigate directly to another page
    console.log('Navigating to About page to trigger transition...');
    
    // Take screenshot of current page
    await page.screenshot({ path: 'before-transition.png', fullPage: false });
    console.log('Before transition screenshot saved as before-transition.png');
    
    // Navigate to a different page to trigger the transition
    await Promise.all([
      page.goto('https://3001-0-0-0-0-0-0.spock.replit.dev/about', {
        timeout: 30000
      }),
      
      // This will capture the transition during navigation
      (async () => {
        // Wait a bit to catch the loading screen
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Taking transition screenshot...');
        await page.screenshot({ path: 'during-transition.png', fullPage: false });
        console.log('Transition screenshot saved as during-transition.png');
      })()
    ]);
    
    // Take a screenshot of the destination page
    console.log('Taking screenshot of destination page...');
    await page.screenshot({ path: 'destination-page.png', fullPage: true });
    console.log('Destination page screenshot saved as destination-page.png');
    
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error('Error capturing page transition:', error);
  }
}

capturePageTransition();