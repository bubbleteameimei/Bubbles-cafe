/**
 * Simple Screenshot Script to check layout
 * 
 * This script captures a screenshot to verify the page layout is properly full-width
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport to a standard desktop size
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('Navigating to the app...');
    await page.goto('https://26db112a-75ae-42f7-b3bf-6190f0d60ade-00-3i2ulcg3ig8s3.spock.replit.dev:3001/', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
    
    // Take a screenshot of the whole page
    console.log('Taking screenshot...');
    const screenshotPath = path.join(screenshotsDir, 'layout-check.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    
    console.log(`Screenshot saved to ${screenshotPath}`);
    
    // Check if the page takes up the full width
    const isFullWidth = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      // Check if there are any overflows
      const styles = window.getComputedStyle(body);
      const bodyWidth = body.offsetWidth;
      const windowWidth = window.innerWidth;
      
      console.log(`Body width: ${bodyWidth}px, Window width: ${windowWidth}px`);
      
      // Check horizontal overflow
      const hasHorizontalScroll = html.scrollWidth > html.clientWidth;
      console.log(`Has horizontal scroll: ${hasHorizontalScroll}`);
      
      // Get the visible width percentage
      const visibleWidthPercentage = (bodyWidth / windowWidth) * 100;
      console.log(`Visible width percentage: ${visibleWidthPercentage.toFixed(2)}%`);
      
      return {
        bodyWidth,
        windowWidth,
        hasHorizontalScroll,
        visibleWidthPercentage: parseFloat(visibleWidthPercentage.toFixed(2)),
        overflowX: styles.overflowX,
        isNearFullWidth: visibleWidthPercentage > 90
      };
    });
    
    console.log('Layout analysis:');
    console.log(isFullWidth);
    
    if (isFullWidth.isNearFullWidth) {
      console.log('✅ Page layout is properly full-width');
    } else {
      console.log('❌ Page layout is not full-width. Only using approximately ' + 
                 isFullWidth.visibleWidthPercentage + '% of available width');
    }
    
    // Now navigate to the reader page to check it as well
    console.log('Navigating to the reader page...');
    await page.goto('https://26db112a-75ae-42f7-b3bf-6190f0d60ade-00-3i2ulcg3ig8s3.spock.replit.dev:3001/reader', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    
    // Wait for the reader page to be fully loaded
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take a screenshot of the reader page
    console.log('Taking screenshot of reader page...');
    const readerScreenshotPath = path.join(screenshotsDir, 'reader-layout-check.png');
    await page.screenshot({
      path: readerScreenshotPath,
      fullPage: true
    });
    
    console.log(`Reader screenshot saved to ${readerScreenshotPath}`);
    
    // Check if the reader page takes up the full width
    const isReaderFullWidth = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      // Check if there are any overflows
      const styles = window.getComputedStyle(body);
      const bodyWidth = body.offsetWidth;
      const windowWidth = window.innerWidth;
      
      console.log(`Reader body width: ${bodyWidth}px, Window width: ${windowWidth}px`);
      
      // Check horizontal overflow
      const hasHorizontalScroll = html.scrollWidth > html.clientWidth;
      console.log(`Reader has horizontal scroll: ${hasHorizontalScroll}`);
      
      // Get the visible width percentage
      const visibleWidthPercentage = (bodyWidth / windowWidth) * 100;
      console.log(`Reader visible width percentage: ${visibleWidthPercentage.toFixed(2)}%`);
      
      return {
        bodyWidth,
        windowWidth,
        hasHorizontalScroll,
        visibleWidthPercentage: parseFloat(visibleWidthPercentage.toFixed(2)),
        overflowX: styles.overflowX,
        isNearFullWidth: visibleWidthPercentage > 90
      };
    });
    
    console.log('Reader layout analysis:');
    console.log(isReaderFullWidth);
    
    if (isReaderFullWidth.isNearFullWidth) {
      console.log('✅ Reader page layout is properly full-width');
    } else {
      console.log('❌ Reader page layout is not full-width. Only using approximately ' + 
                 isReaderFullWidth.visibleWidthPercentage + '% of available width');
    }
    
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

captureScreenshot().catch(console.error);