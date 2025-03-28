/**
 * Search Page Screenshot Capture
 * 
 * This script captures a screenshot of the search results page.
 */

import puppeteer from 'puppeteer';

async function captureSearchPage() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to the homepage...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2', timeout: 15000 });
    
    console.log('Waiting for search input to load...');
    await page.waitForSelector('input[name="searchQuery"]', { visible: true, timeout: 10000 });
    
    // Type in search query
    console.log('Typing search query...');
    await page.type('input[name="searchQuery"]', 'blood');
    
    // Submit the search form
    console.log('Submitting search form...');
    await page.keyboard.press('Enter');
    
    // Wait for search results to load
    console.log('Waiting for search results to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    // Wait for search results content
    await page.waitForSelector('.search-results', { visible: true, timeout: 10000 });
    
    console.log('Taking screenshot of search results page...');
    await page.screenshot({ path: './search-results.png', fullPage: true });
    
    console.log('Screenshot saved as search-results.png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

captureSearchPage();