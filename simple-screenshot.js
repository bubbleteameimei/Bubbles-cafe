import puppeteer from 'puppeteer';

async function takeScreenshot() {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Open a new page
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    // Navigate to the website
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Wait for content to load
    console.log('Waiting for content to load...');
    await page.waitForSelector('.bg-homepage', { timeout: 10000 });
    
    // Wait a moment for animations
    await new Promise(r => setTimeout(r, 1000));
    
    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    
    console.log('Screenshot saved as homepage-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

takeScreenshot();