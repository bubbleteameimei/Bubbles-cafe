/**
 * Enhanced Reader Screenshot Script
 * 
 * This script captures a screenshot of the reader page with highlights 
 * to verify the padding has been added correctly to the story content.
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function takeReaderScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to the reader page...');
    // Navigate to the reader page - assuming we can access it directly
    // Modify this URL if needed to access your specific reader page
    await page.goto('http://localhost:3000/reader', { waitUntil: 'networkidle0' });
    
    console.log('Waiting for content to fully load...');
    // Wait for the story content to be visible
    await page.waitForSelector('.reader-container.story-content', { visible: true, timeout: 10000 });
    
    // Add highlight borders to help visualize the padding
    await page.evaluate(() => {
      // Add a colored outline to the story content container
      const storyContainer = document.querySelector('.reader-container.story-content');
      if (storyContainer) {
        storyContainer.style.border = '2px solid red';
        
        // Create visible markers at the edges of the content
        const leftMarker = document.createElement('div');
        leftMarker.style.position = 'absolute';
        leftMarker.style.left = '0';
        leftMarker.style.top = '50%';
        leftMarker.style.width = '10px';
        leftMarker.style.height = '100px';
        leftMarker.style.backgroundColor = 'blue';
        leftMarker.style.zIndex = '1000';
        
        const rightMarker = document.createElement('div');
        rightMarker.style.position = 'absolute';
        rightMarker.style.right = '0';
        rightMarker.style.top = '50%';
        rightMarker.style.width = '10px';
        rightMarker.style.height = '100px';
        rightMarker.style.backgroundColor = 'blue';
        rightMarker.style.zIndex = '1000';
        
        // Append the markers to the body
        document.body.appendChild(leftMarker);
        document.body.appendChild(rightMarker);
        
        // Add highlight to first paragraph to see padding clearly
        const firstParagraph = storyContainer.querySelector('p');
        if (firstParagraph) {
          firstParagraph.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        }
      }
    });
    
    // Wait a bit for our visual markers to be rendered
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Taking screenshot...');
    // Capture the screenshot
    const screenshotPath = path.join(process.cwd(), 'reader-padding-fixed.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Also try to get the computed styles to verify padding
    const paddingInfo = await page.evaluate(() => {
      const content = document.querySelector('.reader-container.story-content');
      if (!content) return 'Story content container not found';
      
      const styles = window.getComputedStyle(content);
      return {
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        width: styles.width,
        boxSizing: styles.boxSizing
      };
    });
    
    console.log('Computed padding information:');
    console.log(paddingInfo);
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

takeReaderScreenshot()
  .catch(console.error);