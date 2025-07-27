#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🧹 Starting comprehensive dead code cleanup...\n');

// Configuration
const config = {
  srcDirs: ['client/src', 'server', 'shared'],
  excludePatterns: [
    '*.test.*',
    '*.spec.*',
    '*.stories.*',
    '*.d.ts',
    'node_modules',
    'dist',
    'build',
    '.git'
  ],
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
  backupDir: '.cleanup-backup'
};

// Create backup before cleanup
function createBackup() {
  console.log('📦 Creating backup...');
  if (fs.existsSync(config.backupDir)) {
    execSync(`rm -rf ${config.backupDir}`);
  }
  execSync(`mkdir -p ${config.backupDir}`);
  
  config.srcDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      execSync(`cp -r ${dir} ${config.backupDir}/`);
    }
  });
  
  console.log('✅ Backup created\n');
}

// Find all source files
function findSourceFiles() {
  const files = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!config.excludePatterns.some(pattern => 
          entry.name.includes(pattern.replace('*', ''))
        )) {
          walkDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (config.extensions.includes(ext) && 
            !config.excludePatterns.some(pattern => 
              entry.name.includes(pattern.replace('*', ''))
            )) {
          files.push(fullPath);
        }
      }
    }
  }
  
  config.srcDirs.forEach(dir => walkDir(dir));
  return files;
}

