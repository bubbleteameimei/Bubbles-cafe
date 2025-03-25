import http from 'http';
import fs from 'fs';

// Function to fetch the homepage HTML
async function fetchHomepage() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3001', (res) => {
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
}

// Main function to check the site
async function checkSite() {
  try {
    console.log('Fetching homepage...');
    const html = await fetchHomepage();
    
    // Save the HTML to a file for inspection
    fs.writeFileSync('homepage.html', html);
    console.log('Homepage HTML saved to homepage.html');
    
    // Basic analysis of the HTML
    console.log('\nBasic Analysis:');
    
    // Check for navigation
    if (html.includes('class="navigation')) {
      console.log('✅ Navigation element found');
    } else {
      console.log('❌ Navigation element not found');
    }
    
    // Check for reader controls
    if (html.includes('class="reader-controls')) {
      console.log('✅ Reader controls found');
    } else {
      console.log('❌ Reader controls not found');
    }
    
    // Check for negative margins that might indicate spacing fixes
    const negativeMargins = html.match(/-mt-[0-9]+/g) || [];
    console.log(`Found ${negativeMargins.length} negative margin classes:`, negativeMargins);
    
    console.log('\nDone! Check homepage.html for the full HTML content.');
  } catch (error) {
    console.error('Error checking site:', error);
  }
}

// Run the check
checkSite();