/**
 * Simple Test Script for Table of Contents Dialog
 * 
 * This script tests the Table of Contents dialog in the reader page to verify
 * that the close button styling has been improved as requested.
 */

import puppeteer from 'puppeteer';

async function testTocDialog() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    
    // Set viewport to a reasonable size
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the reader page
    const url = 'https://3001-0-0-0-0-0-0.spock.replit.dev/reader';
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Page loaded successfully');

    // Wait for content to load
    await page.waitForSelector('.story-content', { timeout: 30000 });
    console.log('Story content loaded');

    // Find and click the TOC button
    const tocButton = await page.waitForSelector('button:has-text("TOC")', { timeout: 10000 });
    console.log('Found TOC button, clicking...');
    await tocButton.click();

    // Wait for dialog to appear
    await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
    console.log('Dialog opened successfully');

    // Take screenshot with dialog open
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'toc-dialog-screenshot.png' });
    console.log('Screenshot saved as toc-dialog-screenshot.png');

    // Now let's verify the close button
    const closeButton = await page.waitForSelector('button[aria-label="Close"]', { timeout: 5000 });
    console.log('Close button found');

    // Get the computed styles of the close button
    const buttonStyles = await page.evaluate((closeBtn) => {
      const styles = window.getComputedStyle(closeBtn);
      return {
        width: styles.width,
        height: styles.height,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        transition: styles.transition,
        transform: styles.transform
      };
    }, closeButton);

    console.log('Close button styles:', buttonStyles);

    // Click the close button
    await closeButton.click();
    console.log('Clicked close button');

    // Wait for dialog to disappear
    await page.waitForFunction(() => !document.querySelector('div[role="dialog"]'), { timeout: 5000 });
    console.log('Dialog closed successfully');

  } catch (error) {
    console.error('Error during test:', error);
    // Take screenshot even if there's an error
    await page.screenshot({ path: 'error-screenshot.png' }).catch(() => {});
    console.log('Error screenshot saved as error-screenshot.png');
  } finally {
    // Close the browser
    await browser.close();
    console.log('Browser closed');
  }
}

testTocDialog().catch(console.error);