/**
 * Very Simple Screenshot Script
 * 
 * This script creates a quick screenshot using puppeteer with minimal options.
 */

import puppeteer from 'puppeteer';
import { execSync } from 'child_process';

async function captureScreenshot() {
  console.log('Starting screenshot capture...');
  
  try {
    // Find chromium executable path
    const chromiumPath = execSync('which chromium').toString().trim();
    console.log('Using chromium at:', chromiumPath);
    
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: chromiumPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to site...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'quick-screenshot.png' });
    
    console.log('Screenshot saved to quick-screenshot.png');
    await browser.close();
    console.log('Browser closed');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  }
}

captureScreenshot();