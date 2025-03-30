const https = require('https');
const fs = require('fs');

/**
 * Simple CSS Verification Script 
 * 
 * This script verifies that the padding in our CSS is properly set.
 */
async function verifyCSS() {
  console.log('🔍 Verifying padding in CSS...');
  
  try {
    // Use native https module to get the CSS
    const css = await new Promise((resolve, reject) => {
      https.get('https://e62babab-6e6b-4cec-89b9-7f2d78d5543f-00-1kvqk7gnsk6az.spock.replit.dev:3001/src/index.css', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    // Write to file for inspection
    fs.writeFileSync('index-css-verification.txt', css);
    
    // Check for mobile container padding (0.5rem)
    const mobilePaddingRegex = /@media.*?container.*?padding-left:\s*0\.5rem/s;
    const hasMobilePadding = mobilePaddingRegex.test(css);
    
    // Check for reader page padding override (0rem)
    const readerOverrideRegex = /reader.*?container.*?padding-(left|right):\s*0\s*!/s;
    const hasReaderOverride = readerOverrideRegex.test(css);
    
    console.log('\n✅ CSS Verification Results:');
    console.log('---------------------------');
    console.log(`Mobile Container Padding (0.5rem): ${hasMobilePadding ? '✅ FOUND' : '❌ NOT FOUND'}`);
    console.log(`Reader Page Padding Override: ${hasReaderOverride ? '✅ FOUND' : '❌ NOT FOUND'}`);
    
    console.log('\nSaved CSS to index-css-verification.txt for manual inspection');
    
    if (hasMobilePadding && hasReaderOverride) {
      console.log('\n✅ SUCCESS: CSS padding modifications appear to be working correctly!');
    } else {
      console.log('\n⚠️ WARNING: Some CSS padding modifications may not be applied correctly.');
    }
  } catch (error) {
    console.error('Error verifying CSS:', error);
  }
}

// Execute the verification
verifyCSS();