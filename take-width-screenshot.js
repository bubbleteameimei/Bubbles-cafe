/**
 * Simple Screenshot Tool
 * 
 * This script takes a screenshot to verify the page layout is properly full-width
 */

import puppeteer from 'puppeteer-core';
import { executablePath } from 'puppeteer-core';

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });

    console.log('Navigating to application...');
    await page.goto('https://3001-0-0-0-0-0-0.spock.replit.dev/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Waiting for content to load...');
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Wait a bit more to ensure everything is rendered
    await page.waitForTimeout(2000);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'fixed-layout-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved as fixed-layout-screenshot.png');
    
    // Now navigate to another page to test transition
    console.log('Navigating to About page to test transition...');
    await page.click('a[href="/about"]');
    
    // Wait for loading screen to appear
    console.log('Waiting for loading screen...');
    try {
      await page.waitForSelector('.loader', { timeout: 3000 });
      console.log('Loading screen detected, taking screenshot...');
      await page.screenshot({ path: 'loading-screen.png' });
      console.log('Loading screen screenshot saved as loading-screen.png');
    } catch (error) {
      console.log('Could not detect loading screen, taking screenshot anyway...');
      await page.screenshot({ path: 'transition-screenshot.png' });
    }
    
    // Wait for about page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot of destination page...');
    await page.screenshot({ path: 'about-page-screenshot.png', fullPage: true });
    
    console.log('About page screenshot saved as about-page-screenshot.png');
    
  } catch (error) {
    console.error('Error during screenshot process:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

captureScreenshot().catch(console.error);