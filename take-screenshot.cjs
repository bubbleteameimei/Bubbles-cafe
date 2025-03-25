const http = require('http');
const fs = require('fs');

async function takeScreenshot() {
  console.log('Attempting to access reader page...');
  
  // Make a request to the reader page
  http.get('http://localhost:3001/reader', (res) => {
    let data = '';
    
    // A chunk of data has been received
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // The whole response has been received
    res.on('end', () => {
      console.log('Response received, status code:', res.statusCode);
      
      // Save the HTML to a file for inspection
      fs.writeFileSync('reader.html', data);
      console.log('Reader page HTML saved to reader.html');
      
      // Check if the HTML contains certain keywords to verify content
      const containsTitle = data.includes('HUNGER') || data.includes('BLOOD') || data.includes('NOSTALGIA');
      const containsStoryContent = data.includes('story-content') || data.includes('prose');
      
      console.log('Contains title:', containsTitle);
      console.log('Contains story content:', containsStoryContent);
      
      // Bonus: Extract the first post title if possible
      const titleMatch = data.match(/<h1[^>]*>(.+?)<\/h1>/);
      if (titleMatch && titleMatch[1]) {
        console.log('First post title found:', titleMatch[1]);
      }
      
      // Check for overflow properties
      const overflowVisible = data.includes('overflow-visible');
      const overflowHidden = data.includes('overflow-hidden') || data.includes('overflow-x-hidden');
      
      console.log('Contains overflow-visible:', overflowVisible);
      console.log('Contains overflow-hidden:', overflowHidden);
    });
  }).on('error', (err) => {
    console.error('Error accessing reader page:', err.message);
  });
}

takeScreenshot();