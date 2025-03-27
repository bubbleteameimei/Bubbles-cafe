import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshot() {
  console.log('Launching browser to capture comment section screenshot...');
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new",
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium'
  });
  const page = await browser.newPage();
  
  // Set viewport to desktop size
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    console.log('Navigating to the story page...');
    await page.goto('http://0.0.0.0:3001/story/nostalgia', { waitUntil: 'networkidle2' });
    
    // Wait for the comment section to render
    await page.waitForSelector('.antialiased', { timeout: 5000 });
    
    // Scroll down to comment section
    await page.evaluate(() => {
      const commentSection = document.querySelector('.antialiased');
      if (commentSection) {
        commentSection.scrollIntoView();
      }
    });
    
    // Wait for a moment to ensure everything is rendered
    await page.waitForTimeout(1000);
    
    // Take a screenshot of just the comment section
    const commentSection = await page.$('.antialiased');
    if (commentSection) {
      const screenshotPath = path.join(__dirname, 'screenshots', 'comment-section.png');
      
      // Ensure directory exists
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      await commentSection.screenshot({ path: screenshotPath });
      console.log(`Screenshot saved to ${screenshotPath}`);
    } else {
      console.error('Could not find comment section element');
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshot();