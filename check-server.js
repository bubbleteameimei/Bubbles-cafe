/**
 * Simple script to check if our server is running
 */
import fetch from 'node-fetch';

async function checkServer() {
  console.log('Checking server status...');
  
  try {
    // Check if the server is responding
    const response = await fetch('http://localhost:3003');
    const status = response.status;
    
    console.log(`Server responded with status: ${status}`);
    
    if (status === 200) {
      console.log('Server is running correctly!');
      
      // Get the HTML content
      const html = await response.text();
      console.log(`Retrieved ${html.length} bytes of HTML content`);
      
      // Check for key elements in the HTML
      if (html.includes('Browse Stories')) {
        console.log('✅ Found "Browse Stories" button in the HTML');
      } else {
        console.log('❌ Could not find "Browse Stories" button in the HTML');
      }
      
      if (html.includes('Bookmark')) {
        console.log('✅ Found bookmark functionality in the HTML');
      } else {
        console.log('❌ Could not find bookmark functionality in the HTML');
      }
      
      return { success: true };
    } else {
      console.log(`Server responded with an unexpected status code: ${status}`);
      return { success: false };
    }
  } catch (error) {
    console.error('Error checking server:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the check
checkServer()
  .then(result => {
    if (!result.success) {
      console.error('Server check failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });