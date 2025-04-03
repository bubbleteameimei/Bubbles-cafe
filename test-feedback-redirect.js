import puppeteer from 'puppeteer';

async function testFeedbackRedirect() {
  console.log('Starting redirect test...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to feedback page
    console.log('Navigating to feedback page...');
    
    // Enable request interception and logging to track redirects
    await page.setRequestInterception(true);
    
    page.on('request', request => {
      console.log(`Requesting: ${request.url()}`);
      request.continue();
    });
    
    page.on('response', response => {
      console.log(`Response: ${response.url()} (status ${response.status()})`);
      if (response.status() >= 300 && response.status() < 400) {
        console.log(`  Redirect to: ${response.headers().location}`);
      }
    });
    
    await page.goto('http://localhost:3002/feedback', {
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Check the current URL to see if we redirected
    const currentUrl = page.url();
    console.log(`Final URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ SUCCESS: Redirected to login page as expected!');
    } else {
      console.log('❌ FAIL: Not redirected as expected.');
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
}

testFeedbackRedirect();