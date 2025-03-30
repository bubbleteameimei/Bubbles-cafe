/**
 * Simple Screenshot to check ScrollToTopButton positioning
 */
import puppeteer from 'puppeteer';

async function takeButtonScreenshot() {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Opening new page...');
    const page = await browser.newPage();
    
    // Set viewports to match common device sizes
    await page.setViewport({
      width: 1280,
      height: 800
    });

    console.log('Navigating to the homepage...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle2'
    });
    
    // Scroll down to make the button appear
    console.log('Scrolling down to make button appear...');
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    
    // Wait for the button to appear
    console.log('Waiting for button to appear...');
    await page.waitForTimeout(1000);
    
    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'button-screenshot.png' });
    
    console.log('Screenshot saved to button-screenshot.png');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

takeButtonScreenshot().catch(console.error);