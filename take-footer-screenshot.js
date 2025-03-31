/**
 * Simple Footer Screenshot Script
 * 
 * This script captures a screenshot of the footer to verify its styling.
 */
import puppeteer from 'puppeteer-core';

async function captureFooterScreenshot() {
  console.log('Capturing footer screenshot...');
  
  try {
    // Let's have a more flexible approach to find Chrome
    console.log('Launching browser...');
    
    // First try to find chromium on the system
    let executablePath;
    try {
      const { execSync } = await import('child_process');
      executablePath = execSync('which chromium || which chromium-browser || which chrome || which google-chrome').toString().trim();
      console.log('Found browser at:', executablePath);
    } catch (e) {
      console.log('Could not find chromium/chrome, will use the default browser');
    }
    
    const browser = await puppeteer.launch({
      headless: true,
      ...(executablePath && { executablePath }),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set viewport to a decent size
    await page.setViewport({ width: 1280, height: 900 });
    
    // Navigate to the page
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    // Take a full-page screenshot
    console.log('Taking page screenshot...');
    await page.screenshot({ path: 'full-page.png' });
    
    console.log('Scrolling to footer...');
    // Scroll to the bottom of the page where the footer is
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a bit for any animations to complete
    await page.waitForTimeout(500);
    
    // Take screenshot of just the footer
    console.log('Taking footer screenshot...');
    const footer = await page.$('footer');
    if (footer) {
      await footer.screenshot({ path: 'footer.png' });
      console.log('Footer screenshot saved as footer.png');
    } else {
      console.error('Footer element not found!');
    }
    
    // Extract footer classes for analysis
    const footerClasses = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (!footer) return 'Footer not found';
      
      const innerDiv = footer.querySelector('div > div');
      if (!innerDiv) return 'Inner div not found';
      
      return {
        footerClass: footer.className,
        innerDivClass: innerDiv.className,
        innerText: footer.innerText
      };
    });
    
    console.log('Footer classes:', footerClasses);
    
    await browser.close();
    console.log('Browser closed.');
    
    return { success: true, footerClasses };
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return { success: false, error: error.message };
  }
}

// Run the capture function
captureFooterScreenshot();