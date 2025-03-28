// Simple script to test the authentication functionality

import puppeteer from 'puppeteer';

async function testAuthPage() {
  console.log('Opening browser to test auth page...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to auth page...');
    
    await page.goto('http://localhost:3000/auth', { waitUntil: 'networkidle2' });
    console.log('Auth page loaded successfully');
    
    // Wait for user interaction with the page
    await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds to interact manually
    
    console.log('Auth test completed');
  } catch (error) {
    console.error('Error during auth testing:', error);
  } finally {
    await browser.close();
  }
}

testAuthPage().catch(console.error);