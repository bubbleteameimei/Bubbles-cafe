import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Function to make a request and save the response
async function makeRequest(url, outputFile) {
  try {
    console.log(`Fetching ${url}...`);
    const { stdout } = await execPromise(`curl -s "${url}"`);
    fs.writeFileSync(outputFile, stdout);
    console.log(`Response saved to ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return false;
  }
}

// Main function to run all requests
async function runChecks() {
  try {
    // Check the health endpoint
    await makeRequest('http://localhost:3001/api/health', 'health-response.json');

    // Check a post by slug
    await makeRequest('http://localhost:3001/api/posts/nostalgia', 'post-response.json');

    // Check another post by slug
    await makeRequest('http://localhost:3001/api/posts/cave', 'cave-post-response.json');

    // Check recommendations API (requires query parameters)
    await makeRequest('http://localhost:3001/api/posts/recommendations?theme=VIRAL&limit=3', 'recommendations-response.json');

    // Alternative direct method for checking client source code
    await execPromise('mkdir -p client_source_check');
    
    // Run find to locate the silent ping context file
    console.log('Searching for silent-ping-context.tsx...');
    const { stdout: silentPingPath } = await execPromise('find . -name "silent-ping-context.tsx" 2>/dev/null');
    if (silentPingPath.trim()) {
      const filePaths = silentPingPath.trim().split('\n');
      console.log(`Found silent ping context at: ${filePaths[0]}`);
      try {
        await execPromise(`cat "${filePaths[0]}" > client_source_check/silent-ping-context.tsx`);
        console.log('Copied silent ping context file');
      } catch (err) {
        console.error('Failed to copy silent ping context:', err.message);
      }
    } else {
      console.log('Could not find silent-ping-context.tsx');
    }
    
    // Run find to locate the notification settings form
    console.log('Searching for NotificationSettingsForm.tsx...');
    const { stdout: notificationFormPath } = await execPromise('find . -name "NotificationSettingsForm.tsx" 2>/dev/null');
    if (notificationFormPath.trim()) {
      const filePaths = notificationFormPath.trim().split('\n');
      console.log(`Found notification settings form at: ${filePaths[0]}`);
      try {
        await execPromise(`cat "${filePaths[0]}" > client_source_check/NotificationSettingsForm.tsx`);
        console.log('Copied notification settings form file');
      } catch (err) {
        console.error('Failed to copy notification settings form:', err.message);
      }
    } else {
      console.log('Could not find NotificationSettingsForm.tsx');
    }
    
    // Search for CreepyTextGlitch component
    console.log('Searching for CreepyTextGlitch.tsx...');
    const { stdout: creepyGlitchPath } = await execPromise('find . -name "CreepyTextGlitch.tsx" 2>/dev/null');
    if (creepyGlitchPath.trim()) {
      const filePaths = creepyGlitchPath.trim().split('\n');
      console.log(`Found CreepyTextGlitch at: ${filePaths[0]}`);
      try {
        await execPromise(`cat "${filePaths[0]}" > client_source_check/CreepyTextGlitch.tsx`);
        console.log('Copied CreepyTextGlitch file');
      } catch (err) {
        console.error('Failed to copy CreepyTextGlitch file:', err.message);
      }
    } else {
      console.log('Could not find CreepyTextGlitch.tsx');
    }

    console.log('Requests and checks completed.');
  } catch (error) {
    console.error('Error during execution:', error);
  }
}

runChecks();