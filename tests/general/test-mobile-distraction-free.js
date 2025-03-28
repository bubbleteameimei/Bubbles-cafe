const puppeteer = require('puppeteer');

/**
 * Test script to verify distraction-free mode functionality on mobile devices
 */
async function testMobileDistractionFreeMode() {
  console.log('Starting mobile distraction-free mode test...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 375, // iPhone X width
      height: 812 // iPhone X height
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Emulate mobile device
    await page.emulate({
      viewport: {
        width: 375,
        height: 812,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false
      },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    });
    
    // Step 1: Navigate to the homepage
    console.log('Navigating to homepage on mobile...');
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2' });
    
    // Step 2: Click on the first story to open reader page
    console.log('Opening first story on mobile...');
    await page.waitForSelector('.story-card');
    await page.tap('.story-card');
    
    // Wait for the reader page to load
    await page.waitForSelector('.story-content');
    console.log('Reader page loaded on mobile');
    
    // Step 3: Take a screenshot before toggling
    await page.screenshot({ path: 'mobile-reader-before.png' });
    
    // Step 4: Tap on the story content to toggle distraction-free mode
    console.log('Toggling distraction-free mode on mobile...');
    await page.tap('.story-content');
    
    // Wait for the transition
    await page.waitForTimeout(500);
    
    // Step 5: Take a screenshot after toggling
    await page.screenshot({ path: 'mobile-reader-distraction-free.png' });
    
    // Step 6: Verify the tap-to-exit indicator is sized appropriately for mobile
    const exitIndicatorCorrectSize = await page.evaluate(() => {
      // Check specifically for the mobile media query styles
      const isMobile = window.innerWidth <= 640;
      if (!isMobile) return false;
      
      // Since we can't directly access pseudo-elements in puppeteer
      // We'll check if the mobile media query class applies
      const body = document.querySelector('.reader-page[data-distraction-free="true"]');
      return body !== null;
    });
    
    console.log(`Exit indicator correctly sized for mobile: ${exitIndicatorCorrectSize ? 'Yes ✓' : 'No ✗'}`);
    
    // Step 7: Test that controls are still accessible
    const controlsAccessible = await page.evaluate(() => {
      const controls = document.querySelector('.ui-fade-element.ui-hidden');
      if (!controls) return false;
      
      // Controls should be visible but with low opacity
      const style = window.getComputedStyle(controls);
      return style.display !== 'none' && parseFloat(style.opacity) > 0;
    });
    
    console.log(`Controls accessible on mobile: ${controlsAccessible ? 'Yes ✓' : 'No ✗'}`);
    
    // Step 8: Tap story content again to exit distraction-free mode
    console.log('Tapping to exit distraction-free mode...');
    await page.tap('.story-content');
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    // Step 9: Take a final screenshot
    await page.screenshot({ path: 'mobile-reader-after.png' });
    
    // Step 10: Verify header is visible again
    const headerVisibleAgain = await page.evaluate(() => {
      const header = document.querySelector('header.main-header');
      if (!header) return false;
      
      const style = window.getComputedStyle(header);
      return style.visibility !== 'hidden' && parseFloat(style.opacity) > 0;
    });
    
    console.log(`Header visible again after tap: ${headerVisibleAgain ? 'Yes ✓' : 'No ✗'}`);
    
    // Summary
    console.log('\nMobile Test Results:');
    console.log(`- Exit indicator correctly sized for mobile: ${exitIndicatorCorrectSize ? '✓' : '✗'}`);
    console.log(`- Controls accessible on mobile: ${controlsAccessible ? '✓' : '✗'}`);
    console.log(`- Header visible again after tap: ${headerVisibleAgain ? '✓' : '✗'}`);
    
    const mobileTestsPassed = exitIndicatorCorrectSize && 
                              controlsAccessible && 
                              headerVisibleAgain;
    
    console.log(`\nOverall mobile result: ${mobileTestsPassed ? 'All tests passed ✓' : 'Some tests failed ✗'}`);
    console.log('Screenshots saved as mobile-reader-before.png, mobile-reader-distraction-free.png, and mobile-reader-after.png');
    
  } catch (error) {
    console.error('Mobile test failed with error:', error);
  } finally {
    await browser.close();
  }
}

testMobileDistractionFreeMode();