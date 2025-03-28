import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testCommentFlagDialog() {
  console.log('Starting test for comment flag dialog...');
  
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to a story page with comments
    console.log('Navigating to a story page...');
    await page.goto('http://localhost:3001/story/nostalgia', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the comments section to load
    console.log('Waiting for comments section to load...');
    await page.waitForSelector('.antialiased', { timeout: 10000 });
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'comment-section-before.png' });
    console.log('Captured initial screenshot');
    
    // Find a flag button and click it
    console.log('Finding and clicking a flag button...');
    const flagButton = await page.waitForSelector('button[title="Report this comment"]', { timeout: 5000 });
    await flagButton.click();
    
    // Wait for the dialog to appear
    console.log('Waiting for confirmation dialog...');
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
    
    // Take a screenshot with the dialog open
    await page.screenshot({ path: 'comment-flag-dialog.png' });
    console.log('Captured dialog screenshot');
    
    // Press the "Report Comment" button
    console.log('Confirming flag action...');
    const reportButton = await page.waitForSelector('button:has-text("Report Comment")');
    await reportButton.click();
    
    // Wait for the toast notification
    console.log('Waiting for toast notification...');
    await page.waitForSelector('[role="status"]', { timeout: 5000 });
    
    // Take a final screenshot
    await page.screenshot({ path: 'comment-section-after.png' });
    console.log('Captured final screenshot');
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testCommentFlagDialog();