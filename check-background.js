/**
 * Simple script to check if the background image is displaying correctly
 */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot() {
  console.log('Launching browser to check background...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001/', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Wait for background to load
    await page.waitForSelector('.bg-homepage', { timeout: 5000 });
    
    console.log('Checking if background element exists and is visible...');
    const bgElement = await page.$('.bg-homepage');
    
    if (!bgElement) {
      console.error('❌ Background element not found!');
    } else {
      console.log('✅ Background element found');
      
      // Check if it has the right CSS properties
      const bgStyle = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          backgroundImage: style.backgroundImage,
          backgroundAttachment: style.backgroundAttachment,
          zIndex: style.zIndex
        };
      }, bgElement);
      
      console.log('Background style:', bgStyle);
      
      // Create screenshots directory if it doesn't exist
      const screenshotDir = path.join(__dirname, 'screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
      }
      
      // Take full page screenshot
      console.log('Taking screenshot...');
      await page.screenshot({
        path: path.join(screenshotDir, 'homepage-full.png'),
        fullPage: true
      });
      
      // Take viewport screenshot
      await page.screenshot({
        path: path.join(screenshotDir, 'homepage-viewport.png')
      });
      
      console.log('✅ Screenshots saved to screenshots directory');
    }
    
  } catch (error) {
    console.error('Error checking background:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot()
  .then(() => console.log('Background check complete'))
  .catch(err => console.error('Error running background check:', err));