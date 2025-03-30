/**
 * Implementation Check Script
 * 
 * This script verifies that:
 * 1. There's only one scroll button implementation in App.tsx
 * 2. The FeedbackButton is conditionally rendered based on route
 * 3. The legacy scroll-to-top.tsx file has been properly deprecated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to check
const appTsxPath = path.join(__dirname, 'client/src/App.tsx');
const scrollCompPath = path.join(__dirname, 'client/src/components/ScrollToTopButton.tsx');
const legacyScrollPath = path.join(__dirname, 'client/src/components/ui/scroll-to-top.tsx');
const mainTsxPath = path.join(__dirname, 'client/src/main.tsx');

// Check results
const results = {
  appImportsScrollButton: false,
  appRendersScrollButton: false,
  appHasNoSecondScrollButton: true,
  conditionalFeedbackImplemented: false,
  legacyScrollHasDeprecationNotice: false,
  mainTsxHasNoScrollToTop: false
};

try {
  // Check App.tsx
  const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  
  // Check ScrollToTopButton import
  results.appImportsScrollButton = appTsxContent.includes("import ScrollToTopButton from './components/ScrollToTopButton';");
  
  // Check if ScrollToTopButton is rendered
  results.appRendersScrollButton = appTsxContent.includes("<ScrollToTopButton position=\"bottom-right\" />");
  
  // Check if there are no instances of the second scroll button
  results.appHasNoSecondScrollButton = !appTsxContent.includes("SecondScrollToTopButton");
  
  // Check if ConditionalFeedbackButton is implemented
  const conditionalFeedbackRegex = /const\s+ConditionalFeedbackButton\s*=\s*\(\)\s*=>\s*\{[^}]*currentPath(\.startsWith\("\S+"\)|\s*===\s*"\S+")+[^}]*\}/s;
  results.conditionalFeedbackImplemented = conditionalFeedbackRegex.test(appTsxContent);
  
  // Specific check for index, reader, and community page conditions
  results.indexPageCheckImplemented = appTsxContent.includes('currentPath === "/"');
  results.readerPageCheckImplemented = appTsxContent.includes('currentPath.startsWith("/reader")');
  results.communityPageCheckImplemented = appTsxContent.includes('currentPath === "/community"');
  
  // Check legacy scroll-to-top.tsx
  const legacyScrollContent = fs.readFileSync(legacyScrollPath, 'utf8');
  results.legacyScrollHasDeprecationNotice = legacyScrollContent.includes("DEPRECATED") || 
                                             legacyScrollContent.includes("deprecated");
  
  // Check main.tsx
  const mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');
  results.mainTsxHasNoScrollToTop = !mainTsxContent.includes("<ScrollToTop />") || 
                                    mainTsxContent.includes("// ScrollToTop removed");
  
  // Print the results
  console.log("\n===== IMPLEMENTATION CHECK RESULTS =====\n");
  
  console.log("1. Scroll Button Implementation:");
  console.log(`   - App.tsx imports ScrollToTopButton: ${results.appImportsScrollButton ? '✅' : '❌'}`);
  console.log(`   - App.tsx renders ScrollToTopButton: ${results.appRendersScrollButton ? '✅' : '❌'}`);
  console.log(`   - No SecondScrollToTopButton used: ${results.appHasNoSecondScrollButton ? '✅' : '❌'}`);
  console.log(`   - main.tsx no longer uses ScrollToTop: ${results.mainTsxHasNoScrollToTop ? '✅' : '❌'}`);
  
  console.log("\n2. Conditional Feedback Button:");
  console.log(`   - ConditionalFeedbackButton is implemented: ${results.conditionalFeedbackImplemented ? '✅' : '❌'}`);
  console.log(`   - Checks for index page (/): ${results.indexPageCheckImplemented ? '✅' : '❌'}`);
  console.log(`   - Checks for reader pages (/reader): ${results.readerPageCheckImplemented ? '✅' : '❌'}`);
  console.log(`   - Checks for community page (/community): ${results.communityPageCheckImplemented ? '✅' : '❌'}`);
  
  console.log("\n3. Legacy Component Status:");
  console.log(`   - scroll-to-top.tsx has deprecation notice: ${results.legacyScrollHasDeprecationNotice ? '✅' : '❌'}`);
  
  console.log("\n=======================================\n");
  
  // Final assessment
  const allChecksPass = Object.values(results).every(result => result === true);
  if (allChecksPass) {
    console.log("✅ ALL CHECKS PASSED: The implementation meets all requirements!");
  } else {
    console.log("❌ SOME CHECKS FAILED: Please review the details above.");
  }
  
} catch (error) {
  console.error("Error checking implementation:", error);
}