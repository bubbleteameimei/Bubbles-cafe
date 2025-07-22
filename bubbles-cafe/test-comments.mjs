import puppeteer from 'puppeteer';

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium'
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('Navigating to the story page...');
    await page.goto('http://localhost:3001/reader/nostalgia', { 
      waitUntil: 'networkidle2',
      timeout: 10000
    });
    
    // Scroll to the comment section
    console.log('Scrolling to the comment section...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.8);
    });
    
    // Wait for the comment form to load
    await page.waitForSelector('.antialiased', { timeout: 5000 });
    
    // Take a screenshot of the comments section
    console.log('Taking screenshot...');
    const commentSection = await page.$('.antialiased');
    if (commentSection) {
      await commentSection.screenshot({ path: 'comment-section.png' });
      console.log('Screenshot saved as comment-section.png');
    } else {
      console.error('Could not find the comment section!');
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

captureScreenshot();