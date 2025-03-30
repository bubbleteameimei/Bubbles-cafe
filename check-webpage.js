import http from 'http';

/**
 * Simple script to check if the webpage is loading correctly
 */
function checkWebpage() {
  console.log('Checking if webpage is loading...');
  
  // Make a request to the local server
  http.get('http://localhost:3002', (res) => {
    console.log(`Status code: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response received, checking page content...');
      
      // Check if the page has loaded (simple check)
      if (data.length > 0) {
        console.log(`✅ Page loaded successfully (${data.length} bytes)`);
        
        // Check for specific elements expected in the HTML
        if (data.includes('<title>')) {
          const titleMatch = data.match(/<title>(.*?)<\/title>/);
          if (titleMatch) {
            console.log(`✅ Page title: "${titleMatch[1]}"`);
          }
        }
        
        // Check for client-side rendered elements
        if (data.includes('id="root"')) {
          console.log('✅ Root element found - React app should mount here');
        }
        
        // Look for script tags that would load the app
        if (data.includes('src="/assets/') || data.includes('src="/static/')) {
          console.log('✅ Script tags found - client-side JS should load');
        }
        
        console.log('\n✅ Basic page check completed successfully!');
      } else {
        console.error('❌ Page returned empty response');
      }
    });
  }).on('error', (err) => {
    console.error(`❌ Error fetching page: ${err.message}`);
  });
}

checkWebpage();