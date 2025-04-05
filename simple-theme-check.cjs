/**
 * Simple Theme Check using CommonJS
 */
const http = require('http');

function checkThemeIcons() {
  console.log('Fetching homepage HTML...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Check for badge elements
      const badgeMatches = data.match(/<span[^>]*class="[^"]*badge[^"]*"[^>]*>/gi) || [];
      console.log(`Found ${badgeMatches.length} badge elements on the page`);
      
      if (badgeMatches.length > 0) {
        console.log('\nSample badges:');
        badgeMatches.slice(0, 3).forEach((badge, index) => {
          console.log(`Badge ${index + 1}: ${badge}`);
        });
      }
      
      // Check for theme categories in HTML
      const themeCategories = ['horror', 'ghost', 'skull', 'brain', 'scissors'];
      console.log('\nChecking for specific theme names:');
      
      themeCategories.forEach(theme => {
        const regex = new RegExp(`\\b${theme}\\b`, 'gi');
        const matches = data.match(regex) || [];
        console.log(`- "${theme}": ${matches.length} matches`);
      });
    });
  });
  
  req.on('error', (error) => {
    console.error('Error during theme icon check:', error);
  });
  
  req.end();
}

checkThemeIcons();