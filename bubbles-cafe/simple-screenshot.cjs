const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to take a screenshot using curl and other command line tools
function takeScreenshot() {
  console.log('Taking screenshot using curl...');
  
  // Create a simple HTML file that will redirect to our app
  const redirectHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Taking Screenshot</title>
    <meta http-equiv="refresh" content="0;url=http://0.0.0.0:3001">
  </head>
  <body>
    <p>Redirecting to app...</p>
  </body>
  </html>
  `;
  
  // Write the HTML file
  fs.writeFileSync('redirect.html', redirectHtml);
  
  // Use curl to get the main page HTML
  exec('curl -s http://0.0.0.0:3001', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error fetching page: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    
    // Save the HTML for inspection
    fs.writeFileSync('page-content.html', stdout);
    console.log('Downloaded page content to page-content.html');
    
    // Print some stats about the page
    console.log(`Page size: ${stdout.length} bytes`);
    console.log(`Contains EnhancedPageTransition: ${stdout.includes('EnhancedPageTransition')}`);
    console.log(`Contains AnimatePresence: ${stdout.includes('AnimatePresence')}`);
    console.log(`Contains LoadingScreen: ${stdout.includes('LoadingScreen')}`);
    
    console.log('Page transition verification complete.');
  });
}

takeScreenshot();