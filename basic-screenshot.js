import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle0',
      timeout: 5000 // Shorter timeout
    });
    
    console.log('Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'homepage.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Screenshot saved to ${screenshotPath}`);
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
})();