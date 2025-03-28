/**
 * Simple Mobile Screenshot Script
 * 
 * This script uses the chromium browser with puppeteer to take a mobile-sized screenshot
 * of the website navigation.
 */

const puppeteer = require('puppeteer');

async function takeMobileScreenshot() {
  console.log('Starting mobile screenshot capture...');
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    
    console.log('Navigating to page...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for header to be visible
    console.log('Waiting for content to load...');
    await page.waitForSelector('header', { visible: true, timeout: 10000 });
    
    // Wait a bit more for any animations to finish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'mobile-nav-screenshot.jpg', quality: 90 });
    
    console.log('Screenshot saved to mobile-nav-screenshot.jpg');
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeMobileScreenshot();