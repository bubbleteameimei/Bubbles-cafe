import puppeteer from 'puppeteer';

async function checkBrowserWarnings() {
  console.log('Checking for browser warnings...');
  
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Create a new page
  const page = await browser.newPage();
  
  // Store console logs
  const consoleMessages = [];
  
  // Listen for console messages
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'warning' || type === 'error') {
      consoleMessages.push({ type, text });
    }
  });
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for a moment to ensure all scripts are loaded
    await page.waitForTimeout(3000);
    
    console.log(`Found ${consoleMessages.length} warning/error messages`);
    
    // Filter for dialog-related warnings
    const dialogWarnings = consoleMessages.filter(msg => 
      msg.text.toLowerCase().includes('dialog') ||
      msg.text.toLowerCase().includes('aria') ||
      msg.text.toLowerCase().includes('accessibility')
    );
    
    console.log(`Found ${dialogWarnings.length} dialog-related warnings`);
    
    // Display the dialog-related warnings
    if (dialogWarnings.length > 0) {
      console.log('\nDialog-related warnings:');
      dialogWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.text}`);
      });
    } else {
      console.log('\nNo dialog-related warnings found! 🎉');
    }
    
    // Display other warnings if present
    const otherWarnings = consoleMessages.filter(msg => 
      !msg.text.toLowerCase().includes('dialog') &&
      !msg.text.toLowerCase().includes('aria') &&
      !msg.text.toLowerCase().includes('accessibility')
    );
    
    if (otherWarnings.length > 0) {
      console.log('\nOther warnings (not dialog-related):');
      otherWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.type}] ${warning.text}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the check
checkBrowserWarnings();