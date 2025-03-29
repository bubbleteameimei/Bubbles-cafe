/**
 * Page Transition Verification Script
 * 
 * This script checks if the enhanced page transition components are working correctly.
 * It looks for both EnhancedPageTransition and LoadingScreen components 
 * by inspecting the client-side application bundle.
 */
const puppeteer = require('puppeteer');

async function verifyPageTransition() {
  console.log("Starting page transition verification...");
  
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the homepage
    console.log("Navigating to the homepage...");
    await page.goto('https://26db112a-75ae-42f7-b3bf-6190f0d60ade-00-3i2ulcg3ig8s3.spock.replit.dev:3001/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Check if EnhancedPageTransition component is loaded
    console.log("Checking for EnhancedPageTransition component...");
    const hasEnhancedTransition = await page.evaluate(() => {
      return window.__VITE_LOADED_MODULES__ && 
        Object.keys(window.__VITE_LOADED_MODULES__).some(
          m => m.includes('enhanced-page-transition') || m.includes('EnhancedPageTransition')
        );
    });
    
    console.log(`EnhancedPageTransition component loaded: ${hasEnhancedTransition ? 'YES' : 'NO'}`);
    
    // Check if LoadingScreen component is loaded
    console.log("Checking for LoadingScreen component...");
    const hasLoadingScreen = await page.evaluate(() => {
      return window.__VITE_LOADED_MODULES__ && 
        Object.keys(window.__VITE_LOADED_MODULES__).some(
          m => m.includes('loading-screen') || m.includes('LoadingScreen')
        );
    });
    
    console.log(`LoadingScreen component loaded: ${hasLoadingScreen ? 'YES' : 'NO'}`);
    
    // Capture a screenshot of the page
    await page.screenshot({ path: 'homepage-verification.png' });
    console.log("Homepage screenshot captured.");
    
    // Trigger a navigation to see if the loading screen appears
    console.log("Triggering navigation to reader page...");
    
    // Start performance measurement
    await page.evaluate(() => {
      window.performance.mark('navigationStart');
    });
    
    // Navigate to the reader page
    const navigationPromise = page.goto('https://26db112a-75ae-42f7-b3bf-6190f0d60ade-00-3i2ulcg3ig8s3.spock.replit.dev:3001/reader', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait a short time to capture the loading screen
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'during-transition.png' });
    console.log("Transition screenshot captured.");
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // End performance measurement
    const timing = await page.evaluate(() => {
      window.performance.mark('navigationEnd');
      window.performance.measure('navigationDuration', 'navigationStart', 'navigationEnd');
      return window.performance.getEntriesByName('navigationDuration')[0].duration;
    });
    
    console.log(`Navigation completed in ${timing.toFixed(2)}ms`);
    
    // Capture final page to verify layout
    await page.screenshot({ path: 'reader-page.png' });
    console.log("Reader page screenshot captured.");
    
    // Check page width to ensure full-width layout
    const pageWidth = await page.evaluate(() => {
      return document.documentElement.scrollWidth;
    });
    
    console.log(`Page width: ${pageWidth}px`);
    
    // Check if page extends to full width
    const isFullWidth = await page.evaluate(() => {
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;
      return bodyWidth >= windowWidth;
    });
    
    console.log(`Full-width layout: ${isFullWidth ? 'YES' : 'NO'}`);
    
    // Close the browser
    await browser.close();
    
    console.log("Page transition verification completed.");
    
    // Print summary results
    console.log("\n===== VERIFICATION SUMMARY =====");
    console.log(`EnhancedPageTransition loaded: ${hasEnhancedTransition ? '✓' : '✗'}`);
    console.log(`LoadingScreen loaded: ${hasLoadingScreen ? '✓' : '✗'}`);
    console.log(`Full-width layout: ${isFullWidth ? '✓' : '✗'}`);
    console.log(`Navigation time: ${timing.toFixed(2)}ms`);
    console.log("===============================");
    
  } catch (error) {
    console.error("Error during verification:", error);
  }
}

verifyPageTransition();