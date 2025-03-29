/**
 * Test Page Transition Script
 * 
 * This script navigates to the site, clicks a link to trigger navigation,
 * and captures the loading screen during the transition.
 */

import puppeteer from 'puppeteer';

async function testPageTransition() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  console.log('Browser launched successfully');
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  try {
    // Navigate to home page
    console.log('Navigating to home page...');
    await page.goto('https://3001-0-0-0-0-0-0.spock.replit.dev', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('Home page loaded successfully');
    
    // Set up screenshot capture right after clicking link
    page.on('framenavigated', async () => {
      try {
        console.log('Navigation started, taking loading screen screenshot...');
        await page.screenshot({ 
          path: 'transition-loading-screen.png',
          fullPage: true
        });
        console.log('Loading screen screenshot saved');
      } catch (error) {
        console.error('Error capturing loading screen:', error);
      }
    });
    
    // Find and click a navigation link
    console.log('Clicking on Stories link to trigger navigation...');
    await page.click('a[href="/stories"]');
    
    // Give time for the navigation and screenshot to complete
    await page.waitForTimeout(3000);
    
    // Take another screenshot of the destination page
    console.log('Taking destination page screenshot...');
    await page.screenshot({ 
      path: 'destination-page.png',
      fullPage: true
    });
    console.log('Destination page screenshot saved');
    
  } catch (error) {
    console.error('Error testing page transition:', error);
  } finally {
    await browser.close();
    console.log('Test completed');
  }
}

testPageTransition();