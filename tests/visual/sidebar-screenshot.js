const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configure screenshot directory
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    // Set viewport to simulate desktop
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });

    console.log('Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    // Wait for the sidebar to be visible
    await page.waitForSelector('.ios-sidebar', { timeout: 10000 });
    console.log('iOS Sidebar detected!');

    // Take a screenshot of just the sidebar
    const sidebarElement = await page.$('.ios-sidebar');
    if (sidebarElement) {
      console.log('Taking screenshot of sidebar...');
      const screenshotPath = path.join(SCREENSHOT_DIR, 'ios-sidebar.png');
      await sidebarElement.screenshot({ path: screenshotPath });
      console.log(`Sidebar screenshot saved to: ${screenshotPath}`);
    } else {
      console.log('Could not find sidebar element to screenshot');
    }

    // Also take a full page screenshot for context
    console.log('Taking full page screenshot...');
    const fullScreenshotPath = path.join(SCREENSHOT_DIR, 'full-page.png');
    await page.screenshot({ path: fullScreenshotPath, fullPage: true });
    console.log(`Full page screenshot saved to: ${fullScreenshotPath}`);

  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

captureScreenshot()
  .then(() => console.log('Screenshot capture complete!'))
  .catch(error => console.error('Screenshot capture failed:', error));