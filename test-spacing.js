// Simple test to access the reader page and check for our changes
import fetch from 'node-fetch';

async function testReaderPage() {
  try {
    console.log('Testing reader page...');
    const response = await fetch('http://localhost:3001/reader');
    
    if (response.ok) {
      const html = await response.text();
      console.log('Successfully fetched reader page');
      
      // Check for our changes in the HTML
      const hasNegativeMargin = html.includes('marginTop: "-14px"');
      const hasReducedHeight = html.includes('minHeight: "30px"');
      
      console.log('Verification results:');
      console.log(`- Negative top margin: ${hasNegativeMargin ? 'YES' : 'NO'}`);
      console.log(`- Reduced height container: ${hasReducedHeight ? 'YES' : 'NO'}`);
      
      if (hasNegativeMargin && hasReducedHeight) {
        console.log('✅ All spacing modifications are present in the page!');
      } else {
        console.log('❌ Some spacing modifications are missing!');
      }
    } else {
      console.error(`Failed to fetch reader page: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error testing reader page:', error);
  }
}

testReaderPage();