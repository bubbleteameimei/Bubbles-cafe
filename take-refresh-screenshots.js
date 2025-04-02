const puppeteer = require('puppeteer');

async function captureScreenshot() {
  // Launch the browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to mobile size to better simulate mobile experience
  await page.setViewport({
    width: 375,
    height: 812,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  
  // Visit the refresh demo page
  await page.goto('http://localhost:3000/refresh-demo', { waitUntil: 'networkidle0' });
  
  // Wait for any needed elements to ensure page is loaded
  await page.waitForSelector('h1');
  
  // Take screenshot
  await page.screenshot({ path: './refresh-demo-screenshot.png', fullPage: true });
  
  // Use a more reliable selector for the refresh button
  const refreshButton = await page.$('button');
  if (refreshButton) {
    await refreshButton.click();
    
    // Wait a moment to let the refresh animation start
    await page.waitForTimeout(500);
    
    // Take another screenshot showing the refresh state
    await page.screenshot({ path: './refresh-demo-refreshing.png', fullPage: true });
  }
  
  // Close the browser
  await browser.close();
  
  console.log('Screenshots taken successfully!');
}

captureScreenshot().catch(console.error);