// Parse file for imports and exports
function parseFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const imports = [];
    const exports = [];
    const variables = [];
    const functions = [];
    const components = [];
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Find imports
      if (trimmed.startsWith('import ')) {
        const match = trimmed.match(/import\s+(?:(?:\{([^}]+)\})|(\w+)|(\* as \w+))\s+from\s+['"`]([^'"`]+)['"`]/);
        if (match) {
          const [, namedImports, defaultImport, namespaceImport, source] = match;
          
          if (namedImports) {
            namedImports.split(',').forEach(imp => {
              const name = imp.trim().replace(/\s+as\s+\w+/, '');
              imports.push({ name, source, line: index + 1, type: 'named' });
            });
          } else if (defaultImport) {
            imports.push({ name: defaultImport, source, line: index + 1, type: 'default' });
          } else if (namespaceImport) {
            const name = namespaceImport.replace('* as ', '');
            imports.push({ name, source, line: index + 1, type: 'namespace' });
          }
        }
      }
      
      // Find exports
      if (trimmed.startsWith('export ')) {
        const match = trimmed.match(/export\s+(?:(?:const|let|var|function|class|interface|type)\s+)?(\w+)/);
        if (match) {
          exports.push({ name: match[1], line: index + 1 });
        }
      }
      
      // Find variable declarations
      const varMatch = trimmed.match(/(?:const|let|var)\s+(\w+)/);
      if (varMatch && !trimmed.includes('import') && !trimmed.includes('export')) {
        variables.push({ name: varMatch[1], line: index + 1 });
      }
      
      // Find function declarations
      const funcMatch = trimmed.match(/(?:function|const|let)\s+(\w+)\s*[\(=]/);
      if (funcMatch && !trimmed.includes('import') && !trimmed.includes('export')) {
        functions.push({ name: funcMatch[1], line: index + 1 });
      }
      
      // Find React components
      const componentMatch = trimmed.match(/(?:const|function)\s+([A-Z]\w+)\s*[\(=]/);
      if (componentMatch && (filePath.includes('.tsx') || filePath.includes('.jsx'))) {
        components.push({ name: componentMatch[1], line: index + 1 });
      }
    });
    
    return { content, imports, exports, variables, functions, components };
  } catch (error) {
    console.warn(`⚠️  Could not parse ${filePath}: ${error.message}`);
    return null;
  }
}

// Check if identifier is used in content
function isUsedInContent(name, content, filePath) {
  // Skip common patterns that might cause false positives
  const skipPatterns = [
    'React',
    'useState',
    'useEffect',
    'default',
    'props',
    'children',
    'className',
    'onClick'
  ];
  
  if (skipPatterns.includes(name)) {
    return true;
  }
  
  // Look for usage patterns
  const usagePatterns = [
    new RegExp(`\\b${name}\\s*\\(`, 'g'), // Function calls
    new RegExp(`\\b${name}\\.`, 'g'), // Property access
    new RegExp(`<${name}[\\s>]`, 'g'), // JSX components
    new RegExp(`\\b${name}\\s*[=:]`, 'g'), // Assignments
    new RegExp(`\\{\\s*${name}\\s*\\}`, 'g'), // Destructuring
    new RegExp(`\\b${name}\\b(?!\\s*[:=])`, 'g') // General usage
  ];
  
  return usagePatterns.some(pattern => {
    const matches = content.match(pattern) || [];
    // Subtract declaration lines to avoid counting the declaration itself
    return matches.length > 1;
  });
}

// Find unused imports
function findUnusedImports() {
  console.log('🔍 Finding unused imports...');
  const files = findSourceFiles();
  const unusedImports = [];
  
  files.forEach(filePath => {
    const parsed = parseFile(filePath);
    if (!parsed) return;
    
    const { content, imports } = parsed;
    
    imports.forEach(imp => {
      if (!isUsedInContent(imp.name, content, filePath)) {
        unusedImports.push({ ...imp, filePath });
      }
    });
  });
  
  console.log(`Found ${unusedImports.length} unused imports`);
  return unusedImports;
}

// Find unused variables and functions
function findUnusedVariables() {
  console.log('🔍 Finding unused variables and functions...');
  const files = findSourceFiles();
  const unused = [];
  
  files.forEach(filePath => {
    const parsed = parseFile(filePath);
    if (!parsed) return;
    
    const { content, variables, functions } = parsed;
    
    [...variables, ...functions].forEach(item => {
      if (!isUsedInContent(item.name, content, filePath)) {
        unused.push({ ...item, filePath });
      }
    });
  });
  
  console.log(`Found ${unused.length} unused variables/functions`);
  return unused;
}

// Find unused components
function findUnusedComponents() {
  console.log('🔍 Finding unused components...');
  const files = findSourceFiles();
  const allFiles = new Map();
  const usedComponents = new Set();
  
  // Parse all files first
  files.forEach(filePath => {
    const parsed = parseFile(filePath);
    if (parsed) {
      allFiles.set(filePath, parsed);
    }
  });
  
  // Find component usage across all files
  allFiles.forEach((parsed, filePath) => {
    const { content } = parsed;
    
    allFiles.forEach((otherParsed, otherFilePath) => {
      if (filePath === otherFilePath) return;
      
      otherParsed.components.forEach(component => {
        if (content.includes(`<${component.name}`) || 
            content.includes(`${component.name}`)) {
          usedComponents.add(component.name);
        }
      });
    });
  });
  
  // Find unused components
  const unusedComponents = [];
  allFiles.forEach((parsed, filePath) => {
    parsed.components.forEach(component => {
      if (!usedComponents.has(component.name) && 
          !isUsedInContent(component.name, parsed.content, filePath)) {
        unusedComponents.push({ ...component, filePath });
      }
    });
  });
  
  console.log(`Found ${unusedComponents.length} unused components`);
  return unusedComponents;
}

// Find unused files
function findUnusedFiles() {
  console.log('🔍 Finding unused files...');
  const files = findSourceFiles();
  const usedFiles = new Set();
  const unusedFiles = [];
  
  // Track all import sources
  files.forEach(filePath => {
    const parsed = parseFile(filePath);
    if (!parsed) return;
    
    parsed.imports.forEach(imp => {
      if (imp.source.startsWith('.') || imp.source.startsWith('/')) {
        // Resolve relative path
        const resolvedPath = path.resolve(path.dirname(filePath), imp.source);
        
        // Try different extensions
        const possibleFiles = [
          resolvedPath,
          resolvedPath + '.ts',
          resolvedPath + '.tsx',
          resolvedPath + '.js',
          resolvedPath + '.jsx',
          path.join(resolvedPath, 'index.ts'),
          path.join(resolvedPath, 'index.tsx'),
          path.join(resolvedPath, 'index.js'),
          path.join(resolvedPath, 'index.jsx')
        ];
        
        possibleFiles.forEach(file => {
          if (fs.existsSync(file)) {
            usedFiles.add(file);
          }
        });
      }
    });
  });
  
  // Find files not in used set
  files.forEach(filePath => {
    if (!usedFiles.has(path.resolve(filePath)) && 
        !filePath.includes('main.') && 
        !filePath.includes('index.') &&
        !filePath.includes('App.')) {
      unusedFiles.push(filePath);
    }
  });
  
  console.log(`Found ${unusedFiles.length} potentially unused files`);
  return unusedFiles;
}

// Remove unused imports from file
function removeUnusedImports(filePath, unusedImports) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Group by line number (descending to avoid index issues)
  const importsByLine = {};
  unusedImports.forEach(imp => {
    if (!importsByLine[imp.line]) {
      importsByLine[imp.line] = [];
    }
    importsByLine[imp.line].push(imp);
  });
  
  // Remove imports from bottom to top
  Object.keys(importsByLine)
    .map(Number)
    .sort((a, b) => b - a)
    .forEach(lineNum => {
      const lineIndex = lineNum - 1;
      const line = lines[lineIndex];
      const importsOnLine = importsByLine[lineNum];
      
      if (importsOnLine.length === 1 && importsOnLine[0].type === 'default') {
        // Remove entire line for single default import
        lines.splice(lineIndex, 1);
      } else {
        // Handle named imports
        let newLine = line;
        importsOnLine.forEach(imp => {
          if (imp.type === 'named') {
            // Remove from destructured import
            newLine = newLine.replace(
              new RegExp(`\\s*,?\\s*${imp.name}\\s*,?`, 'g'), 
              ''
            );
            newLine = newLine.replace(/\{\s*,/, '{');
            newLine = newLine.replace(/,\s*\}/, '}');
            newLine = newLine.replace(/\{\s*\}/, '');
          }
        });
        
        if (newLine.includes('import') && newLine.includes('from')) {
          lines[lineIndex] = newLine;
        } else {
          lines.splice(lineIndex, 1);
        }
      }
    });
  
  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent);
}

// Generate cleanup report
function generateReport(results) {
  const reportPath = 'cleanup-report.md';
  const timestamp = new Date().toISOString();
  
  let report = `# Dead Code Cleanup Report\n\n`;
  report += `Generated: ${timestamp}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- Unused imports: ${results.unusedImports.length}\n`;
  report += `- Unused variables/functions: ${results.unusedVariables.length}\n`;
  report += `- Unused components: ${results.unusedComponents.length}\n`;
  report += `- Potentially unused files: ${results.unusedFiles.length}\n\n`;
  
  if (results.unusedImports.length > 0) {
    report += `## Unused Imports\n\n`;
    results.unusedImports.forEach(imp => {
      report += `- \`${imp.name}\` from \`${imp.source}\` in ${imp.filePath}:${imp.line}\n`;
    });
    report += '\n';
  }
  
  if (results.unusedVariables.length > 0) {
    report += `## Unused Variables/Functions\n\n`;
    results.unusedVariables.forEach(variable => {
      report += `- \`${variable.name}\` in ${variable.filePath}:${variable.line}\n`;
    });
    report += '\n';
  }
  
  if (results.unusedComponents.length > 0) {
    report += `## Unused Components\n\n`;
    results.unusedComponents.forEach(component => {
      report += `- \`${component.name}\` in ${component.filePath}:${component.line}\n`;
    });
    report += '\n';
  }
  
  if (results.unusedFiles.length > 0) {
    report += `## Potentially Unused Files\n\n`;
    results.unusedFiles.forEach(file => {
      report += `- ${file}\n`;
    });
    report += '\n';
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`📋 Report generated: ${reportPath}`);
}

// Main cleanup function
async function cleanup() {
  try {
    createBackup();
    
    const results = {
      unusedImports: findUnusedImports(),
      unusedVariables: findUnusedVariables(),
      unusedComponents: findUnusedComponents(),
      unusedFiles: findUnusedFiles()
    };
    
    generateReport(results);
    
    // Ask for confirmation before removing
    console.log('\n🚨 This will modify your source files!');
    console.log('📦 A backup has been created in .cleanup-backup/');
    console.log('📋 Check cleanup-report.md for details');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('\nProceed with cleanup? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log('\n🧹 Cleaning up unused imports...');
        
        // Group unused imports by file
        const importsByFile = {};
        results.unusedImports.forEach(imp => {
          if (!importsByFile[imp.filePath]) {
            importsByFile[imp.filePath] = [];
          }
          importsByFile[imp.filePath].push(imp);
        });
        
        // Remove unused imports
        Object.entries(importsByFile).forEach(([filePath, imports]) => {
          removeUnusedImports(filePath, imports);
        });
        
        console.log('✅ Cleanup completed!');
        console.log('\n📝 What was cleaned:');
        console.log(`  - Removed ${results.unusedImports.length} unused imports`);
        console.log('\n⚠️  Manual review recommended for:');
        console.log(`  - ${results.unusedVariables.length} unused variables/functions`);
        console.log(`  - ${results.unusedComponents.length} unused components`);
        console.log(`  - ${results.unusedFiles.length} potentially unused files`);
        console.log('\n💡 Run `npm run check` to verify TypeScript compilation');
      } else {
        console.log('❌ Cleanup cancelled');
      }
      
      readline.close();
    });
    
  } catch (error) {
    console.error('💥 Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run cleanup
if (require.main === module) {
  cleanup();
}

module.exports = {
  findUnusedImports,
  findUnusedVariables,
  findUnusedComponents,
  findUnusedFiles,
  generateReport
};