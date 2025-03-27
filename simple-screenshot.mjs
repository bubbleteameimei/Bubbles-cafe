import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new",
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium'
  });
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({ width: 1280, height: 1280 });
  
  try {
    console.log('Navigating to the story page...');
    await page.goto('http://0.0.0.0:3001/story/nostalgia', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for a moment to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create screenshots directory if it doesn't exist
    const dir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Take a screenshot of the full page
    const screenshotPath = path.join(dir, 'story-page.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true
    });
    console.log(`Screenshot saved to ${screenshotPath}`);
    
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot();