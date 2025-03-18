import puppeteer from 'puppeteer';

async function test404Page() {
  console.log('Testing 404 page rendering...');
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to a non-existent page
    await page.goto('http://localhost:3000/this-page-does-not-exist', { 
      waitUntil: 'networkidle0',
      timeout: 10000
    });
    
    // Wait for 404 page to render
    await page.waitForSelector('h1.text-8xl', { timeout: 5000 });
    
    // Check background color
    const bgColor = await page.evaluate(() => {
      const element = document.querySelector('div.fixed.inset-0');
      return element ? getComputedStyle(element).backgroundColor : null;
    });
    
    console.log('Background color:', bgColor);
    
    // Check button style
    const buttonText = await page.evaluate(() => {
      const button = document.querySelector('button');
      return {
        text: button ? button.innerText : null,
        className: button ? button.className : null
      };
    });
    
    console.log('Button:', buttonText);
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshots/404-page.png' });
    console.log('Screenshot saved to screenshots/404-page.png');
    
    console.log('404 page test complete');
  } catch (error) {
    console.error('Error during 404 page test:', error);
  } finally {
    await browser.close();
  }
}

test404Page();