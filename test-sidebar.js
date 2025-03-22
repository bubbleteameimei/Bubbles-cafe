import puppeteer from 'puppeteer';

async function testSidebar() {
  console.log('Starting sidebar test...');
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/nix/store/vn5xnjcgiy5fspd9bs28vsj93a4rn3ry-chromium-112.0.5615.49/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 }); // Mobile viewport
    
    // Navigate to the app
    console.log('Navigating to application...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    
    // Log initial page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Take screenshot before opening sidebar
    await page.screenshot({ path: 'sidebar-closed.png' });
    console.log('Took screenshot with sidebar closed');
    
    // Find and click the menu button
    console.log('Looking for menu button...');
    const menuButton = await page.$('button[title="Toggle navigation menu"]');
    
    if (!menuButton) {
      console.error('Could not find menu button!');
      return;
    }
    
    console.log('Clicking menu button...');
    await menuButton.click();
    
    // Wait for sidebar animation to complete
    await page.waitForTimeout(500);
    
    // Take screenshot with sidebar open
    await page.screenshot({ path: 'sidebar-open.png' });
    console.log('Took screenshot with sidebar open');
    
    // Check if "Swipe left to close" text exists in the sidebar
    const swipeText = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('span')];
      return elements.some(el => el.innerText.includes('Swipe left to close'));
    });
    
    if (swipeText) {
      console.log('SUCCESS: Found "Swipe left to close" text in sidebar');
    } else {
      console.log('WARNING: Could not find "Swipe left to close" text');
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testSidebar();