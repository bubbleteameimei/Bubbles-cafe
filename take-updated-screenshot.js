import puppeteer from 'puppeteer';

async function takeScreenshot() {
  console.log('Launching Chrome browser...');
  
  try {
    // Launch browser with specific Chromium executable path
    const browser = await puppeteer.launch({
      executablePath: '/nix/store/qkysljgai9zrwl5k1j3c2k4l1n9qaxh4-chromium-121.0.6167.184/bin/chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('Browser launched successfully');
    
    // Open a new page
    const page = await browser.newPage();
    
    // Set viewport size for consistent screenshots
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    console.log('Page loaded successfully');
    
    // Take the screenshot
    await page.screenshot({
      path: 'screenshot-updated-nav.jpg',
      type: 'jpeg',
      quality: 90,
      fullPage: false,
    });
    
    console.log('Screenshot saved to screenshot-updated-nav.jpg');
    
    // Close the browser
    await browser.close();
    console.log('Browser closed');
    
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

takeScreenshot();