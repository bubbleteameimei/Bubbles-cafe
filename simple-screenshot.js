import fetch from 'node-fetch';
import fs from 'fs/promises';

// Function to make a request and save the response HTML
async function makeRequest(url, outputFile) {
  try {
    console.log(`Fetching ${url}...`);
    const response = await fetch(url);
    const body = await response.text();
    
    await fs.writeFile(outputFile, body);
    console.log(`Content saved to ${outputFile}`);
    
    return body;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

// Main function to run our checks
async function runChecks() {
  // Check homepage
  await makeRequest('http://localhost:3001/', 'homepage.html');
  
  // Check reader page
  await makeRequest('http://localhost:3001/reader', 'reader.html');
  
  // Check a specific story
  await makeRequest('http://localhost:3001/reader/nostalgia', 'story-nostalgia.html');
  
  console.log('All checks completed. Content saved to HTML files.');
}

runChecks();