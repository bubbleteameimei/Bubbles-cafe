import { exec } from 'child_process';
import fetch from 'node-fetch';

async function checkResponsiveDemo() {
  try {
    // Check if Vite dev server is serving the responsive-demo page
    const response = await fetch('http://localhost:3001/responsive-demo');
    
    if (response.status === 200) {
      console.log('✅ Responsive demo page is accessible!');
      return true;
    } else {
      console.log(`❌ Responsive demo page returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking responsive demo page:', error.message);
    return false;
  }
}

// Run the check
checkResponsiveDemo();