// Test script for checking the ProfileImage carousel
import puppeteer from 'puppeteer';

(async () => {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    
    // Navigate to the About page
    await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle2' });
    
    console.log('Page loaded successfully');
    
    // Check for any console errors that might appear
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });

    // Check if all three images are loaded
    const imageCount = await page.evaluate(() => {
      const imgElements = document.querySelectorAll('.min-w-full.h-full img');
      console.log(`Found ${imgElements.length} images in carousel`);
      
      // Check if images are properly positioned and sized
      const css = window.getComputedStyle(imgElements[0]);
      console.log(`First image position: ${css.position}, height: ${css.height}`);
      
      // Test carousel navigation buttons (visual check)
      const navButtons = document.querySelectorAll('button[aria-label="Previous image"], button[aria-label="Next image"]');
      console.log(`Found ${navButtons.length} navigation buttons`);
      
      // Check that there's no play/pause button
      const playPauseBtn = document.querySelector('button[aria-label^="Play"], button[aria-label^="Pause"]');
      console.log(`Play/pause button exists: ${playPauseBtn !== null}`);
      
      return imgElements.length;
    });
    
    console.log(`Total images in carousel: ${imageCount}`);
    
    // Take a screenshot to see if it renders correctly
    await page.screenshot({ path: 'profile-carousel.png' });
    console.log('Screenshot taken: profile-carousel.png');
    
    await browser.close();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();