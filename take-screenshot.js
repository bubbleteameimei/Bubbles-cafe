// Screenshot script
import puppeteer from 'puppeteer';

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Set viewport to a reasonable size
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
  });
  
  try {
    // Go to reader page
    await page.goto('http://localhost:3001/reader', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    console.log('Page loaded, taking screenshot...');
    
    // Take a screenshot
    await page.screenshot({ path: 'reader-page-screenshot.png' });
    console.log('Screenshot saved to reader-page-screenshot.png');
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot().catch(console.error);