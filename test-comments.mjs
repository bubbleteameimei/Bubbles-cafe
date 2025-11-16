import fs from 'fs';
import puppeteer from 'puppeteer-core';

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

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: resolveChromePath()
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to the story page...');
    const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
    await page.goto(`${BASE_URL}/reader/nostalgia`, { 
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Scroll to the comment section
    console.log('Scrolling to the comment section...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.8);
    });
    
    // Wait for the comment form to load
    await page.waitForSelector('.antialiased', { timeout: 5000 });
    
    // Take a screenshot of the comments section
    console.log('Taking screenshot...');
    const commentSection = await page.$('.antialiased');
    if (commentSection) {
      await commentSection.screenshot({ path: 'comment-section.png' });
      console.log('Screenshot saved as comment-section.png');
    } else {
      console.error('Could not find the comment section!');
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

captureScreenshot();