/**
 * Simple script to check if the export button is working on the test page
 */
const puppeteer = require('puppeteer');

async function checkExportButton() {
  console.log('Launching browser to check export button functionality...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Forward console messages
    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', error => {
      console.log(`[Browser Error] ${error.message}`);
    });
    
    console.log('Navigating to export test page...');
    await page.goto('http://localhost:3003/export-test', { 
      timeout: 30000,
      waitUntil: 'networkidle2'
    });
    
    console.log('Waiting for page to fully load...');
    await page.waitForSelector('button:contains("Run All Export Tests")', { timeout: 5000 });
    
    console.log('Page loaded, clicking export button...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const exportButton = buttons.find(button => button.textContent.includes('Run All Export Tests'));
      if (exportButton) {
        exportButton.click();
        console.log('Export button clicked via script');
      } else {
        console.log('Export button not found');
      }
    });
    
    // Wait a moment for any errors or actions
    await page.waitForTimeout(1000);
    
    // Check if any download links were triggered
    const downloadsStarted = await page.evaluate(() => {
      return document.querySelectorAll('a[download]').length > 0;
    });
    
    console.log(`Downloads started: ${downloadsStarted ? 'Yes' : 'No'}`);
    
    // Additional check for any visible errors on the page
    const errorText = await page.evaluate(() => {
      const errorElements = Array.from(document.querySelectorAll('.text-red-500, .text-destructive'));
      return errorElements.map(el => el.textContent).join(', ');
    });
    
    if (errorText) {
      console.log('Found error text on page:', errorText);
    } else {
      console.log('No visible error text found on page');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

checkExportButton().catch(console.error);
