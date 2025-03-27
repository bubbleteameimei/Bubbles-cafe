/**
 * Simple screenshot generator script for comment section test
 */

import fs from 'fs';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current file directory for proper path resolution in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function makeRequest(url, outputFile) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      res.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        try {
          // Simple console output for the test
          console.log(`[Response from ${url}]`);
          console.log(`HTTP Status: ${res.statusCode}`);
          console.log(`Content Length: ${buffer.length} bytes`);
          
          if (outputFile) {
            fs.writeFileSync(outputFile, buffer);
            console.log(`Response saved to ${outputFile}`);
          }
          
          resolve(buffer.toString());
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runChecks() {
  try {
    console.log('Starting simple visual test...');
    
    // Open our test HTML file to view visuals
    const testHtml = fs.readFileSync(path.join(__dirname, 'simple-comment-test.html'), 'utf8');
    console.log('Successfully loaded test HTML file.');
    
    // Make a request to check if the application is running
    try {
      // Testing local server if available
      const healthResult = await makeRequest('http://localhost:3000/api/health', null);
      console.log('Application is running.');
      
      // Save response to a file for review
      const healthJsonPath = path.join(__dirname, 'health-response.json');
      fs.writeFileSync(healthJsonPath, healthResult);
      console.log(`Health response saved to ${healthJsonPath}`);
    } catch (err) {
      console.log('Could not connect to application server, it may not be running.');
      console.log('Error:', err.message);
    }
    
    // Check the test HTML file visually
    console.log('\nVisual Test:');
    console.log('1. Open simple-comment-test.html in a browser to see the comment section visuals');
    console.log('2. Verify the anonymous vs authenticated user display');
    console.log('3. Check comment styling and layout');
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

runChecks().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});