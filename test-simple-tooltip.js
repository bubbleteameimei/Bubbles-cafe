/**
 * Simple Tooltip Alignment Test
 * 
 * This is a simplified version of the tooltip test that can be run
 * directly in the browser console to check alignment.
 */

function checkTooltipAlignment() {
  console.log("Starting tooltip alignment check...");
  
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
  
  // Add visual indicator for debugging
  function addVisualIndicator() {
    // Add a centered vertical line
    const centerLine = document.createElement('div');
    centerLine.style.position = 'fixed';
    centerLine.style.top = '0';
    centerLine.style.bottom = '0';
    centerLine.style.left = '50%';
    centerLine.style.width = '1px';
    centerLine.style.backgroundColor = 'lime';
    centerLine.style.zIndex = '9999';
    document.body.appendChild(centerLine);
    
    // Highlight tooltip container
    if (tooltipContainer) {
      tooltipContainer.style.outline = '2px solid red';
      tooltipContainer.style.outlineOffset = '2px';
    }
    
    // Highlight story container
    if (storyContainer) {
      storyContainer.style.outline = '2px solid blue';
      storyContainer.style.outlineOffset = '2px';
    }
    
    console.log("Added visual indicators for alignment check");
  }
  
  // Final verification
  console.log("\n=== Alignment Test Results ===");
  if (tooltipClasses.includes('max-w-4xl') && tooltipClasses.includes('mx-auto')) {
    console.log("✅ PASSED: Tooltip is properly centered with correct width constraints");
    
    // Add the visual indicators
    addVisualIndicator();
    
    return true;
  } else {
    console.error("❌ FAILED: Tooltip is not properly centered or lacks width constraints");
    return false;
  }
}

// This script can be pasted in the browser console
console.log("To check tooltip alignment, run: checkTooltipAlignment()");