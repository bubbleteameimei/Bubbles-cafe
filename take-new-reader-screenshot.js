/**
 * Enhanced Reader Screenshot Script
 * 
 * This script captures a screenshot of the reader page with highlights 
 * to verify the padding has been added correctly to the story content.
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function takeReaderScreenshot() {
  console.log('Taking new reader page screenshot to verify navbar integration...');
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  
  // Set mobile viewport for first screenshot
  await page.setViewport({
    width: 375,
    height: 667,
    deviceScaleFactor: 1,
    isMobile: true,
  });
  
  try {
    // Navigate to reader page
    await page.goto('http://localhost:3000/reader', { waitUntil: 'networkidle0' });
    
    // Wait for the page content to load
    await page.waitForSelector('.reader-page', { timeout: 5000 });
    
    // Add highlight outlines for visual debugging
    await page.evaluate(() => {
      // Add outline to navbar
      const navbar = document.querySelector('.navbar-container');
      if (navbar) {
        navbar.style.outline = '2px solid red';
        navbar.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      }
      
      // Add outline to font controls
      const controls = document.querySelector('.reader-page div[class*="flex justify-between items-center"]');
      if (controls) {
        controls.style.outline = '2px solid blue';
        controls.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
      }
      
      // Add outline to story content
      const content = document.querySelector('.reader-page .prose');
      if (content) {
        content.style.outline = '2px solid green';
        content.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
      }
    });
    
    // Take mobile screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'reader-mobile-with-navbar.png'),
      fullPage: true
    });
    
    console.log('✅ Mobile reader screenshot captured');
    
    // Set desktop viewport for second screenshot
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    // Refresh to ensure proper desktop layout
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Add highlight outlines for visual debugging
    await page.evaluate(() => {
      // Add outline to navbar
      const navbar = document.querySelector('.navbar-container');
      if (navbar) {
        navbar.style.outline = '2px solid red';
        navbar.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      }
      
      // Add outline to font controls
      const controls = document.querySelector('.reader-page div[class*="flex justify-between items-center"]');
      if (controls) {
        controls.style.outline = '2px solid blue';
        controls.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
      }
      
      // Add outline to story content
      const content = document.querySelector('.reader-page .prose');
      if (content) {
        content.style.outline = '2px solid green';
        content.style.backgroundColor = 'rgba(0, 255, 0, 0.05)';
      }
    });
    
    // Take desktop screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'reader-desktop-with-navbar.png'),
      fullPage: true
    });
    
    console.log('✅ Desktop reader screenshot captured');
    
    // Take screenshot with distraction-free mode enabled
    await page.evaluate(() => {
      // Find and click on the story content to enable distraction-free mode
      const content = document.querySelector('.reader-page .prose');
      if (content) {
        content.click();
      }
    });
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    // Take distraction-free mode screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'reader-distraction-free-mode.png'),
      fullPage: true
    });
    
    console.log('✅ Distraction-free mode screenshot captured');
    
    console.log('Screenshots saved to:', screenshotsDir);
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeReaderScreenshot();