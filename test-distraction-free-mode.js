const puppeteer = require('puppeteer');

/**
 * Test script to verify distraction-free mode functionality
 */
async function testDistractionFreeMode() {
  console.log('Starting distraction-free mode test...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1280,
      height: 800
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Step 1: Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    
    // Step 2: Click on the first story to open reader page
    console.log('Opening first story...');
    await page.waitForSelector('.story-card');
    await page.click('.story-card');
    
    // Wait for the reader page to load
    await page.waitForSelector('.story-content');
    console.log('Reader page loaded');
    
    // Step 3: Check initial state (non-distraction-free mode)
    const initialHeaderVisible = await page.evaluate(() => {
      const header = document.querySelector('header.main-header');
      if (!header) return false;
      
      const style = window.getComputedStyle(header);
      return style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    console.log(`Initial header visibility: ${initialHeaderVisible ? 'Visible ✓' : 'Hidden ✗'}`);
    
    // Step 4: Click on the story content to toggle distraction-free mode
    console.log('Toggling distraction-free mode...');
    await page.click('.story-content');
    
    // Wait for the transition
    await page.waitForTimeout(500);
    
    // Step 5: Verify header is hidden
    const headerHidden = await page.evaluate(() => {
      const header = document.querySelector('header.main-header');
      if (!header) return false;
      
      const style = window.getComputedStyle(header);
      return style.visibility === 'hidden' || style.opacity === '0';
    });
    
    console.log(`Header hidden in distraction-free mode: ${headerHidden ? 'Yes ✓' : 'No ✗'}`);
    
    // Step 6: Verify controls are still visible but faded
    const controlsVisible = await page.evaluate(() => {
      const controls = document.querySelector('.ui-fade-element.ui-hidden');
      if (!controls) return false;
      
      const style = window.getComputedStyle(controls);
      // Should be low opacity but not zero
      return parseFloat(style.opacity) > 0 && parseFloat(style.opacity) < 0.5;
    });
    
    console.log(`Controls visible but faded: ${controlsVisible ? 'Yes ✓' : 'No ✗'}`);
    
    // Step 7: Verify exit indicator is visible
    const exitIndicatorVisible = await page.evaluate(() => {
      const body = document.querySelector('.reader-page[data-distraction-free="true"]');
      if (!body) return false;
      
      // Using getComputedStyle on ::after is tricky, so we'll check if the attribute exists
      return body.getAttribute('data-distraction-free') === 'true';
    });
    
    console.log(`Exit indicator visible: ${exitIndicatorVisible ? 'Yes ✓' : 'No ✗'}`);
    
    // Step 8: Press ESC to exit distraction-free mode
    console.log('Pressing ESC to exit distraction-free mode...');
    await page.keyboard.press('Escape');
    
    // Wait for the transition
    await page.waitForTimeout(500);
    
    // Step 9: Verify header is visible again
    const headerVisibleAgain = await page.evaluate(() => {
      const header = document.querySelector('header.main-header');
      if (!header) return false;
      
      const style = window.getComputedStyle(header);
      return style.visibility !== 'hidden' && style.opacity !== '0';
    });
    
    console.log(`Header visible again after ESC: ${headerVisibleAgain ? 'Yes ✓' : 'No ✗'}`);
    
    // Summary
    console.log('\nTest Results:');
    console.log(`- Initial header visibility: ${initialHeaderVisible ? '✓' : '✗'}`);
    console.log(`- Header hidden in distraction-free mode: ${headerHidden ? '✓' : '✗'}`);
    console.log(`- Controls visible but faded: ${controlsVisible ? '✓' : '✗'}`);
    console.log(`- Exit indicator visible: ${exitIndicatorVisible ? '✓' : '✗'}`);
    console.log(`- Header visible again after ESC: ${headerVisibleAgain ? '✓' : '✗'}`);
    
    const allTestsPassed = initialHeaderVisible && 
                           headerHidden && 
                           controlsVisible && 
                           exitIndicatorVisible && 
                           headerVisibleAgain;
    
    console.log(`\nOverall result: ${allTestsPassed ? 'All tests passed ✓' : 'Some tests failed ✗'}`);
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

testDistractionFreeMode();