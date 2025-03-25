/**
 * Script to check the reader page layout after our fixes
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkReaderLayout() {
  console.log('Starting browser to check reader page layout...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });
    
    // Navigate to the reader page with a specific post
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3001/reader/nostalgia', { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for the content to load
    await page.waitForSelector('.story-content', { timeout: 5000 });
    
    // Take a screenshot
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'reader-layout-fixed.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    console.log(`Screenshot saved to: ${screenshotPath}`);
    
    // Check for the container padding
    const containerPadding = await page.evaluate(() => {
      const storyContent = document.querySelector('.story-content');
      if (!storyContent) return 'Story content not found';
      
      const styles = window.getComputedStyle(storyContent);
      return {
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        width: styles.width,
        maxWidth: styles.maxWidth
      };
    });
    
    console.log('Story content padding and width:', containerPadding);
    
    return { success: true, message: 'Reader layout check completed', containerPadding };
  } catch (error) {
    console.error('Error checking reader layout:', error);
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}

// Run the function
checkReaderLayout()
  .then(result => {
    console.log('Result:', result);
  })
  .catch(error => {
    console.error('Script error:', error);
  });