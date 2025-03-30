/**
 * Simple verification script to check the updated scroll-to-top button
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyUpdatedButton() {
  try {
    // Check the component file for updated styles
    const filePath = path.join(__dirname, 'client/src/components/ScrollToTopButton.tsx');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    console.log('Checking updated scroll-to-top button...');
    
    // Define checks for the updated styling
    const checks = [
      {
        name: 'Smaller size (40px)',
        pattern: /width:\s*['"]40px['"]/,
        required: true
      },
      {
        name: 'Neutral color (#f5f5f5)',
        pattern: /backgroundColor:\s*['"]#f5f5f5['"]/,
        required: true
      },
      {
        name: 'Smoother animation',
        pattern: /transition:\s*['"]all\s+0\.4s\s+cubic-bezier\(/,
        required: true
      },
      {
        name: 'Smaller arrow icon',
        pattern: /<ArrowUp\s+size=\{18\}\s*\/>/,
        required: true
      },
      {
        name: 'Subtle hover effect',
        pattern: /transform:\s*['"]translateY\(-1px\)['"]/,
        required: true
      }
    ];
    
    let allUpdatesFound = true;
    
    // Check each style update
    checks.forEach(check => {
      const found = check.pattern.test(fileContent);
      console.log(`${found ? '✅' : '❌'} ${check.name}: ${found ? 'Applied' : 'Not applied'}`);
      
      if (check.required && !found) {
        allUpdatesFound = false;
      }
    });
    
    if (allUpdatesFound) {
      console.log('\n✅ SUCCESS: All requested button updates have been applied!');
    } else {
      console.log('\n❌ WARNING: Some requested button updates are missing.');
    }
    
    // Now check if the app is running and serving content
    console.log('\nChecking if the application is accessible...');
    try {
      const response = await fetch('http://localhost:3002');
      
      if (response.ok) {
        console.log('✅ Application is running and accessible.');
      } else {
        console.log(`❌ Application returned status code: ${response.status}`);
      }
    } catch (error) {
      console.log('❌ Could not connect to the application:', error.message);
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

verifyUpdatedButton();