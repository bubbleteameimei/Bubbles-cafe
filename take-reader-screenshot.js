/**
 * Simple Reader Screenshot Script
 * 
 * This script captures a screenshot of the reader page to verify padding changes.
 */

import { exec } from 'child_process';
import puppeteer from 'puppeteer';

async function takeScreenshot() {
  try {
    console.log('Launching browser...');
    
    // Use the system's Chrome installation
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true
    });
    
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Set viewport to a common screen size
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to https://3001-0-0-0-0-0-0.spock.replit.dev/reader...');
    await page.goto('https://3001-0-0-0-0-0-0.spock.replit.dev/reader', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait a little to ensure everything loads properly
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'reader-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved as reader-screenshot.png');
    
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeScreenshot();