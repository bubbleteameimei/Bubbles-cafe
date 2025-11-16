/**
 * Simple screenshot utility to check if the background image is displayed correctly
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveChromePath() {
  const env =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    process.env.CHROMIUM_PATH;
  if (env && fs.existsSync(env)) return env;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  return candidates.find(p => fs.existsSync(p));
}

async function takeScreenshot() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: resolveChromePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1
    });
    
    // Navigate to the page
    console.log('Navigating to homepage...');
    const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Wait for content to load
    console.log('Waiting for content to load...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Create screenshots directory if it doesn't exist
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({
      path: path.join(screenshotDir, 'homepage.png'),
      fullPage: true
    });
    
    console.log(`Screenshot saved to ${path.join(screenshotDir, 'homepage.png')}`);
    
    // Check for specific element that should have the background
    console.log('Checking for background elements...');
    const pageContent = await page.content();
    
    // Print some basic page info for debugging
    const backgroundElements = await page.evaluate(() => {
      const elements = [];
      // Check for the main background element
      const bgElement = document.querySelector('.bg-homepage');
      
      if (bgElement) {
        const style = window.getComputedStyle(bgElement);
        elements.push({
          element: '.bg-homepage',
          exists: true,
          backgroundImage: style.backgroundImage,
          position: style.position,
          zIndex: style.zIndex,
          width: style.width,
          height: style.height
        });
      } else {
        elements.push({
          element: '.bg-homepage',
          exists: false
        });
      }
      
      // Check for body background
      const bodyStyle = window.getComputedStyle(document.body);
      elements.push({
        element: 'body',
        backgroundImage: bodyStyle.backgroundImage,
        backgroundColor: bodyStyle.backgroundColor
      });
      
      // Check for any elements with background images
      const allElements = document.querySelectorAll('*');
      const bgElements = Array.from(allElements).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage !== 'none';
      }).slice(0, 5); // Limit to first 5 to avoid overwhelming output
      
      bgElements.forEach(el => {
        const style = window.getComputedStyle(el);
        elements.push({
          element: el.tagName.toLowerCase() + (el.className ? '.' + el.className.replace(/\\s+/g, '.') : ''),
          backgroundImage: style.backgroundImage
        });
      });
      
      return elements;
    });
    
    console.log('Background elements found:', JSON.stringify(backgroundElements, null, 2));
    
    return {
      success: true,
      screenshotPath: path.join(screenshotDir, 'homepage.png'),
      backgroundElements
    };
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the script
takeScreenshot()
  .then(result => {
    console.log('Screenshot process completed');
    if (result.success) {
      console.log(`Screenshot saved to ${result.screenshotPath}`);
    } else {
      console.error(`Failed to take screenshot: ${result.error}`);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
  });