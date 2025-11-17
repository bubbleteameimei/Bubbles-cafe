/**
 * Simple Mobile Screenshot Script
 * 
 * This script uses the chromium browser with puppeteer to take a mobile-sized screenshot
 * of the website navigation.
 */

const fs = require('fs');
const puppeteer = require('puppeteer-core');

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

async function takeMobileScreenshot() {
  console.log('Starting mobile screenshot capture...');
  
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: resolveChromePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set mobile viewport
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });
    
    console.log('Navigating to page...');
    const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
    await page.goto(BASE_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for header to be visible
    console.log('Waiting for content to load...');
    await page.waitForSelector('header', { visible: true, timeout: 10000 });
    
    // Wait a bit more for any animations to finish
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'mobile-nav-screenshot.jpg', quality: 90 });
    
    console.log('Screenshot saved to mobile-nav-screenshot.jpg');
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeMobileScreenshot();