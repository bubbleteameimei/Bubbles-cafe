/**
 * Simple HTML report to visualize padding changes.
 * This creates a visual representation of the CSS padding changes.
 */
const fs = require('fs');

function generateReport() {
  console.log('Generating visual padding report...');
  
  const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Padding Changes Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    h1 {
      border-bottom: 2px solid #333;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .code-block {
      background: #f5f5f5;
      border-left: 5px solid #0066cc;
      padding: 1rem;
      margin: 1rem 0;
      overflow: auto;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    .highlight {
      background-color: #ffff99;
      padding: 2px;
    }
    
    .visual-preview {
      border: 1px solid #ccc;
      margin: 1rem 0;
      position: relative;
    }
    
    .container {
      width: 100%;
      max-width: 100%;
      outline: 2px solid red;
      position: relative;
    }
    
    .container.with-padding {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
    
    .container.without-padding {
      padding-left: 0;
      padding-right: 0;
    }
    
    .container::before {
      content: attr(data-label);
      position: absolute;
      top: -20px;
      left: 0;
      font-size: 12px;
      background: #fff;
      padding: 0 5px;
    }
    
    .content {
      padding: 1rem;
      margin: 1rem 0;
      background-color: #eee;
      outline: 1px dashed blue;
    }
    
    .padding-indicator {
      position: absolute;
      top: 50%;
      font-size: 10px;
      color: red;
      transform: translateY(-50%);
    }
    
    .left-padding {
      left: 2px;
    }
    
    .right-padding {
      right: 2px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
    }
    
    th, td {
      border: 1px solid #ccc;
      padding: 0.5rem;
    }
    
    th {
      background-color: #f0f0f0;
    }
    
    .note {
      background-color: #f8f8f8;
      border-left: 5px solid #ff9900;
      padding: 1rem;
      margin: 1rem 0;
    }
  </style>
</head>
<body>
  <h1>CSS Padding Changes Report</h1>
  
  <h2>Summary of Changes</h2>
  <p>We've added a small padding (0.5rem) to all containers to prevent content from touching the edges of the screen. 
  This improves readability on all devices while maintaining a full-width appearance. For reader pages, we've kept 
  the padding at 0 to maintain their specific styling requirements.</p>
  
  <div class="note">
    <strong>Note:</strong> 0.5rem = 8px at default browser font size (16px).
  </div>
  
  <h2>CSS Changes Made</h2>
  
  <h3>1. Added Padding to Regular Pages</h3>
  <div class="code-block">
  main, .container, div[class*="container"] {
    width: 100% !important;
    max-width: 100% !important;
    <span class="highlight">padding-left: 0.5rem !important;</span>
    <span class="highlight">padding-right: 0.5rem !important;</span>
    margin-left: 0 !important;
    margin-right: 0 !important;
    overflow-x: hidden !important;
  }
  </div>
  
  <h3>2. Overrode Padding for Reader Pages</h3>
  <div class="code-block">
  body:has(main:has([data-reader-page])) .container,
  .reader-page .container, 
  div[data-reader-page="true"] .container,
  [data-page="reader"] .container {
    padding-top: 0 !important;
    <span class="highlight">padding-left: 0 !important;</span>
    <span class="highlight">padding-right: 0 !important;</span>
  }
  </div>
  
  <h2>Visual Representation</h2>
  
  <h3>Regular Page (With Padding)</h3>
  <div class="visual-preview" style="height: 150px;">
    <div class="container with-padding" data-label="Container" style="height: 100%;">
      <span class="padding-indicator left-padding">0.5rem</span>
      <div class="content">
        <p>Page content</p>
      </div>
      <span class="padding-indicator right-padding">0.5rem</span>
    </div>
  </div>
  
  <h3>Reader Page (Without Padding)</h3>
  <div class="visual-preview" style="height: 150px;">
    <div class="container without-padding" data-label="Container (Reader)" style="height: 100%;">
      <div class="content">
        <p>Story content</p>
      </div>
    </div>
  </div>
  
  <h2>Benefits</h2>
  <ul>
    <li>Improved readability - content no longer touches the edge of the screen</li>
    <li>Better mobile experience - small padding creates visual hierarchy</li>
    <li>Maintains full-width appearance while improving readability</li>
    <li>Reader pages maintain their specific styling requirements</li>
  </ul>
  
  <h2>Device Comparison</h2>
  <table>
    <thead>
      <tr>
        <th>Device</th>
        <th>Container Padding</th>
        <th>Effect</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Mobile (320-480px)</td>
        <td>0.5rem (8px)</td>
        <td>Creates space between content and screen edge</td>
      </tr>
      <tr>
        <td>Tablet (768-1024px)</td>
        <td>0.5rem (8px)</td>
        <td>Maintains consistent spacing</td>
      </tr>
      <tr>
        <td>Desktop (1024px+)</td>
        <td>0.5rem (8px)</td>
        <td>Subtle spacing that improves readability</td>
      </tr>
      <tr>
        <td>Reader Pages (all devices)</td>
        <td>0rem (0px)</td>
        <td>Maintains original full-width styling</td>
      </tr>
    </tbody>
  </table>
  
</body>
</html>`;

  // Write the HTML report to file
  fs.writeFileSync('padding-report.html', htmlReport);
  console.log('Report generated: padding-report.html');
}

generateReport();