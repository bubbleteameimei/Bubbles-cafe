/**
 * Simple Reader Page CSS Verification
 * 
 * This script fetches the reader page HTML and checks if our reader-fixes.css 
 * has been properly loaded and if the story content container is present.
 */
import fetch from 'node-fetch';
import fs from 'fs';

async function checkReaderPadding() {
  console.log('Checking reader page for padding styles...');
  
  try {
    // Fetch the reader page to verify our CSS is loaded
    const response = await fetch('http://localhost:3000/reader');
    const html = await response.text();
    
    // Check if our CSS file is being loaded
    if (html.includes('reader-fixes.css')) {
      console.log('✅ reader-fixes.css is properly included in the page');
    } else {
      console.log('❌ reader-fixes.css is NOT found in the page!');
    }
    
    // Check if the story content container class is present
    if (html.includes('reader-container story-content')) {
      console.log('✅ Reader container class found in the HTML');
    } else {
      console.log('❌ Reader container class NOT found in the HTML!');
    }
    
    // Create a sample HTML file with instructions for checking
    const inspectionInstructions = `
<!DOCTYPE html>
<html>
<head>
  <title>Reader Page Padding Verification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; }
    .step { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
    .step h3 { margin-top: 0; }
    code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
    .highlight { background-color: #ffeeba; padding: 2px; }
  </style>
</head>
<body>
  <h1>Reader Page Padding Verification Guide</h1>
  <p>Follow these steps to verify that the story content padding has been properly applied:</p>
  
  <div class="step">
    <h3>1. Open the Reader Page</h3>
    <p>Navigate to <a href="http://localhost:3000/reader" target="_blank">http://localhost:3000/reader</a></p>
  </div>
  
  <div class="step">
    <h3>2. Open Browser Dev Tools</h3>
    <p>Right-click on the story content and select "Inspect" or press F12</p>
  </div>
  
  <div class="step">
    <h3>3. Run the Reader Inspector</h3>
    <p>Copy and paste the following code into your browser console and press Enter:</p>
    <code>
      fetch('/src/styles/reader-inspector.js')
        .then(response => response.text())
        .then(code => {
          eval(code);
        });
    </code>
  </div>
  
  <div class="step">
    <h3>4. Check Visual Indicators</h3>
    <p>You should see:</p>
    <ul>
      <li>Red dashed border around the story content</li>
      <li>Blue markers at the edges of the viewport</li>
      <li>Green markers at the edges of the content area</li>
      <li>Yellow highlight on the first paragraph</li>
      <li>A status box in the top-right showing padding values</li>
    </ul>
  </div>
  
  <div class="step">
    <h3>5. Verify Padding Amount</h3>
    <p>The padding should be:</p>
    <ul>
      <li>Desktop: <span class="highlight">5rem (80px)</span> on both sides</li>
      <li>Tablets: <span class="highlight">4rem (64px)</span> on both sides</li>
      <li>Mobile: <span class="highlight">2.5rem (40px)</span> on both sides</li>
      <li>Extra small: <span class="highlight">1.5rem (24px)</span> on both sides</li>
    </ul>
    <p>You can resize your browser window to verify responsive behavior.</p>
  </div>
</body>
</html>
    `;
    
    // Write instructions to a file
    fs.writeFileSync('reader-padding-verification.html', inspectionInstructions);
    console.log('📝 Created verification instructions at reader-padding-verification.html');
    console.log('Please follow the steps in the HTML file to visually inspect the padding.');
    
  } catch (error) {
    console.error('Error checking reader page:', error);
  }
}

checkReaderPadding()
  .catch(console.error);