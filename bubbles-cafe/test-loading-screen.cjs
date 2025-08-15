const puppeteer = require('puppeteer');

async function testLoadingScreen() {
  console.log("Testing loading screen visibility...");
  
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    console.log("Navigating to the homepage...");
    await page.goto('http://localhost:3001/', {
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
    const postLinks = await page.$$('a[href^="/reader/"]');
    
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