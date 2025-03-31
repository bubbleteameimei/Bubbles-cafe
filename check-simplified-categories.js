/**
 * Simple script to check if the simplified categories are present in the form
 */

import puppeteer from 'puppeteer';

async function checkSimplifiedCategories() {
  console.log('Starting browser to check simplified categories...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the submit story page
    console.log('Navigating to the submit story page...');
    await page.goto('http://localhost:3000/submit-story', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait for the page to load
    await page.waitForSelector('form', { timeout: 5000 });
    
    // Check for simplified categories
    console.log('Checking for simplified categories...');
    const pageContent = await page.content();
    
    // Check for each expected category
    const expectedCategories = [
      'Psychological',
      'Supernatural',
      'Technological',
      'Body Horror',
      'Gothic',
      'Apocalyptic',
      'General Horror'
    ];
    
    const foundCategories = [];
    
    for (const category of expectedCategories) {
      if (pageContent.includes(category)) {
        foundCategories.push(category);
      }
    }
    
    console.log('Found categories:', foundCategories);
    console.log(`Found ${foundCategories.length} out of ${expectedCategories.length} expected categories`);
    
    if (foundCategories.length === expectedCategories.length) {
      console.log('✅ All expected simplified categories are present!');
    } else {
      console.log('❌ Some expected categories are missing.');
      
      // Find which categories are missing
      const missingCategories = expectedCategories.filter(cat => !foundCategories.includes(cat));
      console.log('Missing categories:', missingCategories);
    }
    
    // Check if formatting is limited to bold and italic
    console.log('\nChecking for formatting options...');
    const hasOnlyBoldItalic = 
      pageContent.includes('Bold (Ctrl+B)') && 
      pageContent.includes('Italic (Ctrl+I)') &&
      !pageContent.includes('Heading') && 
      !pageContent.includes('List');
    
    if (hasOnlyBoldItalic) {
      console.log('✅ Formatting is successfully limited to bold and italic only!');
    } else {
      console.log('❌ Formatting might not be limited correctly.');
    }
    
  } catch (error) {
    console.error('Error while checking:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

checkSimplifiedCategories();