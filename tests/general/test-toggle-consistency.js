/**
 * Toggle Component Consistency Test
 * 
 * This script checks that all toggle switches in the application match the consistent design.
 * It verifies that our switch implementation follows the standardized approach.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to exclude from checking
const EXCLUDED_FILES = [
  'node_modules',
  'dist',
  '.git',
  'temp_',
  'public',
  'toggle-comparison-results.html'
];

function findSwitchComponents(directory) {
  let results = [];
  
  // Read all files in the current directory
  const items = fs.readdirSync(directory);
  
  // Process each item
  for (const item of items) {
    // Skip excluded directories and files
    if (EXCLUDED_FILES.some(excluded => item.includes(excluded))) {
      continue;
    }
    
    const itemPath = path.join(directory, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      // Recursively search subdirectories
      results = results.concat(findSwitchComponents(itemPath));
    } else if (stats.isFile() && 
              (itemPath.endsWith('.tsx') || 
               itemPath.endsWith('.jsx') || 
               itemPath.endsWith('.ts') || 
               itemPath.endsWith('.js'))) {
      try {
        // Read file content
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // Check if it imports the Switch component
        if (content.includes('import') && 
            content.includes('Switch') && 
            content.includes('@/components/ui/switch')) {
          
          // Check usage of Switch component
          const switchUsages = content.match(/<Switch[^>]*>/g);
          if (switchUsages && switchUsages.length > 0) {
            results.push({
              filePath: itemPath,
              usages: switchUsages.length,
              examples: switchUsages.slice(0, 3) // Show first 3 examples
            });
          }
        }
      } catch (error) {
        console.error(`Error reading file ${itemPath}:`, error.message);
      }
    }
  }
  
  return results;
}

function generateReport(switchUsages) {
  // Generate HTML report
  let html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toggle Component Consistency Report</title>
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 20px;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
      }
      h1, h2 {
        color: #333;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      th {
        background-color: #f5f5f5;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .highlight {
        background-color: #ffffcc;
        padding: 2px 4px;
        border-radius: 3px;
      }
      .summary {
        margin: 20px 0;
        padding: 15px;
        background-color: #f0f0f0;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <h1>Toggle Component Consistency Report</h1>
    
    <div class="summary">
      <h2>Summary</h2>
      <p>Found toggle switches in ${switchUsages.length} files.</p>
      <p>Total usage instances: ${switchUsages.reduce((total, file) => total + file.usages, 0)}</p>
    </div>
    
    <h2>Usage Details</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Usages</th>
          <th>Example</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add each file's details
  switchUsages.forEach(file => {
    html += `
      <tr>
        <td>${file.filePath}</td>
        <td>${file.usages}</td>
        <td><pre><code>${file.examples[0]?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || 'N/A'}</code></pre></td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  </body>
  </html>
  `;
  
  // Write report to file
  fs.writeFileSync('toggle-comparison-results.html', html);
  console.log('Report generated: toggle-comparison-results.html');
}

// Start the search process
console.log('Scanning for Switch component usage...');
const switchUsages = findSwitchComponents(process.cwd());
console.log(`Found toggle switches in ${switchUsages.length} files.`);

// Generate the report
generateReport(switchUsages);