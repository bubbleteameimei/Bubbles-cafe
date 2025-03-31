/**
 * Screenshot Script for Reader Nav Fix
 * 
 * This script captures a screenshot of the reader page to verify nav bar fix.
 */
import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

async function takeReaderScreenshot() {
  console.log('Launching browser...');
  
  // Use the system installed Chromium
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    console.log('Browser launched successfully');
    
    // Set viewport to desktop size
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3000/reader', {
      waitUntil: 'networkidle2', 
      timeout: 30000
    });
    
    // Wait for content to load
    await page.waitForSelector('.story-content', { visible: true, timeout: 30000 });
    
    console.log('Reader page loaded successfully');
    
    // Wait a bit to ensure all animations and styles are applied
    await page.waitForTimeout(1000);
    
    // Add highlight outlines to show the UI structure
    await page.evaluate(() => {
      // Highlight the navigation area (if visible)
      const navbar = document.querySelector('.navbar-container');
      if (navbar) {
        navbar.style.outline = '3px solid #ff0000';
      }
      
      // Highlight the reader control buttons
      const readerControls = document.querySelector('.ui-fade-element');
      if (readerControls) {
        readerControls.style.outline = '3px solid #00ff00';
      }
      
      // Highlight the story content
      const storyContent = document.querySelector('.story-content');
      if (storyContent) {
        storyContent.style.outline = '3px solid #0000ff';
      }
    });
    
    // Take a screenshot and save it
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'reader-nav-fixed.png', fullPage: false });
    console.log('Screenshot saved to reader-nav-fixed.png');
    
    // Check if navbar is visible on reader page
    const navbarVisible = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar-container');
      return navbar !== null && getComputedStyle(navbar).display !== 'none';
    });
    
    console.log('Navbar visible on reader page:', navbarVisible);
    
    // Check for overlap between navbar and reader controls
    const overlap = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar-container');
      const readerControls = document.querySelector('.ui-fade-element');
      
      if (!navbar || !readerControls) return false;
      
      const navRect = navbar.getBoundingClientRect();
      const controlsRect = readerControls.getBoundingClientRect();
      
      return !(
        navRect.bottom < controlsRect.top ||
        navRect.top > controlsRect.bottom
      );
    });
    
    console.log('Overlap between navbar and reader controls:', overlap);
    
    // Return the results
    return {
      success: true,
      navbarVisible,
      overlap,
      screenshotPath: 'reader-nav-fixed.png'
    };
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

// Execute the screenshot function
takeReaderScreenshot()
  .then(result => {
    console.log('Screenshot process completed:', result);
  })
  .catch(error => {
    console.error('Error in screenshot process:', error);
  });