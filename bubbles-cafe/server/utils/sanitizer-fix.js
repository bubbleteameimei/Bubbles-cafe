#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// File to modify
const filePath = path.join(__dirname, '..', 'routes.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Add the import statement at the top
content = content.replace(
  `import { generateEnhancedResponse, generateResponseAlternatives } from './utils/enhanced-feedback-ai';`,
  `import { generateEnhancedResponse, generateResponseAlternatives } from './utils/enhanced-feedback-ai';
import { sanitizeHtml, stripHtml } from './utils/sanitizer';`
);

// Replace all instances of require('./utils/sanitizer')
content = content.replace(
  /const { sanitizeHtml, stripHtml } = require\('\.\/utils\/sanitizer'\);/g,
  '// We now import sanitizer at the top of the file'
);

// Write the file back
fs.writeFileSync(filePath, content);

console.log('Sanitizer import fixed in routes.ts');
