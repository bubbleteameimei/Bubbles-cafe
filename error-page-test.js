import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a decent size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Test all error pages in both light and dark modes
    const errorPages = [403, 404, 429, 500, 503, 504];
    const themes = ['dark', 'light'];
    
    for (const theme of themes) {
      // Set theme using localStorage
      await page.evaluateOnNewDocument((themeSetting) => {
        localStorage.setItem('vite-ui-theme', themeSetting);
      }, theme);
      
      for (const errorCode of errorPages) {
        const url = `http://localhost:3000/errors/${errorCode}`;
        
        console.log(`Testing ${url} in ${theme} mode`);
        
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Allow animations to settle
        await page.waitForTimeout(1000);
        
        // Take screenshot
        await page.screenshot({
          path: path.join(screenshotsDir, `error-${errorCode}-${theme}.png`),
          fullPage: true
        });
        
        console.log(`Screenshot saved for ${errorCode} in ${theme} mode`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();