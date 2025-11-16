const fs = require('fs');
const puppeteer = require('puppeteer-core');

function resolveChromePath() {
  const env =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROME_PATH ||
    process.env.CHROMIUM_PATH;
  if (env && fs.existsSync(env)) return env;
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  return candidates.find(p => fs.existsSync(p));
}

async function testLoadingScreen() {
  console.log("Testing loading screen visibility...");
  
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: resolveChromePath(),
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    console.log("Navigating to the homepage...");
    const BASE_URL = process.env.APP_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002';
    await page.goto(`${BASE_URL}/`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'homepage-screenshot.png' });
    console.log("✓ Captured homepage screenshot");
    
    // Click on a link to trigger the loading screen
    console.log("Clicking on a post to trigger page transition...");
    
    // First capture the loading screen (using a flag to detect it)
    let loadingDetected = false;
    
    // Setup an observer for the loading screen
    await page.exposeFunction('notifyLoadingDetected', () => {
      loadingDetected = true;
      console.log("✓ Loading screen detected!");
    });
    
    // Add a mutation observer to detect loading screen
    await page.evaluateOnNewDocument(() => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length) {
            for (const node of mutation.addedNodes) {
              if (node.classList && 
                  (node.querySelector('.loader') || 
                   node.classList.contains('loader'))) {
                window.notifyLoadingDetected();
              }
            }
          }
        }
      });
      
      // Start observing when document is ready
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
      });
    });
    
    // Now find and click a post link
    const postLinks = await page.$('a[href^="/reader/"]');
    
    if (postLinks.length > 0) {
      // Add a small wait to ensure the page is fully loaded
      await page.waitForTimeout(1000);
      
      // Click the post to trigger navigation
      await postLinks[0].click();
      
      // Try to capture the loading screen (quick timing)
      await page.waitForTimeout(200);
      await page.screenshot({ path: 'during-transition.png' });
      console.log("✓ Attempted to capture loading screen");
      
      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Take screenshot of destination page
      await page.screenshot({ path: 'destination-page.png' });
      console.log("✓ Captured destination page screenshot");
      
      console.log(`Loading screen was ${loadingDetected ? 'successfully' : 'not'} detected`);
    } else {
      console.log("No post links found on homepage");
    }
    
    // Close the browser
    await browser.close();
    
    console.log("Testing completed. Check the following screenshots:");
    console.log("1. homepage-screenshot.png - The initial page");
    console.log("2. during-transition.png - During page transition (may or may not show loading)");
    console.log("3. destination-page.png - The destination page after transition");
    
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

testLoadingScreen();