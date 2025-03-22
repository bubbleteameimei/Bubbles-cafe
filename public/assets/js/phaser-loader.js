// Phaser Loader Script
// This script ensures Phaser is loaded before the React application
(function() {
  console.log('Phaser preloader script running...');
  
  // Function to load Phaser
  function loadPhaser() {
    return new Promise((resolve, reject) => {
      // Check if Phaser is already loaded
      if (window.Phaser) {
        console.log('Phaser is already available in the window object');
        resolve(window.Phaser);
        return;
      }
      
      console.log('Loading Phaser from local assets...');
      
      // Create script element
      const script = document.createElement('script');
      script.src = '/assets/js/phaser.min.js';
      script.async = true;
      
      // Set up event handlers
      script.onload = function() {
        console.log('Phaser loaded successfully:', window.Phaser?.VERSION);
        resolve(window.Phaser);
      };
      
      script.onerror = function(e) {
        console.error('Error loading Phaser:', e);
        reject(new Error('Failed to load Phaser library'));
      };
      
      // Add script to document
      document.head.appendChild(script);
    });
  }
  
  // Store the loading promise in a global variable
  window.PHASER_LOADING_PROMISE = loadPhaser();
  
  // Set a flag to indicate the loader script has run
  window.PHASER_LOADER_EXECUTED = true;
})();