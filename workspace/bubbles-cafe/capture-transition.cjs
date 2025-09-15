/**
 * Modern Page Transition Screenshot Script
 * 
 * This script captures screenshots of the loading screen during page transitions
 * to verify our enhanced page transition implementation.
 */

const puppeteer = require('puppeteer');

async function capturePageTransition() {
  try {
    console.log('Launching browser...');
    
    // Launch headless browser using system Chromium
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
    
    // Take screenshot of current page
    await page.screenshot({ path: 'before-transition.png' });
    console.log('Before transition screenshot saved as before-transition.png');
    
    // Listen for network activity to know when the transition begins
    let transitionCaptured = false;
    
    page.on('request', async (request) => {
      if (request.isNavigationRequest() && !transitionCaptured) {
        // Wait a small amount of time for the loading screen to appear
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Navigation detected, capturing loading screen...');
        await page.screenshot({ path: 'loading-screen.png' });
        console.log('Loading screen captured as loading-screen.png');
        transitionCaptured = true;
      }
    });
    
    // Click on a navigation link to trigger page transition
    console.log('Clicking on About link to trigger transition...');
    
    // Use an evaluation to trigger the navigation
    await Promise.all([
      page.evaluate(() => {
        // Create a navigation to the about page
        window.location.href = '/about';
      }),
      
      // Capture a screenshot during the transition
      (async () => {
        // Wait a bit to catch the loading screen
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Taking transition screenshot...');
        await page.screenshot({ path: 'during-transition.png' });
        console.log('Transition screenshot saved as during-transition.png');
      })()
    ]);
    
    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    
    // Take a screenshot of the destination page
    console.log('Taking screenshot of destination page...');
    await page.screenshot({ path: 'destination-page.png' });
    console.log('Destination page screenshot saved as destination-page.png');
    
    await browser.close();
    console.log('Browser closed');
    
  } catch (error) {
    console.error('Error capturing page transition:', error);
  }
}

capturePageTransition();