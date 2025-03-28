/**
 * Tooltip Alignment Test
 * 
 * This script checks if the tooltip in the reader page
 * is properly centered according to the container width.
 */

import fs from 'fs';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

async function testTooltipAlignment() {
  console.log("Starting tooltip alignment test...");
  
  try {
    // Fetch the reader page
    const response = await fetch('http://localhost:3001/reader');
    const html = await response.text();
    
    // Parse the HTML with JSDOM
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Check for tooltip container
    const tooltipContainer = document.querySelector('.fixed.bottom-12 .container.max-w-4xl');
    
    if (!tooltipContainer) {
      console.error("❌ Tooltip container with class 'fixed bottom-12 .container.max-w-4xl' not found!");
      return false;
    }
    
    console.log("✅ Found tooltip container with correct classes");
    
    // Check tooltip classes
    const tooltipClasses = tooltipContainer.className;
    console.log(`Tooltip container classes: ${tooltipClasses}`);
    
    // Verify max-w-4xl class is present
    if (!tooltipClasses.includes('max-w-4xl')) {
      console.error("❌ Tooltip container is missing 'max-w-4xl' class!");
      return false;
    }
    
    console.log("✅ Tooltip container has 'max-w-4xl' class for proper width");
    
    // Check for mx-auto class for centering
    if (!tooltipClasses.includes('mx-auto')) {
      console.error("❌ Tooltip container is missing 'mx-auto' class for centering!");
      return false;
    }
    
    console.log("✅ Tooltip container has 'mx-auto' class for proper centering");
    
    // Check for story content container
    const storyContainer = document.querySelector('.story-content');
    
    if (!storyContainer) {
      console.warn("⚠️ Story content container not found with class 'story-content'");
    } else {
      const storyClasses = storyContainer.className;
      console.log(`Story container classes: ${storyClasses}`);
      
      // Verify max-w-4xl class is present in story container
      if (!storyClasses.includes('max-w-4xl')) {
        console.warn("⚠️ Story container is missing 'max-w-4xl' class!");
      } else {
        console.log("✅ Story container has 'max-w-4xl' class for proper width");
      }
    }
    
    // Get the about page for comparison
    const aboutResponse = await fetch('http://localhost:3001/about');
    const aboutHtml = await aboutResponse.text();
    const aboutDom = new JSDOM(aboutHtml);
    const aboutDocument = aboutDom.window.document;
    
    // Check for about page container
    const aboutContainer = aboutDocument.querySelector('.container.max-w-4xl');
    
    if (!aboutContainer) {
      console.warn("⚠️ About page container with class 'container.max-w-4xl' not found!");
    } else {
      const aboutClasses = aboutContainer.className;
      console.log(`About page container classes: ${aboutClasses}`);
      
      // Compare classes between tooltip and about page
      console.log("Checking if the same centering approach is used in both pages:");
      
      if (aboutClasses.includes('mx-auto') && tooltipClasses.includes('mx-auto')) {
        console.log("✅ Both tooltip and about page containers use 'mx-auto' for centering");
      } else {
        console.warn("⚠️ Centering approach differs between tooltip and about page");
      }
      
      if (aboutClasses.includes('px-4') && tooltipClasses.includes('px-4')) {
        console.log("✅ Both tooltip and about page containers use 'px-4' for padding");
      } else {
        console.warn("⚠️ Padding approach differs between tooltip and about page");
      }
    }
    
    // Final verification
    console.log("\n=== Alignment Test Results ===");
    if (tooltipClasses.includes('max-w-4xl') && tooltipClasses.includes('mx-auto')) {
      console.log("✅ PASSED: Tooltip is properly centered with correct width constraints");
      
      // Save a reference to the HTML for manual inspection
      fs.writeFileSync('reader-page-snapshot.html', html);
      console.log("HTML snapshot saved to reader-page-snapshot.html for manual verification");
      
      return true;
    } else {
      console.error("❌ FAILED: Tooltip is not properly centered or lacks width constraints");
      return false;
    }
    
  } catch (error) {
    console.error("Error during test:", error);
    return false;
  }
}

testTooltipAlignment();