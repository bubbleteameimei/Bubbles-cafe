/**
 * Simple Script to Capture Homepage Screenshot
 * 
 * This script captures a screenshot of the homepage to show animations and transitions.
 */
import puppeteer from 'puppeteer-core';

async function takeScreenshot() {
  console.log('Starting screenshot capture...');
  
  try {
    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: 'new', // Use the new headless mode
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set viewport size for consistent screenshots
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1
    });
    
    console.log('Navigating to homepage...');
    // Navigate to the homepage
    await page.goto('http://localhost:3000/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for page to fully load
    await page.waitForTimeout(2000);
    
    console.log('Capturing screenshot...');
    // Take a screenshot and save it
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    
    // Now navigate to a story page to capture transition
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3000/reader/blood', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for transition to complete
    await page.waitForTimeout(3000);
    
    // Take another screenshot
    await page.screenshot({ path: 'reader-screenshot.png', fullPage: true });
    
    // Close the browser
    await browser.close();
    
    console.log('Screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  }
}

// Run the function
takeScreenshot();