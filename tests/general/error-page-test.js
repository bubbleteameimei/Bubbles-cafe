// Error page test script
// This script navigates to a non-existent route to test the 404 error page

import puppeteer from 'puppeteer';

async function testErrorPage() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  console.log("Testing 404 error page...");
  
  try {
    // Navigate to a route that doesn't exist (should show 404)
    await page.goto('http://localhost:3000/this-page-does-not-exist', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Check for the 404 text
    await page.waitForSelector('.glitch-text', { timeout: 5000 });
    
    console.log("404 error page displayed successfully!");
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'screenshots/404-error-page.png' });
    
    // Wait a moment to see the page
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testErrorPage();