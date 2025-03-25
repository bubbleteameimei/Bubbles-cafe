import puppeteer from 'puppeteer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureReaderPageScreenshot() {
  console.log('Starting reader page screenshot capture...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to better visualize the layout
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to reader page
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3001/reader', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the page content to load
    await page.waitForSelector('[data-reader-page="true"]', { timeout: 30000 });
    
    // Wait a bit for all animations to settle
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot focusing on the top section
    console.log('Taking screenshot of reader page...');
    
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
    
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'reader-spacing.png'),
      clip: {
        x: 0,
        y: 0,
        width: 1280,
        height: 300  // Focus on the top part where navigation and controls are
      }
    });
    
    console.log('Screenshot saved to ./screenshots/reader-spacing.png');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureReaderPageScreenshot();