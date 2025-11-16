/**
 * Simple test script for anonymous comments using mjs extension
 */
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

async function testSimpleCommentSection() {
  console.log('Starting comment section test...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: resolveChromePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to a story page
    const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
    await page.goto(`${BASE_URL}/reader/blood`, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Page loaded, checking comment section...');
    
    // Take a screenshot of the current page
    await page.screenshot({ path: 'screenshots/story-page.png' });
    
    // Check if the comment section is present
    const commentSectionExists = await page.evaluate(() => {
      return !!document.querySelector('.antialiased');
    });
    
    console.log(`Comment section exists: ${commentSectionExists}`);
    
    if (commentSectionExists) {
      // Check if the text "Posting as Anonymous" is present
      const anonymousTextExists = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.text-xs, .text-muted-foreground'));
        return elements.some(el => el.textContent.includes('Anonymous'));
      });
      
      console.log(`"Anonymous" text found: ${anonymousTextExists}`);
      
      // Verify that no input field for name exists
      const nameInputExists = await page.evaluate(() => {
        return !!document.querySelector('input[placeholder="Your name"]');
      });
      
      console.log(`Name input field exists (should be false): ${nameInputExists}`);
      
      // Screenshot the comment form
      const commentFormBoundingBox = await page.evaluate(() => {
        const element = document.querySelector('form');
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        };
      });
      
      if (commentFormBoundingBox) {
        await page.screenshot({
          path: 'screenshots/comment-form.png',
          clip: {
            x: commentFormBoundingBox.x,
            y: commentFormBoundingBox.y,
            width: commentFormBoundingBox.width,
            height: commentFormBoundingBox.height
          }
        });
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSimpleCommentSection().catch(console.error);