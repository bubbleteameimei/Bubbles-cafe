/**
 * Simple Screenshot Script to check the scroll button position
 */
import puppeteer from 'puppeteer';

async function checkScrollButtonPosition() {
  console.log('Launching browser to check scroll button position...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    
    // Scroll down to make the scroll button appear
    console.log('Scrolling down to make button visible...');
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    
    // Wait a moment for the button to appear
    await page.waitForTimeout(2000);
    
    // Take a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'scroll-button-check.png' });
    
    // Try to locate scroll button elements 
    const buttonElements = await page.evaluate(() => {
      const results = {};
      
      // Look for the button with scroll-to-top class
      const scrollToTopButton = document.querySelector('.scroll-to-top');
      if (scrollToTopButton) {
        const rect = scrollToTopButton.getBoundingClientRect();
        results.scrollToTopButton = {
          exists: true,
          position: {
            left: rect.left,
            right: window.innerWidth - rect.right,
            top: rect.top,
            bottom: window.innerHeight - rect.bottom
          },
          classes: scrollToTopButton.className
        };
      } else {
        results.scrollToTopButton = { exists: false };
      }
      
      // Look for any fixed position buttons that might be our scroll button
      const allFixedButtons = Array.from(document.querySelectorAll('button, [role="button"]'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          return style.position === 'fixed';
        });
      
      results.fixedButtons = allFixedButtons.map(btn => {
        const rect = btn.getBoundingClientRect();
        return {
          text: btn.innerText || btn.textContent,
          classes: btn.className,
          position: {
            left: rect.left,
            right: window.innerWidth - rect.right,
            top: rect.top,
            bottom: window.innerHeight - rect.bottom
          }
        };
      });
      
      return results;
    });
    
    console.log('Scroll Button Analysis:');
    console.log(JSON.stringify(buttonElements, null, 2));
    
    console.log('Screenshot saved as "scroll-button-check.png"');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

checkScrollButtonPosition();