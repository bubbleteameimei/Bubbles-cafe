import puppeteer from 'puppeteer';

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to reader page...');
    // Visit the reader page
    await page.goto('http://localhost:3001/reader', { waitUntil: 'networkidle0' });
    console.log('Page loaded, waiting for content...');
    
    // Wait for content to appear
    await page.waitForSelector('.story-content', { timeout: 5000 });
    
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-page-screenshot.png' });
    console.log('Screenshot saved as reader-page-screenshot.png');
    
    // Take a screenshot of nav area to check username positioning
    console.log('Taking screenshot of navigation area...');
    const navElement = await page.$('header');
    if (navElement) {
      await navElement.screenshot({ path: 'nav-screenshot.png' });
      console.log('Screenshot saved as nav-screenshot.png');
    } else {
      console.log('Navigation element not found');
    }
    
  } catch (error) {
    console.error('Error during screenshot process:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

captureScreenshot();