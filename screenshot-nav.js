import puppeteer from 'puppeteer';

async function takeNavScreenshot() {
  try {
    console.log('Launching headless browser...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    
    // Wait for the navigation to be visible
    await page.waitForSelector('header', { visible: true, timeout: 5000 });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'screenshots/navigation-buttons.png' });
    
    console.log('Screenshot saved successfully!');
    await browser.close();
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeNavScreenshot();