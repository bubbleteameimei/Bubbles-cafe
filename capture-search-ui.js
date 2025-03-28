/**
 * Simple Screenshot Script for Search UI
 * 
 * This script captures a screenshot of the search results page to verify UI changes.
 */

const captureScreenshot = async () => {
  const puppeteer = await import('puppeteer');
  
  console.log('Launching browser...');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the search page
    console.log('Navigating to search page...');
    await page.goto('http://localhost:3001/search?q=policy', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to load
    console.log('Waiting for content to load...');
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'search-ui-screenshot.png' });
    
    console.log('Screenshot saved to search-ui-screenshot.png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
};

captureScreenshot();