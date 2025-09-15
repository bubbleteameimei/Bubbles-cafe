/**
 * Code Splitting Implementation Script
 * 
 * This script scans the client-side code and suggests places where
 * React.lazy() and dynamic imports can be safely added to
 * implement code splitting without breaking functionality.
 * 
 * IMPORTANT: This script only makes suggestions and doesn't modify code.
 * Review each suggestion carefully before implementing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightBlue: '\x1b[94m',
  brightGreen: '\x1b[92m',
  brightRed: '\x1b[91m',
  brightYellow: '\x1b[93m'
};

// Find all React component files
function findComponentFiles() {
  const clientDir = path.join(__dirname, 'client');
  if (!fs.existsSync(clientDir)) {
    console.error(`${colors.red}Client directory not found!${colors.reset}`);
    return [];
  }
  
  return findFiles(clientDir, ['.jsx', '.tsx']);
}

// Find files with specific extensions in a directory (recursive)
function findFiles(directory, extensions) {
  let results = [];
  
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
      results = results.concat(findFiles(filePath, extensions));
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Analyze a component file for code splitting opportunities
function analyzeComponentFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(__dirname, filePath);
  let opportunities = [];
  
  // Look for imported components that could be lazy-loaded
  const importRegex = /import\s+{?\s*([A-Z][A-Za-z0-9_]*(?:\s*,\s*[A-Z][A-Za-z0-9_]*)*)\s*}?\s*from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const components = match[1].split(',').map(c => c.trim());
    const importPath = match[2];
    
    // Only consider local component imports, not library imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      components.forEach(component => {
        // Check if component is used in routes or lazy-loadable contexts
        if (isLazyLoadCandidate(content, component)) {
          opportunities.push({
            component,
            importPath,
            type: 'lazy',
            originalImport: match[0]
          });
        }
      });
    }
  }
  
  // Look for route definitions that could use lazy loading
  if (content.includes('Route') && 
      (content.includes('component={') || content.includes('element={')) && 
      !content.includes('React.lazy') && 
      !content.includes('Suspense')) {
    opportunities.push({
      type: 'route',
      file: relativePath
    });
  }
  
  return {
    file: relativePath,
    opportunities
  };
}

// Check if a component is a good candidate for lazy loading
function isLazyLoadCandidate(content, component) {
  // Components used in routing, modals, or tabs are good candidates
  const routingPatterns = [
    `Route\\s+.*component={\\s*${component}\\s*}`,
    `element={\\s*<\\s*${component}`,
    `<Dialog\\s+.*>.*<${component}`,
    `<Modal\\s+.*>.*<${component}`,
    `<Tab\\s+.*>.*<${component}`,
    `<Tabs\\s+.*>.*<${component}`,
    `<Accordion\\s+.*>.*<${component}`,
    `<Drawer\\s+.*>.*<${component}`,
    `${component}\\s+.*visible={`
  ];
  
  return routingPatterns.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(content);
  });
}

// Generate code transformation examples
function generateCodeExamples(analysis) {
  let examples = [];
  
  analysis.forEach(fileAnalysis => {
    fileAnalysis.opportunities.forEach(opp => {
      if (opp.type === 'lazy') {
        const example = {
          file: fileAnalysis.file,
          before: opp.originalImport,
          after: `// Add at the top of the file
import React, { Suspense } from 'react';
// Replace the original import with this:
const ${opp.component} = React.lazy(() => import('${opp.importPath}'));

// Wrap the component usage with Suspense:
<Suspense fallback={<div>Loading...</div>}>
  <${opp.component} {...props} />
</Suspense>`
        };
        examples.push(example);
      } else if (opp.type === 'route') {
        const example = {
          file: fileAnalysis.file,
          note: `This file contains route definitions that could benefit from code splitting.`,
          suggestion: `// Add at the top of the file
import React, { Suspense } from 'react';

// Replace direct imports with lazy imports
// Before:
// import { UserProfile } from './UserProfile';
// After:
const UserProfile = React.lazy(() => import('./UserProfile'));

// Then wrap your routes with Suspense
<Routes>
  <Route 
    path="/profile" 
    element={
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfile />
      </Suspense>
    } 
  />
</Routes>`
        };
        examples.push(example);
      }
    });
  });
  
  return examples;
}

// Print code splitting suggestions
function printCodeSplittingSuggestions(examples) {
  console.log('\n===============================================');
  console.log(`${colors.brightYellow}CODE SPLITTING SUGGESTIONS${colors.reset}`);
  console.log('===============================================\n');
  
  if (examples.length === 0) {
    console.log(`${colors.yellow}No obvious code splitting opportunities found.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.green}Found ${examples.length} opportunities for code splitting:${colors.reset}\n`);
  
  examples.forEach((example, index) => {
    console.log(`${colors.cyan}${index + 1}. In file: ${colors.brightBlue}${example.file}${colors.reset}`);
    
    if (example.note) {
      console.log(`   ${colors.yellow}Note:${colors.reset} ${example.note}`);
    }
    
    if (example.before && example.after) {
      console.log(`   ${colors.yellow}Before:${colors.reset}`);
      console.log(`   ${example.before}`);
      console.log(`   ${colors.green}After:${colors.reset}`);
      console.log(`   ${example.after.replace(/\n/g, '\n   ')}`);
    } else if (example.suggestion) {
      console.log(`   ${colors.green}Suggestion:${colors.reset}`);
      console.log(`   ${example.suggestion.replace(/\n/g, '\n   ')}`);
    }
    
    console.log('');
  });
  
  console.log('===============================================');
  console.log(`${colors.brightGreen}IMPLEMENTATION GUIDELINES${colors.reset}`);
  console.log('===============================================');
  console.log('1. Implement changes one at a time and test thoroughly');
  console.log('2. Always wrap lazy-loaded components with <Suspense>');
  console.log('3. Provide meaningful loading states in fallback props');
  console.log('4. Group related components in the same chunk when possible');
  console.log('5. Consider prefetching important routes for better UX');
  console.log('\n');
}

// Main function
async function analyzeSplittingOpportunities() {
  console.log(`\n${colors.brightBlue}CODE SPLITTING ANALYSIS TOOL${colors.reset}\n`);
  
  // Find component files
  console.log(`${colors.cyan}Searching for React component files...${colors.reset}`);
  const componentFiles = findComponentFiles();
  console.log(`${colors.green}Found ${componentFiles.length} component files.${colors.reset}`);
  
  // Analyze each file
  console.log(`${colors.cyan}Analyzing files for code splitting opportunities...${colors.reset}`);
  const analysis = componentFiles.map(file => analyzeComponentFile(file));
  
  // Generate code examples
  const examples = generateCodeExamples(analysis);
  
  // Print suggestions
  printCodeSplittingSuggestions(examples);
}

// Run the script
analyzeSplittingOpportunities().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});