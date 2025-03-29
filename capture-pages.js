/**
 * Screenshot Capture Script
 * 
 * This script captures screenshots of the index page and reader page to verify layout changes.
 */

import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';

async function capturePages() {
  console.log('Launching browser...');
  // Find chromium executable path
  const executablePath = execSync('which chromium').toString().trim();
  console.log(`Found Chromium at: ${executablePath}`);
  
  const browser = await puppeteer.launch({ 
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  
  try {
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1280,
      height: 800
    });
    
    // Capture home page
    console.log('Navigating to home page...');
    const baseUrl = 'https://3001-0-0-0-0-0-0.spock.replit.dev';
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    console.log('Taking screenshot of home page...');
    await page.screenshot({ path: 'homepage-new.png', fullPage: true });
    console.log('Home page screenshot saved');

    // Capture reader page
    console.log('Navigating to reader page...');
    await page.goto(`${baseUrl}/reader`, { waitUntil: 'networkidle2' });
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-new.png', fullPage: true });
    console.log('Reader page screenshot saved');
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

capturePages();