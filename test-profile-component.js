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
    
    // Check if all three images are loaded
    const imageCount = await page.evaluate(() => {
      // Debug ProfileImage component
      console.log("Checking for ProfileImage component");
      const profileComponent = document.querySelector('.min-w-full.h-full');
      console.log("ProfileImage found:", !!profileComponent);
      
      if (profileComponent) {
        const imgElements = profileComponent.querySelectorAll('img');
        console.log(`Found ${imgElements.length} images in carousel`);
        
        // Check button positions
        const navButtons = document.querySelectorAll('button[aria-label="Previous image"], button[aria-label="Next image"]');
        console.log(`Found ${navButtons.length} navigation buttons`);
        
        return imgElements.length;
      }
      
      return 0;
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