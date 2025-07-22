/**
 * Simple script to add analytics routes to server/index.ts
 */
const fs = require('fs');
const path = require('path');

// Read the server/index.ts file
const filePath = path.join(__dirname, 'server/index.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Split into lines for easier manipulation
const lines = content.split('\n');

// Function to add the analytics route registration after WordPress sync routes
function addAnalyticsRoutesAfterWordPressSync(lines, startIdx, endIdx) {
  for (let i = startIdx; i < endIdx; i++) {
    const line = lines[i];
    if (line.includes('registerWordPressSyncRoutes(app)') && 
        !lines[i+1].includes('registerAnalyticsRoutes') &&
        !lines[i+2].includes('registerAnalyticsRoutes')) {
      
      // Add the analytics routes line after WordPress sync routes
      lines.splice(i + 1, 0, '', '      // Register analytics routes', '      registerAnalyticsRoutes(app);');
      
      console.log(`Added analytics routes at line ${i+1}`);
      return true;
    }
  }
  return false;
}

// Find and modify in development section (if block)
let devSectionStart = lines.findIndex(line => line.includes('if (isDev)'));
let devSectionEnd = lines.findIndex(line => line.includes('} else {'));
if (devSectionStart !== -1 && devSectionEnd !== -1) {
  addAnalyticsRoutesAfterWordPressSync(lines, devSectionStart, devSectionEnd);
}

// Find and modify in production section (else block)
let prodSectionStart = devSectionEnd;
let prodSectionEnd = lines.findIndex((line, index) => index > prodSectionStart && line.includes('}'));
if (prodSectionStart !== -1 && prodSectionEnd !== -1) {
  addAnalyticsRoutesAfterWordPressSync(lines, prodSectionStart, prodSectionEnd);
}

// Write the modified content back to the file
fs.writeFileSync(filePath, lines.join('\n'));
console.log('Analytics routes added to server/index.ts');
