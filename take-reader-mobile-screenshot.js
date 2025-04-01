/**
 * Reader Mobile Screenshot Script
 * 
 * This script captures a screenshot of the reader page in mobile view to verify
 * the reduced spacing between header buttons and main nav.
 */
const puppeteer = require('puppeteer');

async function takeReaderMobileScreenshot() {
  console.log('Starting mobile screenshot capture...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to mobile size
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true
    });
    
    // Navigate to the reader page
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3000/reader', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Wait for content to load
    console.log('Waiting for page content...');
    await page.waitForSelector('.reader-page', { timeout: 5000 });
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: 'reader-mobile-spacing.png',
      fullPage: false
    });
    
    console.log('Screenshot saved to reader-mobile-spacing.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

// Run the function
takeReaderMobileScreenshot();