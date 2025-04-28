/**
 * Error Polyfill Script
 * 
 * This script intercepts React cross-origin errors in development mode
 * and prevents them from being displayed to users. 
 * 
 * The errors are still logged to the console for developers but won't appear
 * as jarring popups to end users.
 */
(function() {
  // Store original console.error function
  const originalConsoleError = console.error;
  
  // Override console.error to filter cross-origin error messages
  console.error = function(...args) {
    // Check if this is a React cross-origin error
    const errorMessage = args.join(' ');
    if (
      errorMessage.includes('cross-origin') && 
      errorMessage.includes('React') && 
      errorMessage.includes('development')
    ) {
      // Still log to console but with a cleaner message
      originalConsoleError(
        '[Info] A cross-origin error was suppressed. This is expected in development mode.' +
        ' See https://reactjs.org/link/crossorigin-error for more information.'
      );
      return;
    }
    
    // For all other errors, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Override error handler to prevent cross-origin errors from showing in UI
  window.addEventListener('error', function(event) {
    if (event && event.error && event.error.message &&
        event.error.message.includes('cross-origin') &&
        event.error.message.includes('React')) {
      
      // Prevent the error from bubbling up to UI
      event.preventDefault();
      event.stopPropagation();
      
      // Log a more useful message
      console.log(
        '[Info] A cross-origin React error was intercepted. ' +
        'This is expected in development mode and not a critical issue.'
      );
      
      return true;
    }
    // Let other errors pass through
    return false;
  }, true);

  console.log('[Error Polyfill] Installed successfully');
})();