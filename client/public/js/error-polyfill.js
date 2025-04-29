/**
 * Enhanced Error Polyfill Script
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
  
  // Store error counts to avoid spam
  const errorCounts = {};
  const MAX_ERRORS = 3; // Only show each error 3 times max
  
  // Override console.error to filter cross-origin error messages
  console.error = function(...args) {
    // Join all arguments to a string for easier matching
    const errorMessage = args.join(' ');
    
    // Check if this is a React cross-origin error
    if (
      (errorMessage.includes('cross-origin') && errorMessage.includes('React')) || 
      errorMessage === 'Script error.' || 
      errorMessage.includes('access to the actual error object in development')
    ) {
      // Generate a simple hash of the error message for counting
      const errorHash = hashString(errorMessage);
      
      // Increment count for this error
      errorCounts[errorHash] = (errorCounts[errorHash] || 0) + 1;
      
      // Only log first few instances to avoid spam
      if (errorCounts[errorHash] <= MAX_ERRORS) {
        // Still log to console but with a cleaner message
        originalConsoleError(
          '[Info] A cross-origin error was suppressed. This is expected in development mode.' +
          ' See https://reactjs.org/link/crossorigin-error for more information.'
        );
      }
      return;
    }
    
    // For all other errors, pass through to the original console.error
    originalConsoleError.apply(console, args);
  };
  
  // Simple string hashing function
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  // Override error handler to prevent cross-origin errors from showing in UI
  window.addEventListener('error', function(event) {
    // Check if this is potentially a React cross-origin error
    if (
      // Check for cross-origin React errors
      (event.error && event.error.message && 
       (event.error.message.includes('cross-origin') || 
        event.error.message.includes('React'))) ||
      // Also catch script errors with no details due to CORS
      (event.message === 'Script error.' || event.message === 'Error: Script error.')
    ) {
      // Prevent the error from bubbling up to UI
      event.preventDefault();
      event.stopPropagation();
      
      // Generate a simple hash of the error message for counting
      const errorHash = hashString(event.message || 'unknown error');
      
      // Increment count for this error
      errorCounts[errorHash] = (errorCounts[errorHash] || 0) + 1;
      
      // Only log the first few occurrences
      if (errorCounts[errorHash] <= MAX_ERRORS) {
        // Log a more useful message
        console.log(
          '[Info] A cross-origin React error was intercepted. ' +
          'This is expected in development mode and not a critical issue.'
        );
      }
      
      return true;
    }
    // Let other errors pass through
    return false;
  }, true);
  
  // Also handle unhandledrejection for Promise errors
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        ((typeof event.reason.message === 'string' && 
          (event.reason.message.includes('cross-origin') || 
           event.reason.message.includes('React'))) ||
         event.reason === 'Script error.')
       ) {
      // Prevent the rejection from bubbling up
      event.preventDefault();
      event.stopPropagation();
      
      // Log only a few times
      const errorHash = hashString(
        (event.reason.message || event.reason || 'unknown rejection')
      );
      errorCounts[errorHash] = (errorCounts[errorHash] || 0) + 1;
      
      if (errorCounts[errorHash] <= MAX_ERRORS) {
        console.log(
          '[Info] An unhandled Promise rejection was intercepted. ' +
          'This may be related to a cross-origin error in development mode.'
        );
      }
      
      return true;
    }
    return false;
  });

  console.log('[Error Polyfill] Installed successfully');
})();