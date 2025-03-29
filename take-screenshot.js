/**
 * Simple Screenshot Script
 * 
 * This script captures a screenshot of the website and saves it to screenshot.png
 */
import puppeteer from 'puppeteer';

async function takeScreenshot() {
  console.log('Starting screenshot capture process...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport size to desktop
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });
    
    console.log('Navigating to the website...');
    await page.goto('http://localhost:3001/', {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });
    
    console.log('Waiting for page to stabilize...');
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: false });
    console.log('Screenshot saved to homepage-screenshot.png');
    
    // Navigate to reader page to try to trigger loading screen
    console.log('Navigating to reader page to capture loading screen...');
    
    // Click on the first story if available
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
        page.click('a[href="/reader"]')
      ]);
    } catch (e) {
      console.log('Navigation error, trying alternative method:', e.message);
      await page.goto('http://localhost:3001/reader', {
        waitUntil: 'networkidle0',
        timeout: 15000,
      });
    }
    
    console.log('Taking screenshot of reader page...');
    await page.screenshot({ path: 'reader-screenshot.png', fullPage: false });
    console.log('Screenshot saved to reader-screenshot.png');
    
    // Now try to capture the loading screen during a transition
    console.log('Attempting to capture loading screen during transition...');
    
    // Go back to homepage
    await page.goto('http://localhost:3001/', {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
    
    // Start watching for the loading screen element
    await page.evaluate(() => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && 
                  node.querySelector && 
                  node.querySelector('.loader')) {
                console.log('Loading screen detected!');
                window.__loadingDetected = true;
              }
            }
          }
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      window.__loadingDetected = false;
    });
    
    // Click to trigger navigation with a race condition to capture the loading screen
    try {
      // Navigate to reader page which should trigger loading screen
      console.log('Clicking to navigate and capture loading screen...');
      const loadingPromise = page.waitForFunction(() => window.__loadingDetected, { timeout: 5000 });
      await page.click('a[href="/reader"]');
      
      // Try to capture the loading screen
      await loadingPromise;
      console.log('Loading screen detected! Taking screenshot...');
      await page.screenshot({ path: 'loading-screen.png', fullPage: false });
      console.log('Loading screen screenshot saved to loading-screen.png');
    } catch (e) {
      console.log('Failed to capture loading screen:', e.message);
    }
    
  } catch (error) {
    console.error('Error during screenshot capture:', error);
  } finally {
    await browser.close();
    console.log('Screenshot capture process completed');
  }
}

takeScreenshot().catch(console.error);