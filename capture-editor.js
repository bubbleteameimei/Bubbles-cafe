/**
 * Script to capture a screenshot of the enhanced post editor
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureEditorScreenshot() {
  console.log('Launching browser...');
  
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 900 });
    
    // Navigate to the community page
    console.log('Navigating to community page at http://localhost:3003/community...');
    await page.goto('http://localhost:3003/community', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for the page to load
    await page.waitForSelector('button', { timeout: 10000 });
    
    // Click the "Create Post" button to open the editor
    console.log('Clicking "Create Post" button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const createButton = buttons.find(button => button.textContent.includes('Create Post'));
      if (createButton) createButton.click();
    });
    
    // Wait for the editor to appear
    console.log('Waiting for editor to load...');
    await page.waitForSelector('textarea', { timeout: 10000 });
    
    // Take a screenshot of the editor
    console.log('Taking screenshot...');
    const screenshotPath = path.join(process.cwd(), 'enhanced-editor.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Check if the editor has all the new formatting buttons
    const buttonCount = await page.evaluate(() => {
      return document.querySelectorAll('.border-slate-200').length;
    });
    
    console.log(`Found ${buttonCount} formatting buttons in the editor`);
    
    // Verify tooltip functionality
    console.log('Testing tooltip on hover...');
    await page.hover('button[type="button"]'); // Hover over the first button
    await page.waitForTimeout(500); // Give time for tooltip to appear
    
    // Take another screenshot with tooltip visible
    await page.screenshot({ path: 'editor-with-tooltip.png', fullPage: true });
    console.log('Screenshot with tooltip saved');
    
    return { success: true, message: 'Editor screenshots captured successfully' };
  } catch (error) {
    console.error('Error capturing editor:', error);
    return { success: false, message: error.message };
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

captureEditorScreenshot()
  .then(result => {
    console.log(result.message);
    if (!result.success) process.exit(1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });