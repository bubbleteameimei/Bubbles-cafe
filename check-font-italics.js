/**
 * Font Italics Test Script
 * 
 * This script checks the reader page to verify that italics text is properly 
 * inheriting the selected font family.
 */

const puppeteer = require('puppeteer');

async function checkFontItalics() {
  console.log('Starting font italics verification test...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Opening reader page...');
    
    // Navigate to reader page
    await page.goto('http://localhost:3002/reader/1', { waitUntil: 'networkidle0' });
    console.log('Reader page loaded');
    
    // Take initial screenshot with default font
    await page.screenshot({ path: 'screenshots/font-default.png' });
    console.log('Default font screenshot taken');
    
    // Function to get the computed font family for normal and italic text
    const getFontInfo = async () => {
      return await page.evaluate(() => {
        // Find a paragraph in the story content
        const normalTextEl = document.querySelector('.story-content p');
        
        // Create a test element for italic text
        const italicTestEl = document.createElement('em');
        italicTestEl.textContent = 'Test italic text';
        document.querySelector('.story-content').appendChild(italicTestEl);
        
        // Get computed styles
        const normalStyle = window.getComputedStyle(normalTextEl);
        const italicStyle = window.getComputedStyle(italicTestEl);
        
        // Clean up
        italicTestEl.remove();
        
        return {
          normalFont: normalStyle.fontFamily,
          italicFont: italicStyle.fontFamily,
          fontFamily: document.documentElement.getAttribute('data-font-family')
        };
      });
    };
    
    // Check default font first
    const defaultFontInfo = await getFontInfo();
    console.log('Default font:', defaultFontInfo);
    
    // Change font to Lora
    console.log('Changing font to Lora...');
    await page.evaluate(() => {
      // Find the font control menu and open it
      const fontButton = document.querySelector('button[aria-label="Font Settings"]');
      if (fontButton) fontButton.click();
      
      // Wait a bit for the menu to open
      setTimeout(() => {
        // Click on Lora
        const loraButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Lora'));
        if (loraButton) loraButton.click();
      }, 500);
    });
    
    // Wait for font change to apply
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/font-lora.png' });
    
    // Check Lora font
    const loraFontInfo = await getFontInfo();
    console.log('Lora font:', loraFontInfo);
    
    // Change font to Roboto
    console.log('Changing font to Roboto...');
    await page.evaluate(() => {
      // Find the font control menu and open it
      const fontButton = document.querySelector('button[aria-label="Font Settings"]');
      if (fontButton) fontButton.click();
      
      // Wait a bit for the menu to open
      setTimeout(() => {
        // Click on Roboto
        const robotoButton = Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('Roboto'));
        if (robotoButton) robotoButton.click();
      }, 500);
    });
    
    // Wait for font change to apply
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/font-roboto.png' });
    
    // Check Roboto font
    const robotoFontInfo = await getFontInfo();
    console.log('Roboto font:', robotoFontInfo);
    
    // Verify results
    console.log('\nTest Results:');
    console.log('=============');
    console.log('Default font family:', defaultFontInfo.fontFamily);
    console.log('Default normal text font:', defaultFontInfo.normalFont);
    console.log('Default italic text font:', defaultFontInfo.italicFont);
    console.log('------------------------------');
    console.log('Lora font family:', loraFontInfo.fontFamily);
    console.log('Lora normal text font:', loraFontInfo.normalFont);
    console.log('Lora italic text font:', loraFontInfo.italicFont);
    console.log('------------------------------');
    console.log('Roboto font family:', robotoFontInfo.fontFamily);
    console.log('Roboto normal text font:', robotoFontInfo.normalFont);
    console.log('Roboto italic text font:', robotoFontInfo.italicFont);
    
    const success = 
      defaultFontInfo.normalFont.includes(defaultFontInfo.fontFamily) &&
      defaultFontInfo.italicFont.includes(defaultFontInfo.fontFamily) &&
      loraFontInfo.normalFont.includes('Lora') &&
      loraFontInfo.italicFont.includes('Lora') &&
      robotoFontInfo.normalFont.includes('Roboto') &&
      robotoFontInfo.italicFont.includes('Roboto');
    
    console.log('\nTest outcome:', success ? 'SUCCESS ✅' : 'FAILURE ❌');
    
    if (!success) {
      console.log('\nPossible issues:');
      if (!defaultFontInfo.italicFont.includes(defaultFontInfo.fontFamily)) {
        console.log('- Default font italic text is not using the correct font family');
      }
      if (!loraFontInfo.italicFont.includes('Lora')) {
        console.log('- Lora font italic text is not using Lora font family');
      }
      if (!robotoFontInfo.italicFont.includes('Roboto')) {
        console.log('- Roboto font italic text is not using Roboto font family');
      }
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    console.log('Test completed');
  }
}

// Ensure screenshots directory exists
const fs = require('fs');
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Run the test
checkFontItalics();