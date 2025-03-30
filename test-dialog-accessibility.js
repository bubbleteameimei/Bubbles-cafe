/**
 * Dialog Accessibility Test Script
 * 
 * This script tests the accessibility of dialog components to verify
 * that the fix for the "string did not match the expected pattern" error is working.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testDialogAccessibility() {
  console.log('Checking Dialog component for accessibility improvements...');
  
  // Read the dialog.tsx file
  const dialogPath = path.join(process.cwd(), 'client/src/components/ui/dialog.tsx');
  try {
    const dialogContent = fs.readFileSync(dialogPath, 'utf8');
    
    // Check for empty string validation for aria attributes
    const hasAriaLabelledbyCheck = dialogContent.includes('ariaLabelledby.trim() !== ""');
    const hasAriaDescribedbyCheck = dialogContent.includes('ariaDescribedby.trim() !== ""');
    
    // Check for id validation
    const hasTitleIdValidation = dialogContent.includes('if (!titleId || titleId.trim() === "")');
    const hasDescIdValidation = dialogContent.includes('if (!descId || descId.trim() === "")');
    
    // Check for aria-label improvements in DialogClose
    const hasImprovedAriaLabel = dialogContent.includes('aria-label={!hasAriaLabel ? (childrenText || "Close dialog")');
    
    console.log('Accessibility Improvement Checks:');
    console.log('- aria-labelledby empty string check:', hasAriaLabelledbyCheck ? '✓' : '✗');
    console.log('- aria-describedby empty string check:', hasAriaDescribedbyCheck ? '✓' : '✗');
    console.log('- DialogTitle id validation:', hasTitleIdValidation ? '✓' : '✗');
    console.log('- DialogDescription id validation:', hasDescIdValidation ? '✓' : '✗');
    console.log('- DialogClose aria-label improvements:', hasImprovedAriaLabel ? '✓' : '✗');
    
    const passedChecks = [
      hasAriaLabelledbyCheck, 
      hasAriaDescribedbyCheck, 
      hasTitleIdValidation, 
      hasDescIdValidation,
      hasImprovedAriaLabel
    ].filter(Boolean).length;
    
    console.log(`\nOverall progress: ${passedChecks}/5 improvements implemented`);
    
    if (passedChecks === 5) {
      console.log('\n✅ Dialog accessibility improvements have been successfully implemented!');
      console.log('This should resolve the "string did not match the expected pattern" error.');
    } else {
      console.log('\n⚠️ Some dialog accessibility improvements are missing.');
      console.log('Please complete all improvements to resolve the accessibility error.');
    }
    
  } catch (error) {
    console.error('Error reading dialog component file:', error);
  }
}

// Run the test function
testDialogAccessibility();