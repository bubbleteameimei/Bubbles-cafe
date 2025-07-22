// This script would be used in a browser environment to demonstrate the font size controls feature

// 1. User visits the reader page
console.log("User navigates to /reader");

// 2. User finds the font size controls in the top right corner
console.log("Font size controls are visible in the top right corner");

// 3. User clicks the plus button to increase font size
console.log("User clicks + button to increase font size");

// 4. A toast notification appears with message "Font Size Changed" and "Text size set to XYpx"  
console.log("Toast notification appears: 'Font Size Changed - Text size set to 17px'");
console.log("Toast notification disappears after 1.5 seconds");

// 5. User clicks the plus button multiple times until reaching maximum
console.log("User clicks + button multiple times");

// 6. When maximum font size is reached, a special toast appears
console.log("Toast notification appears: 'Maximum Size Reached - Font size is now at maximum (24px)'");
console.log("Toast notification disappears after 2 seconds");

// 7. User clicks the minus button to decrease font size
console.log("User clicks - button to decrease font size");

// 8. A toast notification appears with the updated font size
console.log("Toast notification appears: 'Font Size Changed - Text size set to 23px'");
console.log("Toast notification disappears after 1.5 seconds");

// 9. User clicks the minus button multiple times until reaching minimum
console.log("User clicks - button multiple times");

// 10. When minimum font size is reached, a special toast appears
console.log("Toast notification appears: 'Minimum Size Reached - Font size is now at minimum (12px)'");
console.log("Toast notification disappears after 2 seconds");
