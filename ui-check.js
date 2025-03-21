import puppeteer from 'puppeteer';

async function takeScreenshot() {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Navigate to the index page
    console.log('Navigating to the index page...');
    await page.goto('http://localhost:3001/stories', { 
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Wait for content to load
    await page.waitForSelector('.story-card-container', { timeout: 5000 });
    
    console.log('Taking screenshot...');
    // Take a screenshot
    await page.screenshot({ path: 'stories-page.png' });
    
    // Check if filtration elements exist
    const hasSearchBar = await page.evaluate(() => {
      return !!document.querySelector('input[type="search"]');
    });
    
    const hasPagination = await page.evaluate(() => {
      return !!document.querySelector('.pagination');
    });
    
    const hasFilter = await page.evaluate(() => {
      return !!document.querySelector('select[name="theme"]');
    });
    
    // Print results
    console.log('UI Check Results:');
    console.log(`- Search bar present: ${hasSearchBar ? '✓' : '✗'}`);
    console.log(`- Pagination present: ${hasPagination ? '✓' : '✗'}`);
    console.log(`- Theme filter present: ${hasFilter ? '✓' : '✗'}`);
    console.log(`- Story cards visible: ${await page.evaluate(() => document.querySelectorAll('.story-card-container').length)}`);
    
    // Check for mist effect
    const hasMist = await page.evaluate(() => {
      return !!document.querySelector('.mist-container');
    });
    console.log(`- Mist effect present: ${hasMist ? '✓' : '✗'}`);
    
    console.log('Screenshot saved as stories-page.png');
  } catch (error) {
    console.error('Error during screenshot process:', error);
  } finally {
    await browser.close();
  }
}

// Run the screenshot function
takeScreenshot();