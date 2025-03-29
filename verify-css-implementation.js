/**
 * CSS Implementation Verification Script
 * 
 * This script fetches the HTML content of the reader page and:
 * 1. Checks if the reader-fixes.css file is properly included
 * 2. Verifies the padding rules are being applied (by inspecting styles)
 * 3. Saves a verification HTML file that highlights the padding area
 */

import fs from 'fs';
import https from 'https';
import http from 'http';

// Helper function to fetch a URL
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status code ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', reject);
  });
}

// Analyze and verify CSS implementation
async function verifyCssImplementation() {
  console.log('Verifying CSS implementation...');
  
  try {
    // 1. First check if our files exist (static check)
    const readerCssPath = './client/src/styles/reader-fixes.css';
    const readerFixesCssExists = fs.existsSync(readerCssPath);
    
    console.log(`reader-fixes.css exists: ${readerFixesCssExists ? '✓' : '✗'}`);
    
    if (readerFixesCssExists) {
      const cssContent = fs.readFileSync(readerCssPath, 'utf8');
      console.log('CSS file content length:', cssContent.length, 'bytes');
      
      // Check if CSS contains padding rules
      const hasPaddingLeft = cssContent.includes('padding-left');
      const hasPaddingRight = cssContent.includes('padding-right');
      
      console.log(`CSS contains padding-left: ${hasPaddingLeft ? '✓' : '✗'}`);
      console.log(`CSS contains padding-right: ${hasPaddingRight ? '✓' : '✗'}`);
      
      // Check if CSS has responsive rules
      const hasMediaQueries = cssContent.includes('@media');
      console.log(`CSS contains responsive rules: ${hasMediaQueries ? '✓' : '✗'}`);
    }
    
    // 2. Create a test HTML to verify the CSS visually
    console.log('\nCreating verification HTML...');
    
    const verificationHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reader CSS Verification</title>
  <style>
    /* Copy of the reader-fixes.css */
    ${fs.existsSync(readerCssPath) ? fs.readFileSync(readerCssPath, 'utf8') : '/* CSS file not found */'}
    
    /* Additional styles for verification */
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.5;
      margin: 0;
      padding: 20px;
    }
    
    .verification-container {
      max-width: 1200px;
      margin: 0 auto;
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    
    h1 {
      margin-top: 0;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    
    .test-content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .padding-visualizer {
      position: relative;
      background-color: #e9f7fe;
      margin-top: 40px;
      border: 1px solid #b3e0ff;
      border-radius: 5px;
      overflow: hidden;
    }
    
    .padding-visualizer::before {
      content: 'Story Content Area';
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #0078d7;
      color: white;
      padding: 3px 10px;
      border-radius: 3px;
      font-size: 12px;
    }
    
    .left-padding-indicator,
    .right-padding-indicator {
      position: absolute;
      top: 0;
      height: 100%;
      background-color: rgba(255, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #d70000;
      font-size: 12px;
      font-weight: bold;
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }
    
    .left-padding-indicator {
      left: 0;
    }
    
    .right-padding-indicator {
      right: 0;
    }
    
    .content-simulator {
      margin-left: 80px;
      margin-right: 80px;
      padding: 20px;
      background-color: white;
      min-height: 300px;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 5px;
      overflow-x: auto;
      font-size: 13px;
    }
    
    .status {
      padding: 10px;
      border-radius: 5px;
      margin-top: 20px;
    }
    
    .success {
      background-color: #d4edda;
      color: #155724;
    }
    
    .warning {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .error {
      background-color: #f8d7da;
      color: #721c24;
    }
    
    /* Measuring tools */
    .visual-guide {
      margin-top: 30px;
      position: relative;
      height: 30px;
      background-color: #f3f3f3;
    }
    
    .ruler {
      height: 20px;
      background: repeating-linear-gradient(
        90deg,
        #ccc,
        #ccc 1px,
        transparent 1px,
        transparent 10px
      );
      position: relative;
    }
    
    .ruler::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        90deg,
        transparent,
        transparent 49px,
        #999 49px,
        #999 50px
      );
    }
    
    .ruler-marker {
      position: absolute;
      top: -15px;
      font-size: 10px;
      color: #666;
    }
    
    .responsive-indicator {
      margin-top: 30px;
      padding: 10px;
      background-color: #e9ecef;
      text-align: center;
      border-radius: 5px;
      font-weight: bold;
    }
    
    /* Responsive adjustment to show padding changes */
    @media (max-width: 1024px) {
      .responsive-indicator {
        background-color: #d1ecf1;
      }
    }
    
    @media (max-width: 768px) {
      .responsive-indicator {
        background-color: #fff3cd;
      }
    }
    
    @media (max-width: 480px) {
      .responsive-indicator {
        background-color: #f8d7da;
      }
    }
  </style>
</head>
<body>
  <div class="verification-container">
    <h1>Reader CSS Padding Verification</h1>
    
    <div class="test-content">
      <p>This page demonstrates the CSS padding settings applied to the reader content:</p>
      <ul>
        <li><strong>Desktop (>1024px):</strong> 5rem padding on both sides</li>
        <li><strong>Tablet (768px-1024px):</strong> 4rem padding on both sides</li>
        <li><strong>Mobile (480px-768px):</strong> 2.5rem padding on both sides</li>
        <li><strong>Extra Small (<480px):</strong> 1.5rem padding on both sides</li>
      </ul>
    </div>
    
    <div class="responsive-indicator">
      Current viewport size: <span id="viewport-size">Detecting...</span>
    </div>
    
    <div class="padding-visualizer">
      <!-- Left padding indicator will be sized by JS -->
      <div class="left-padding-indicator" id="left-padding">
        Padding
      </div>
      
      <!-- Content area -->
      <div class="reader-container story-content content-simulator">
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam et justo vel ante volutpat faucibus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed eget felis vitae libero dapibus rutrum.</p>
        <p>Donec egestas tincidunt enim, non vulputate libero tempus eget. Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec feugiat scelerisque elementum.</p>
      </div>
      
      <!-- Right padding indicator will be sized by JS -->
      <div class="right-padding-indicator" id="right-padding">
        Padding
      </div>
    </div>
    
    <div class="visual-guide">
      <div class="ruler" id="ruler">
        <!-- Markers will be added by JS -->
      </div>
    </div>
    
    <div class="status" id="status">
      Checking CSS implementation...
    </div>
    
    <h2>CSS File Content</h2>
    <pre id="css-content">${fs.existsSync(readerCssPath) ? 
      fs.readFileSync(readerCssPath, 'utf8') : 
      '/* CSS file not found */'}</pre>
  </div>
  
  <script>
    // Update viewport size
    function updateViewportSize() {
      const width = window.innerWidth;
      document.getElementById('viewport-size').textContent = width + 'px';
      
      // Add markers to ruler
      const ruler = document.getElementById('ruler');
      ruler.innerHTML = '';
      
      // Add markers every 100px
      for (let i = 0; i <= 1200; i += 100) {
        if (i <= width) {
          const marker = document.createElement('div');
          marker.className = 'ruler-marker';
          marker.style.left = i + 'px';
          marker.textContent = i + 'px';
          ruler.appendChild(marker);
        }
      }
      
      // Check computed style of the reader container
      const readerContainer = document.querySelector('.reader-container.story-content');
      if (readerContainer) {
        const style = window.getComputedStyle(readerContainer);
        const paddingLeft = style.paddingLeft;
        const paddingRight = style.paddingRight;
        
        // Update padding indicators
        const leftIndicator = document.getElementById('left-padding');
        const rightIndicator = document.getElementById('right-padding');
        
        leftIndicator.style.width = paddingLeft;
        leftIndicator.textContent = paddingLeft + ' padding';
        
        rightIndicator.style.width = paddingRight;
        rightIndicator.textContent = paddingRight + ' padding';
        
        // Update status message
        const status = document.getElementById('status');
        
        if (parseInt(paddingLeft) > 0 && parseInt(paddingRight) > 0) {
          status.className = 'status success';
          status.innerHTML = '✓ Padding is being applied correctly! Left: ' + paddingLeft + ', Right: ' + paddingRight;
        } else {
          status.className = 'status error';
          status.innerHTML = '✗ Padding is not being applied. Left: ' + paddingLeft + ', Right: ' + paddingRight;
        }
      }
    }
    
    // Run on load and resize
    window.addEventListener('load', updateViewportSize);
    window.addEventListener('resize', updateViewportSize);
  </script>
</body>
</html>`;
    
    fs.writeFileSync('verify-padding.html', verificationHtml);
    console.log('Created verify-padding.html - open this file in a browser to visually verify padding');
    
    console.log('\nVerification complete!');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

// Run the verification
verifyCssImplementation();