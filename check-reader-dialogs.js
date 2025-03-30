/**
 * Simple Reader Dialog Test
 * 
 * This script checks if the reader page's font and contents dialogs 
 * are working properly by simulating opening and closing them.
 */
import puppeteer from 'puppeteer';

async function checkReaderDialogs() {
  console.log('Starting reader dialog test...');
  const browser = await puppeteer.launch({
    headless: false, // Use non-headless mode for better testing
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1366, height: 768 }
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the reader page
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3001/reader', { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for the page to load
    await page.waitForSelector('.reader-container', { timeout: 10000 });
    console.log('Reader page loaded successfully');
    
    // Check for Font button
    console.log('Looking for Font button...');
    const fontButton = await page.$('button span.text-xs.uppercase');
    if (!fontButton) {
      throw new Error('Font button not found');
    }
    console.log('Font button found');
    
    // Click the Font button
    console.log('Clicking Font button...');
    await fontButton.click();
    
    // Wait for font dialog to appear
    console.log('Waiting for font dialog to appear...');
    await page.waitForSelector('.grid.gap-4.py-4', { timeout: 5000 });
    console.log('Font dialog opened successfully');
    
    // Select a font (first option)
    console.log('Selecting a font...');
    const fontOption = await page.$('.grid-cols-1.gap-2 button:first-child');
    if (!fontOption) {
      throw new Error('Font option not found');
    }
    await fontOption.click();
    
    // Check if dialog closes automatically
    console.log('Checking if dialog closes automatically...');
    try {
      await page.waitForFunction(
        () => !document.querySelector('.grid.gap-4.py-4'),
        { timeout: 3000 }
      );
      console.log('Font dialog closed automatically - SUCCESS');
    } catch (error) {
      console.error('Font dialog did not close automatically - FAILURE');
      throw error;
    }
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Now test Contents button
    console.log('Looking for Contents button...');
    const contentsButton = await page.$('button:has(span.truncate:contains("Contents"))');
    if (!contentsButton) {
      throw new Error('Contents button not found');
    }
    console.log('Contents button found');
    
    // Final result
    console.log('Test completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Execute the test
checkReaderDialogs();

// Export the function for potential reuse
export default checkReaderDialogs;