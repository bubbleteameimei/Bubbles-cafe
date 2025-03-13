import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to the homepage
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    
    // Check for the background image
    const backgroundImageExists = await page.evaluate(() => {
      const divWithBg = document.querySelector('.absolute.inset-0');
      if (!divWithBg) return false;
      
      const bgImage = window.getComputedStyle(divWithBg).backgroundImage;
      console.log('Background image:', bgImage);
      return bgImage.includes('IMG_4918.jpeg');
    });
    
    console.log('Background image exists:', backgroundImageExists);
    
    await browser.close();
  } catch (error) {
    console.error('Error checking image:', error);
  }
})();