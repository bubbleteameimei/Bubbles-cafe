/**
 * Verification Screenshot Script
 * 
 * This script takes screenshots of key pages to verify our improvements:
 * 1. Homepage layout to check fullwidth fixes
 * 2. Reader page with table of contents dialog to verify story count 
 * 3. Navigation bar to verify slimmed down appearance
 */
import puppeteer from 'puppeteer';

async function takeVerificationScreenshots() {
  console.log('Starting verification screenshots...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Screenshot 1: Homepage to verify fullwidth
    console.log('Taking homepage screenshot...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'homepage-fullwidth.png' });
    
    // Screenshot 2: Reader page to verify slimmed navigation
    console.log('Taking reader page screenshot...');
    await page.goto('http://localhost:3001/reader/blood', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'reader-slimmed-nav.png' });
    
    // Screenshot 3: Open table of contents and verify story count
    console.log('Taking table of contents screenshot...');
    // Find and click the Table of Contents button
    const tocButton = await page.waitForSelector('button:has-text("Contents")');
    await tocButton.click();
    
    // Wait for the dialog to appear
    await page.waitForSelector('[role="dialog"]');
    
    // Make sure the story count is visible
    await page.waitForSelector('text/Total stories in library');
    
    // Take screenshot
    await page.screenshot({ path: 'toc-story-count.png' });
    
    console.log('Verification screenshots completed successfully!');
    
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeVerificationScreenshots();