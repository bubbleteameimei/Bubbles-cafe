import fs from 'fs';
import puppeteer from 'puppeteer';

const logFile = 'browser-errors.log';

async function captureConsoleErrors() {
  console.log('Launching browser to check for console errors...');
  
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });

    const page = await browser.newPage();
    
    // Log all browser console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });
    
    // Log all page errors
    page.on('pageerror', error => {
      const errorText = `[PAGE ERROR] ${error.toString()}`;
      consoleMessages.push(errorText);
      console.error(errorText);
    });
    
    // Log all request failures
    page.on('requestfailed', request => {
      const failureText = `[REQUEST FAILED] ${request.url()} - ${request.failure().errorText}`;
      consoleMessages.push(failureText);
      console.error(failureText);
    });

    // Set a reasonable timeout
    page.setDefaultTimeout(10000);

    // Navigate to stories page
    console.log('Navigating to http://localhost:3001/stories...');
    await page.goto('http://localhost:3001/stories', {
      waitUntil: 'networkidle2'
    });
    
    // Take screenshot of current state
    await page.screenshot({ path: 'stories-page-state.png' });
    console.log('Saved screenshot to stories-page-state.png');
    
    // Give extra time for React hydration and any delayed errors
    await page.waitForTimeout(2000);
    
    // Check the DOM for React root content
    const reactAppContent = await page.evaluate(() => {
      const rootElement = document.getElementById('root');
      return rootElement ? rootElement.innerHTML : 'No content';
    });
    
    console.log('\nReact root content analysis:');
    if (reactAppContent === 'No content') {
      console.error('⚠️ No root element found. React may not be initializing properly.');
    } else if (reactAppContent.length < 100) {
      console.error(`⚠️ Root element has minimal content (${reactAppContent.length} chars). React may not be rendering properly.`);
      console.log('Content:', reactAppContent.substring(0, 100) + '...');
    } else {
      console.log(`✅ Root element has content (${reactAppContent.length} chars)`);
      
      // Check for specific React components
      const hasReactComponents = reactAppContent.includes('data-reactroot') || 
                              reactAppContent.includes('_reactListening') ||
                              reactAppContent.includes('className=');
      
      if (hasReactComponents) {
        console.log('✅ Found React component markers in DOM');
      } else {
        console.error('⚠️ No React component markers found in DOM');
      }
    }
    
    // Save errors to file
    fs.writeFileSync(logFile, consoleMessages.join('\n'));
    console.log(`\nAll browser console output saved to ${logFile}`);
    
    await browser.close();
  } catch (error) {
    console.error('Error running browser test:', error);
  }
}

captureConsoleErrors();