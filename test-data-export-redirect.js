/**
 * Data Export Redirect Test Script
 * 
 * This script tests if accessing the data-export route correctly redirects to privacy settings
 * and shows a notification to the user.
 */
import puppeteer from 'puppeteer';

async function testDataExportRedirect() {
  console.log('Starting data export redirect test...');
  
  // Launch a new browser instance
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // First navigate to login page
    await page.goto('http://localhost:3003/auth', { waitUntil: 'networkidle2' });
    console.log('Navigated to login page');
    
    // Login as admin user
    await page.type('input[name="email"]', 'vantalison@gmail.com');
    await page.type('input[name="password"]', 'adminpassword123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log('Logged in successfully');
    
    // Navigate to data export page (which should redirect)
    console.log('Testing redirect from /settings/data-export to /settings/privacy...');
    await page.goto('http://localhost:3003/settings/data-export', { waitUntil: 'networkidle2' });
    
    // Wait for redirect to complete
    await page.waitForTimeout(2000);
    
    // Get the current URL
    const currentUrl = page.url();
    console.log('Redirected to:', currentUrl);
    
    // Check if we landed on the privacy settings page
    if (currentUrl.includes('/settings/privacy')) {
      console.log('✅ PASS: Successfully redirected to privacy settings page');
    } else {
      console.log('❌ FAIL: Not redirected to privacy settings page');
    }
    
    // Check if toast notification appeared
    const toastExists = await page.evaluate(() => {
      // Look for elements that might be toast notifications
      const possibleToasts = document.querySelectorAll('[role="status"]');
      const toastArray = Array.from(possibleToasts);
      return toastArray.some(el => 
        el.textContent.includes('Data Export Feature Removed') || 
        el.textContent.includes('data export')
      );
    });
    
    if (toastExists) {
      console.log('✅ PASS: Toast notification displayed');
    } else {
      console.log('❌ FAIL: Toast notification not found');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Always close the browser
    await browser.close();
    console.log('Test complete');
  }
}

// Run the test
testDataExportRedirect();