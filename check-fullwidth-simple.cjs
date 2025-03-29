/**
 * Simple Fullwidth Fix Verification Script
 * 
 * This script checks if the fullwidth fixes have been properly implemented
 * by analyzing the HTML content fetched from the server.
 */

const http = require('http');
const fs = require('fs');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
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
}

async function checkFullwidthFix() {
  console.log('Starting simple fullwidth fix verification...');
  
  try {
    // Fetch homepage
    const homepage = await fetchUrl('http://localhost:3001/');
    fs.writeFileSync('homepage-content.html', homepage);
    console.log(`Homepage size: ${homepage.length} bytes`);
    
    // Check for fullwidth-fix.css
    const hasFullwidthCss = homepage.includes('fullwidth-fix.css');
    console.log(`Fullwidth CSS loaded: ${hasFullwidthCss ? 'Yes ✅' : 'No ❌'}`);
    
    // Check for width-related styles in the HTML
    const hasWidthStyles = homepage.includes('width: 100%') || 
                           homepage.includes('min-width: 100%') || 
                           homepage.includes('max-width: 100vw');
    console.log(`Width styles found: ${hasWidthStyles ? 'Yes ✅' : 'No ❌'}`);
    
    // Check for overflow-hidden styles
    const hasOverflowStyles = homepage.includes('overflow-x: hidden') || 
                              homepage.includes('overflow: hidden');
    console.log(`Overflow styles found: ${hasOverflowStyles ? 'Yes ✅' : 'No ❌'}`);
    
    // Now fetch reader page
    const readerPage = await fetchUrl('http://localhost:3001/reader');
    fs.writeFileSync('reader-content.html', readerPage);
    console.log(`Reader page size: ${readerPage.length} bytes`);
    
    // Check for reader-container class and its styles
    const hasReaderContainer = readerPage.includes('reader-container');
    console.log(`Reader container found: ${hasReaderContainer ? 'Yes ✅' : 'No ❌'}`);
    
    // Check for App.tsx style modifications
    const hasAppStyles = homepage.includes('min-w-full max-w-[100vw]') || 
                        homepage.includes('style={{ width: \'100%\', minWidth: \'100%\'');
    console.log(`App.tsx styles found: ${hasAppStyles ? 'Yes ✅' : 'No ❌'}`);
    
    // Final assessment
    console.log('\nFullwidth Fix Assessment:');
    console.log('------------------------');
    console.log(`1. Fullwidth CSS loaded: ${hasFullwidthCss ? 'Yes ✅' : 'No ❌'}`);
    console.log(`2. Width styles found: ${hasWidthStyles ? 'Yes ✅' : 'No ❌'}`);
    console.log(`3. Overflow styles found: ${hasOverflowStyles ? 'Yes ✅' : 'No ❌'}`);
    console.log(`4. Reader container styles: ${hasReaderContainer ? 'Yes ✅' : 'No ❌'}`);
    console.log(`5. App.tsx styles applied: ${hasAppStyles ? 'Yes ✅' : 'No ❌'}`);
    
    // Overall assessment
    const overallScore = [hasFullwidthCss, hasWidthStyles, hasOverflowStyles, hasReaderContainer, hasAppStyles]
      .filter(Boolean).length;
      
    console.log(`\nOverall implementation score: ${overallScore}/5`);
    
    if (overallScore >= 4) {
      console.log('✅ Fullwidth fix has been properly implemented.');
    } else if (overallScore >= 3) {
      console.log('⚠️ Fullwidth fix is partially implemented but may need improvements.');
    } else {
      console.log('❌ Fullwidth fix needs significant improvements.');
    }
    
    console.log('\nVerification complete. Check the homepage-content.html and reader-content.html files for detailed HTML.');
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

checkFullwidthFix().catch(console.error);