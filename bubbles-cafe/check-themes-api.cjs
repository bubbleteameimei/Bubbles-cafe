/**
 * Simple script to check if theme categories are being set in the API response
 */
const http = require('http');

function checkPostsAPI() {
  console.log('Fetching posts from API...');
  
  const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/posts?limit=3',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        const posts = response.posts || [];
        
        console.log(`\nFetched ${posts.length} posts from API`);
        
        if (posts.length === 0) {
          console.log('No posts found!');
          return;
        }
        
        console.log('\nChecking theme data in posts:');
        posts.forEach((post, index) => {
          console.log(`\nPost #${index + 1}: ${post.title}`);
          console.log(`- Theme Category: ${post.themeCategory || 'Not set'}`);
          console.log(`- Theme Icon: ${post.themeIcon || 'Not set'}`);
          
          // Check if theme is automatically detected or admin-assigned
          if (post.themeCategory) {
            const theme = post.themeCategory;
            console.log(`- Theme Assignment: ${(post.metadata && post.metadata.adminAssignedTheme) ? 'Admin-assigned' : 'Auto-detected'}`);
          } else {
            console.log('- Theme Assignment: None');
          }
        });
        
        // Summary
        const postsWithTheme = posts.filter(post => post.themeCategory).length;
        const postsWithIcon = posts.filter(post => post.themeIcon).length;
        
        console.log('\nSummary:');
        console.log(`- Posts with theme category: ${postsWithTheme}/${posts.length}`);
        console.log(`- Posts with theme icon: ${postsWithIcon}/${posts.length}`);
      } catch (error) {
        console.error('Error parsing API response:', error);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error connecting to API:', error);
  });
  
  req.end();
}

checkPostsAPI();