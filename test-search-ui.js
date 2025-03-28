/**
 * Search UI Test Script
 * 
 * This script tests the search UI to verify that the simplification changes are working correctly.
 */

import puppeteer from 'puppeteer';

async function testSearchUI() {
  console.log('Starting Search UI test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to search with a query
    console.log('Navigating to search page...');
    await page.goto('http://localhost:3001/search?q=policy', {
      waitUntil: 'networkidle2'
    });
    
    // Wait for search results to load
    await page.waitForSelector('.grid');
    
    // Check if search results title is absent (as per our changes)
    const searchResultsText = await page.evaluate(() => {
      const searchResultsTitle = document.querySelector('h1, h2, h3, h4, h5, h6');
      return searchResultsTitle ? searchResultsTitle.innerText : null;
    });
    
    if (!searchResultsText || !searchResultsText.includes('Search Results')) {
      console.log('✅ Search results title has been removed successfully');
    } else {
      console.log('❌ Search results title is still present');
    }
    
    // Check if search results count text is absent
    const resultsCountText = await page.evaluate(() => {
      // Look for paragraph with text containing "Found" and "results"
      const paragraphs = Array.from(document.querySelectorAll('p'));
      return paragraphs.some(p => p.innerText.includes('Found') && p.innerText.includes('results'));
    });
    
    if (!resultsCountText) {
      console.log('✅ Search results count text has been removed successfully');
    } else {
      console.log('❌ Search results count text is still present');
    }
    
    // Check if back button is absent
    const backButton = await page.evaluate(() => {
      // Look for button with text "Back" or arrow icon
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.innerText.includes('Back') || b.innerHTML.includes('arrow'));
    });
    
    if (!backButton) {
      console.log('✅ Back button has been removed successfully');
    } else {
      console.log('❌ Back button is still present');
    }
    
    // Check if admin mode dropdown is present (should be kept)
    const adminDropdown = await page.evaluate(() => {
      return !!document.querySelector('select') || !!document.querySelector('[data-radix-select-trigger]');
    });
    
    if (adminDropdown) {
      console.log('✅ Admin mode dropdown is still present');
    } else {
      console.log('⚠️ Admin mode dropdown may be missing');
    }
    
    // Capture screenshot of final state
    await page.screenshot({ path: 'search-ui-test.png' });
    console.log('📸 Screenshot saved to search-ui-test.png');
    
    console.log('Search UI test completed');
  } catch (error) {
    console.error('Error during search UI test:', error);
  } finally {
    await browser.close();
  }
}

testSearchUI();