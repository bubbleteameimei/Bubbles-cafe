const puppeteer = require('puppeteer');

(async () => {
  try {
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Visit the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Wait for a bit to ensure the page is loaded
    await page.waitForTimeout(3000);
    
    // Check for footer elements - specifically count how many there are
    const footerCount = await page.evaluate(() => {
      // Count elements with footer tag
      const footerElements = document.querySelectorAll('footer');
      console.log('Found', footerElements.length, 'footer elements');
      
      // Also check for any div with a footer class that might be related
      const footerClasses = document.querySelectorAll('.footer, [class*="footer"]');
      console.log('Found', footerClasses.length, 'elements with footer in class name');
      
      return footerElements.length;
    });
    
    console.log(`Total footer elements found: ${footerCount}`);
    
    if (footerCount > 1) {
      console.error('⚠️ Multiple footer elements detected - possible duplication issue');
    } else if (footerCount === 1) {
      console.log('✅ Footer structure appears correct - only one footer element found');
    } else {
      console.log('⚠️ No footer elements found - might not be visible or loaded yet');
    }
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'homepage-footer-check.png', fullPage: true });
    console.log('Screenshot saved to homepage-footer-check.png');
    
    await browser.close();
  } catch (error) {
    console.error('Error during test:', error);
  }
})();