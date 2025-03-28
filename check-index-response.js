/**
 * Check Index Page Response
 * 
 * This script makes a simple request to the index page to verify it's working.
 */
import fetch from 'node-fetch';

async function checkIndexPage() {
  try {
    console.log('Making request to index page...');
    const response = await fetch('http://localhost:3001/');
    
    if (response.ok) {
      console.log('✅ Index page is responding properly!');
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      console.log(`Content length: ${response.headers.get('content-length')} bytes`);
    } else {
      console.error(`❌ Error: Server responded with status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error making request:', error.message);
  }
}

checkIndexPage();