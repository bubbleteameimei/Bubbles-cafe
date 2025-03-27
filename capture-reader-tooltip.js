/**
 * Capture Reader Tooltip Screenshot
 * 
 * This script captures a screenshot of the reader page with the tooltip visible
 * to verify the centering fix.
 */

import puppeteer from 'puppeteer';

async function captureReaderTooltip() {
  console.log("Starting to capture reader tooltip screenshot...");
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the reader page
    await page.goto('http://localhost:3001/reader', { waitUntil: 'networkidle2' });
    console.log("Loaded reader page");
    
    // Wait a moment for any animations to complete
    await page.waitForTimeout(1000);
    
    // Take a screenshot
    await page.screenshot({ path: 'reader-tooltip-screenshot.png' });
    console.log("Screenshot saved to reader-tooltip-screenshot.png");
    
    // Add some visual indicators for the test
    await page.evaluate(() => {
      // Function to add temporary outlines
      function addOutlines() {
        // Outline for tooltip container
        const tooltipContainer = document.querySelector('.fixed.bottom-12 .container.max-w-4xl');
        if (tooltipContainer) {
          tooltipContainer.style.outline = '2px solid red';
          tooltipContainer.style.outlineOffset = '2px';
        }
        
        // Outline for story content
        const storyContent = document.querySelector('.story-content');
        if (storyContent) {
          storyContent.style.outline = '2px solid blue';
          storyContent.style.outlineOffset = '2px';
        }
        
        // Add a centered vertical line for reference
        const centerLine = document.createElement('div');
        centerLine.style.position = 'fixed';
        centerLine.style.top = '0';
        centerLine.style.bottom = '0';
        centerLine.style.left = '50%';
        centerLine.style.width = '1px';
        centerLine.style.backgroundColor = 'lime';
        centerLine.style.zIndex = '9999';
        document.body.appendChild(centerLine);
      }
      
      addOutlines();
    });
    
    // Take another screenshot with the visual indicators
    await page.screenshot({ path: 'reader-tooltip-screenshot-with-indicators.png' });
    console.log("Screenshot with indicators saved to reader-tooltip-screenshot-with-indicators.png");
    
  } catch (error) {
    console.error("Error during capture:", error);
  } finally {
    await browser.close();
    console.log("Capture completed");
  }
}

captureReaderTooltip();