const http = require('http');
const fs = require('fs');
const path = require('path');

// URL to capture
const url = 'http://localhost:3001/';
const outputPath = path.join(process.cwd(), 'mobile-layout.html');

console.log(`Capturing ${url} and saving to ${outputPath}...`);

// Make a simple HTTP request to get the page content
http.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Add mobile meta viewport to properly render the page 
    const mobileViewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">';
    const mobileStyles = `
    <style>
      body { 
        width: 375px; 
        margin: 0 auto; 
        border: 1px solid #ccc;
        height: 812px;
        overflow: auto;
      }
      /* Highlight the navigation elements */
      header { 
        border: 2px solid red !important; 
      }
    </style>`;
    
    // Insert our custom viewport and styles
    const modifiedData = data.replace('</head>', `${mobileViewport}${mobileStyles}</head>`);
    
    fs.writeFile(outputPath, modifiedData, (err) => {
      if (err) {
        console.error('Error saving file:', err);
      } else {
        console.log('Saved mobile layout to:', outputPath);
        console.log('Open this file in any browser to see the mobile layout.');
      }
    });
  });
}).on('error', (err) => {
  console.error('Error capturing screenshot:', err);
});
