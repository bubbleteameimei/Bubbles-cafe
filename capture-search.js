/**
 * Search Page Screenshot Capture
 * 
 * This script captures a screenshot of the search results page.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function captureSearchPage() {
  console.log('Finding Chromium path...');
  const chromiumPath = execSync('which chromium').toString().trim();
  console.log(`Found Chromium at: ${chromiumPath}`);
  
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: true,
    executablePath: chromiumPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to search page with query
    console.log('Navigating to search page...');
    await page.goto('http://localhost:3001/search?q=blood', { waitUntil: 'networkidle0' });
    
    // Wait for search results to load
    console.log('Waiting for search results...');
    await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {
      console.log('No search results found. Taking screenshot anyway.');
    });
    
    // Take screenshot
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'search-results.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

captureSearchPage();