/**
 * Reader Spacing Screenshot Script
 * 
 * This script captures a screenshot of the reader page to visually verify
 * the spacing between the header buttons and the navigation.
 */

import puppeteer from 'puppeteer';

async function captureReaderScreenshot() {
  console.log('Capturing reader page screenshot with new spacing...');
  
  // Launch browser with additional options for better screenshot quality
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1.5,
    },
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Go to the reader page
    console.log('Navigating to reader page...');
    await page.goto('https://26db112a-75ae-42f7-b3bf-6190f0d60ade-00-3i2ulcg3ig8s3.spock.replit.dev:3001/reader', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to be visible
    console.log('Waiting for reader content to load...');
    await page.waitForSelector('.reader-container', { timeout: 20000 });
    
    // Add visual highlights to show spacing areas
    await page.evaluate(() => {
      // Add a red outline to the main container to show the padding area
      const readerPageElement = document.querySelector('.reader-page');
      if (readerPageElement) {
        readerPageElement.style.outline = '2px dashed red';
      }
      
      // Add a blue outline to the controls container
      const controlsElement = document.querySelector('.flex.justify-between.items-center');
      if (controlsElement) {
        controlsElement.style.outline = '2px dashed blue';
      }
      
      // Add a green outline to the content container
      const contentElement = document.querySelector('motion\\.article');
      if (contentElement) {
        contentElement.style.outline = '2px dashed green';
      }
    });
    
    // Wait a moment for styles to apply
    await page.waitForTimeout(1000);
    
    // Capture the screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'reader-spacing-screenshot.png', fullPage: false });
    
    console.log('Screenshot saved as reader-spacing-screenshot.png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
captureReaderScreenshot().catch(console.error);