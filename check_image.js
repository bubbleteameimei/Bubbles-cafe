import puppeteer from 'puppeteer';

(async () => {
  try {
    // For Replit environment
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Navigate to the homepage
    await page.goto('https://' + process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Check for the background image
    const backgroundImageExists = await page.evaluate(() => {
      const divWithBg = document.querySelector('.absolute.inset-0');
      if (!divWithBg) {
        console.log('Background div not found');
        return false;
      }
      
      const bgImage = window.getComputedStyle(divWithBg).backgroundImage;
      console.log('Background image:', bgImage);
      return bgImage.includes('IMG_4918.jpeg');
    });
    
    console.log('Background image exists:', backgroundImageExists);
    
    // Take a screenshot to visually verify
    await page.screenshot({ path: 'homepage-screenshot.png' });
    console.log('Screenshot saved as homepage-screenshot.png');
    
    await browser.close();
  } catch (error) {
    console.error('Error checking image:', error);
  }
})();