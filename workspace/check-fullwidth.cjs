const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Simple Screenshot Script
 * 
 * This script takes screenshots of both the homepage and reader page
 * to verify padding changes. It highlights containers by adding temporary
 * outline styling.
 */
async function captureScreenshot() {
  console.log('📸 Taking screenshots to verify padding...');
  
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to simulate desktop
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    
    // Add temporary styling to highlight containers for debugging
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'debug-styles';
      style.textContent = `
        .container, div[class*="container"] {
          outline: 2px dashed red !important;
        }
        main {
          outline: 2px dashed blue !important;
        }
        body, html, #root {
          outline: 2px dashed purple !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    // Wait a bit for style to apply
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot
    console.log('Taking screenshot of homepage...');
    await page.screenshot({ path: 'homepage-padding.png', fullPage: false });
    
    // Navigate to the reader page
    console.log('Navigating to reader page...');
    const readerLinks = await page.$$('a[href*="/reader/"]');
    
    if (readerLinks.length > 0) {
      // Click the first reader link
      await readerLinks[0].click();
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Add temporary styling to highlight containers
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.id = 'debug-styles';
        style.textContent = `
          .container, div[class*="container"] {
            outline: 2px dashed red !important;
          }
          main {
            outline: 2px dashed blue !important;
          }
          body, html, #root {
            outline: 2px dashed purple !important;
          }
          [data-reader-page="true"], .reader-page {
            outline: 2px dashed green !important;
          }
        `;
        document.head.appendChild(style);
      });
      
      // Wait a bit for style to apply
      await new Promise(r => setTimeout(r, 1000));
      
      // Take screenshot
      console.log('Taking screenshot of reader page...');
      await page.screenshot({ path: 'reader-padding.png', fullPage: false });
    } else {
      console.log('No reader links found on homepage');
    }
    
    // Take screenshot of mobile view
    console.log('Taking screenshot of mobile view...');
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    
    // Add temporary styling to highlight containers for debugging
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'debug-styles';
      style.textContent = `
        .container, div[class*="container"] {
          outline: 2px dashed red !important;
        }
        main {
          outline: 2px dashed blue !important;
        }
        body, html, #root {
          outline: 2px dashed purple !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    // Wait a bit for style to apply
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot
    console.log('Taking mobile screenshot...');
    await page.screenshot({ path: 'mobile-padding.png', fullPage: false });
    
    console.log('✅ Screenshots saved:');
    console.log('- homepage-padding.png');
    console.log('- reader-padding.png (if reader links were found)');
    console.log('- mobile-padding.png');
    
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

captureScreenshot();