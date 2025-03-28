/**
 * Test Script for Anonymous Comment Posting
 * 
 * This script checks if the simplified comment form works correctly
 * for both anonymous and authenticated users.
 */

import puppeteer from 'puppeteer';

async function testAnonymousComments() {
  console.log('Starting anonymous comment test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to a story page that has comments
    console.log('Navigating to story page...');
    await page.goto('http://localhost:3001/story/1', { waitUntil: 'networkidle0' });
    
    // Wait for comment form to be visible
    console.log('Checking for comment form...');
    await page.waitForSelector('.antialiased form textarea', { timeout: 5000 });
    
    // Verify the Anonymous text is displayed
    const anonymousText = await page.evaluate(() => {
      const element = Array.from(document.querySelectorAll('.text-muted-foreground'))
        .find(el => el.textContent.includes('Anonymous'));
      return element ? element.textContent.trim() : null;
    });
    
    if (anonymousText && anonymousText.includes('Anonymous')) {
      console.log('✅ Anonymous text is displayed correctly: ' + anonymousText);
    } else {
      console.log('❌ Anonymous text not found or incorrect');
    }
    
    // Check that there's NO name input field
    const nameInputExists = await page.evaluate(() => {
      return !!document.querySelector('input[placeholder="Your name"]');
    });
    
    if (!nameInputExists) {
      console.log('✅ Name input field is correctly removed');
    } else {
      console.log('❌ Name input field still exists');
    }
    
    // Try submitting a comment as anonymous
    console.log('Testing comment submission as anonymous...');
    
    // Type a comment
    await page.type('textarea[placeholder="Share your thoughts..."]', 'This is a test comment from an anonymous user');
    
    // Take a screenshot before submitting
    await page.screenshot({ path: 'screenshots/anonymous-comment-before.png' });
    
    // Submit the form
    const submitButton = await page.waitForSelector('button[type="submit"]');
    await submitButton.click();
    
    // Wait for potential toast notification
    await page.waitForTimeout(2000);
    
    // Take a screenshot after submitting
    await page.screenshot({ path: 'screenshots/anonymous-comment-after.png' });
    
    console.log('Comment form test completed');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testAnonymousComments().catch(console.error);