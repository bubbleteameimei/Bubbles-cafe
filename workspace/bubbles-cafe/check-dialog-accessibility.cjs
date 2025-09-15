// Dialog Accessibility Check
const fs = require('fs');
const path = require('path');

// Function to search for dialog components
function findDialogFiles(directory) {
  const results = [];
  
  function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (stat.isFile() && file.endsWith('.tsx') && !file.includes('test') && !file.includes('spec')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if the file contains DialogContent
        if (content.includes('DialogContent')) {
          results.push({
            file: fullPath,
            hasAriaLabelledby: content.includes('aria-labelledby'),
            hasAriaDescribedby: content.includes('aria-describedby'),
            hasDialogTitle: content.includes('DialogTitle'),
            hasDialogDescription: content.includes('DialogDescription'),
            hasDialogHeader: content.includes('DialogHeader')
          });
        }
      }
    }
  }
  
  traverseDirectory(directory);
  return results;
}

// Main function
function checkDialogAccessibility() {
  console.log('Checking dialog accessibility...');
  
  const dialogComponents = findDialogFiles('./client/src');
  
  console.log(`Found ${dialogComponents.length} files with dialog components.`);
  
  let accessibilityIssues = 0;
  
  // Check each file for accessibility issues
  dialogComponents.forEach(component => {
    const issues = [];
    
    if (!component.hasAriaLabelledby && !component.hasDialogTitle) {
      issues.push('Missing aria-labelledby attribute or DialogTitle');
    }
    
    if (!component.hasAriaDescribedby && !component.hasDialogDescription) {
      issues.push('Missing aria-describedby attribute or DialogDescription');
    }
    
    if (!component.hasDialogHeader && (component.hasDialogTitle || component.hasDialogDescription)) {
      issues.push('DialogTitle/Description not wrapped in DialogHeader');
    }
    
    if (issues.length > 0) {
      accessibilityIssues++;
      console.log(`\n❌ ${component.file} has accessibility issues:`);
      issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log(`\n✅ ${component.file} - No accessibility issues found`);
    }
  });
  
  // Print summary
  console.log('\n-------- Summary --------');
  console.log(`Total dialog components: ${dialogComponents.length}`);
  console.log(`Components with issues: ${accessibilityIssues}`);
  console.log(`Accessibility score: ${Math.round(((dialogComponents.length - accessibilityIssues) / dialogComponents.length) * 100)}%`);
  
  return accessibilityIssues === 0;
}

// Run the check
const result = checkDialogAccessibility();
console.log(`\nDialog accessibility check ${result ? 'PASSED' : 'FAILED'}`);