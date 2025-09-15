/**
 * Reader Page Inspector Tool
 * 
 * This script adds visual helpers to the reader page to verify padding
 * is being applied correctly.
 * 
 * Usage:
 * 1. Open browser console on the reader page
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute
 */

// This function adds visual indicators and displays computed styles
function inspectReaderPadding() {
  console.log('🔍 Reader Page Inspector running...');
  
  // Find the reader container
  const readerContainer = document.querySelector('.reader-container.story-content');
  
  if (!readerContainer) {
    console.error('❌ Could not find reader container element');
    return;
  }
  
  // Get computed styles
  const styles = window.getComputedStyle(readerContainer);
  
  // Log the computed padding values
  console.log('📏 Reader container padding:', {
    paddingLeft: styles.paddingLeft,
    paddingRight: styles.paddingRight,
    width: styles.width,
    maxWidth: styles.maxWidth,
    boxSizing: styles.boxSizing
  });
  
  // Add visual indicators
  // Create a border
  readerContainer.style.border = '2px dashed red';
  
  // Add left and right markers
  const leftMarker = document.createElement('div');
  leftMarker.style.position = 'fixed';
  leftMarker.style.left = '0';
  leftMarker.style.top = '50%';
  leftMarker.style.width = '10px';
  leftMarker.style.height = '100px';
  leftMarker.style.backgroundColor = 'blue';
  leftMarker.style.zIndex = '1000';
  
  const rightMarker = document.createElement('div');
  rightMarker.style.position = 'fixed';
  rightMarker.style.right = '0';
  rightMarker.style.top = '50%';
  rightMarker.style.width = '10px';
  rightMarker.style.height = '100px';
  rightMarker.style.backgroundColor = 'blue';
  rightMarker.style.zIndex = '1000';
  
  // Add content edge markers (showing where padding ends)
  const contentLeftMarker = document.createElement('div');
  contentLeftMarker.style.position = 'absolute';
  contentLeftMarker.style.left = '0';
  contentLeftMarker.style.top = '0';
  contentLeftMarker.style.width = '5px';
  contentLeftMarker.style.height = '100%';
  contentLeftMarker.style.backgroundColor = 'green';
  contentLeftMarker.style.opacity = '0.5';
  contentLeftMarker.style.zIndex = '999';
  
  const contentRightMarker = document.createElement('div');
  contentRightMarker.style.position = 'absolute';
  contentRightMarker.style.right = '0';
  contentRightMarker.style.top = '0';
  contentRightMarker.style.width = '5px';
  contentRightMarker.style.height = '100%';
  contentRightMarker.style.backgroundColor = 'green';
  contentRightMarker.style.opacity = '0.5';
  contentRightMarker.style.zIndex = '999';
  
  // Add markers to the DOM
  document.body.appendChild(leftMarker);
  document.body.appendChild(rightMarker);
  readerContainer.appendChild(contentLeftMarker);
  readerContainer.appendChild(contentRightMarker);
  
  // Highlight first paragraph
  const firstParagraph = readerContainer.querySelector('p');
  if (firstParagraph) {
    firstParagraph.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
    firstParagraph.style.border = '1px solid orange';
    
    // Log paragraph styles too
    const pStyles = window.getComputedStyle(firstParagraph);
    console.log('📏 First paragraph dimensions:', {
      width: pStyles.width,
      paddingLeft: pStyles.paddingLeft,
      paddingRight: pStyles.paddingRight,
      marginLeft: pStyles.marginLeft,
      marginRight: pStyles.marginRight
    });
  }
  
  // Create a floating status indicator
  const statusBox = document.createElement('div');
  statusBox.style.position = 'fixed';
  statusBox.style.top = '10px';
  statusBox.style.right = '10px';
  statusBox.style.padding = '10px';
  statusBox.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  statusBox.style.color = 'white';
  statusBox.style.fontFamily = 'monospace';
  statusBox.style.fontSize = '12px';
  statusBox.style.zIndex = '1001';
  statusBox.style.borderRadius = '4px';
  
  statusBox.innerHTML = `
    <div>Reader Inspector Active</div>
    <div>Padding: L=${styles.paddingLeft}, R=${styles.paddingRight}</div>
    <div>Width: ${styles.width}</div>
    <div>Box-sizing: ${styles.boxSizing}</div>
    <div>Expected: 5rem on desktop</div>
  `;
  
  document.body.appendChild(statusBox);
  
  console.log('✅ Inspector visuals added to page');
}

// Run the inspector
inspectReaderPadding();