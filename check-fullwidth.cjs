/**
 * Fullwidth Fix Verification Script
 * 
 * This script checks if the fullwidth fixes have been properly implemented
 * by examining the HTML and injected styles.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function checkFullwidthFix() {
  console.log('Starting fullwidth fix verification...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  
  try {
    const page = await browser.newPage();
    console.log('Navigating to homepage...');
    
    // Set viewport to a wide screen to see if any issues occur
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the homepage
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle0' });
    console.log('Page loaded, taking screenshot...');
    
    // Take a screenshot of the full page
    await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
    console.log('Homepage screenshot captured');
    
    // Check if our fullwidth-fix.css is being loaded
    const hasFullwidthCss = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.some(link => link.href.includes('fullwidth-fix.css'));
    });
    
    console.log(`Fullwidth CSS loaded: ${hasFullwidthCss ? 'Yes ✅' : 'No ❌'}`);
    
    // Check for main content width
    const mainContentWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return 'Main element not found';
      
      const styles = window.getComputedStyle(main);
      return {
        width: styles.width,
        maxWidth: styles.maxWidth,
        minWidth: styles.minWidth,
        overflow: styles.overflow,
        overflowX: styles.overflowX
      };
    });
    
    console.log('Main content styles:', mainContentWidth);
    
    // Check for html/body width
    const htmlBodyWidth = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      
      const htmlStyles = window.getComputedStyle(html);
      const bodyStyles = window.getComputedStyle(body);
      
      return {
        html: {
          width: htmlStyles.width,
          maxWidth: htmlStyles.maxWidth,
          overflow: htmlStyles.overflow,
          overflowX: htmlStyles.overflowX
        },
        body: {
          width: bodyStyles.width,
          maxWidth: bodyStyles.maxWidth,
          overflow: bodyStyles.overflow,
          overflowX: bodyStyles.overflowX
        }
      };
    });
    
    console.log('HTML/Body styles:', htmlBodyWidth);
    
    // Now navigate to reader page to check there
    console.log('Navigating to reader page...');
    await page.goto('http://localhost:3001/reader', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'reader-screenshot.png', fullPage: true });
    console.log('Reader screenshot captured');
    
    // Check reader container width
    const readerContainerWidth = await page.evaluate(() => {
      const readerContainer = document.querySelector('.reader-container');
      if (!readerContainer) return 'Reader container not found';
      
      const styles = window.getComputedStyle(readerContainer);
      return {
        width: styles.width,
        maxWidth: styles.maxWidth,
        minWidth: styles.minWidth,
        margin: styles.margin,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight
      };
    });
    
    console.log('Reader container styles:', readerContainerWidth);
    
    // Check for black borders
    const hasBlackBorders = await page.evaluate(() => {
      // Look for elements with black backgrounds or borders at the edges
      const elements = Array.from(document.querySelectorAll('*'));
      const blackBorderElements = elements.filter(el => {
        if (!el.getBoundingClientRect) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        
        const styles = window.getComputedStyle(el);
        const backgroundColor = styles.backgroundColor;
        const borderColor = styles.borderColor;
        
        // Check if the element is at the edge and has a black background/border
        const isAtEdge = rect.left === 0 || rect.right === window.innerWidth;
        const isBlackBg = backgroundColor === 'rgb(0, 0, 0)' || backgroundColor === '#000000';
        const isBlackBorder = borderColor === 'rgb(0, 0, 0)' || borderColor === '#000000';
        
        return isAtEdge && (isBlackBg || isBlackBorder);
      });
      
      return blackBorderElements.length > 0;
    });
    
    console.log(`Black borders detected: ${hasBlackBorders ? 'Yes ❌' : 'No ✅'}`);
    
    // Final assessment
    console.log('\nFullwidth Fix Assessment:');
    console.log('------------------------');
    console.log(`1. Fullwidth CSS loaded: ${hasFullwidthCss ? 'Yes ✅' : 'No ❌'}`);
    console.log(`2. Main content has full width: ${mainContentWidth.width === '1920px' ? 'Yes ✅' : 'No ❌'}`);
    console.log(`3. HTML/Body correctly configured: ${htmlBodyWidth.html.overflowX === 'hidden' ? 'Yes ✅' : 'No ❌'}`);
    console.log(`4. Reader container properly styled: ${readerContainerWidth !== 'Reader container not found' ? 'Yes ✅' : 'No ❌'}`);
    console.log(`5. No black borders detected: ${!hasBlackBorders ? 'Yes ✅' : 'No ❌'}`);
    
    console.log('\nFullwidth fix verification complete.');
    console.log('Check the homepage-screenshot.png and reader-screenshot.png files to visually verify.');
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await browser.close();
  }
}

checkFullwidthFix().catch(console.error);