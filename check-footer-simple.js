/**
 * Super simple script to check the footer HTML using direct fetch
 */
import { promises as fs } from 'fs';
import http from 'http';

async function checkFooter() {
  console.log('Fetching homepage HTML...');
  
  try {
    // Fetch the HTML content with regular http module
    const html = await new Promise((resolve, reject) => {
      http.get('http://localhost:3000/', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve(data);
        });
        res.on('error', (err) => {
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    // Save the full HTML for reference
    await fs.writeFile('homepage-full.html', html);
    console.log('Saved full HTML to homepage-full.html');
    
    // Extract footer content with a regex
    const footerRegex = /<footer[^>]*>([\s\S]*?)<\/footer>/i;
    const footerMatch = html.match(footerRegex);
    
    if (footerMatch && footerMatch[0]) {
      const footerHtml = footerMatch[0];
      
      // Save the footer HTML to a file
      await fs.writeFile('footer.html', footerHtml);
      console.log('Saved footer HTML to footer.html');
      
      // Check for centering classes
      const hasCenteredClasses = 
        footerHtml.includes('items-center') && 
        footerHtml.includes('justify-center') && 
        footerHtml.includes('text-center');
      
      // Check for copyright text
      const hasCopyright = 
        footerHtml.includes("Bubble's Cafe") && 
        footerHtml.includes("All rights reserved");
      
      // Check for removed tagline
      const hasTagline = footerHtml.includes("Providing the best storytelling experience");
      
      console.log('Footer Analysis Results:');
      console.log('-----------------------');
      console.log(`Centered Classes: ${hasCenteredClasses ? 'YES ✓' : 'NO ✗'}`);
      console.log(`Copyright Text: ${hasCopyright ? 'YES ✓' : 'NO ✗'}`);
      console.log(`Tagline Removed: ${!hasTagline ? 'YES ✓' : 'NO ✗'}`);
      
      // Print a snippet of the footer HTML
      console.log('\nFooter HTML Snippet:');
      console.log('-----------------');
      console.log(footerHtml.substring(0, 500) + '...');
      
      return {
        hasCenteredClasses,
        hasCopyright,
        taglineRemoved: !hasTagline
      };
    } else {
      console.error('Footer element not found in HTML!');
      return { error: 'Footer not found' };
    }
  } catch (error) {
    console.error('Error fetching and analyzing footer:', error.message);
    return { error: error.message };
  }
}

// Run the check
checkFooter();