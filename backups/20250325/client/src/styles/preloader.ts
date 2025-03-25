/**
 * Style Preloader - Prevents Flash of Unstyled Content (FOUC)
 * 
 * This module ensures that the main content is only displayed after all styles
 * are properly loaded, showing a loading screen in the meantime.
 */

// Track whether styles have been loaded
let stylesLoaded = false;
let initialLoadingOverlay: HTMLDivElement | null = null;

/**
 * Mark styles as loaded and remove loading overlay
 */
function markStylesLoaded() {
  console.log('[Preloader] Styles loaded, removing loading overlay');
  stylesLoaded = true;
  
  // Find and fade out the loading overlay
  if (initialLoadingOverlay) {
    initialLoadingOverlay.classList.add('fade-out');
    
    // Remove the overlay after fade-out animation completes
    setTimeout(() => {
      initialLoadingOverlay?.classList.add('hidden');
      setTimeout(() => {
        initialLoadingOverlay?.remove();
        initialLoadingOverlay = null;
      }, 100);
    }, 500);
  }
  
  // Make all content visible
  document.body.classList.add('content-visible');
  document.body.classList.remove('content-hidden');
}

/**
 * Setup style preloader and monitors
 */
export function setupStylePreloader() {
  console.log('[Preloader] Setting up style preloader');
  
  // Hide content initially to prevent FOUC
  document.body.classList.add('content-hidden');
  
  // Function to check if all stylesheets are loaded
  const checkStylesheetsLoaded = () => {
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    if (stylesheets.length === 0) {
      // If no external stylesheets, just mark as loaded
      markStylesLoaded();
      return;
    }
    
    // Count loaded stylesheets
    const loadedStylesheets = stylesheets.filter(stylesheet => {
      const styleSheet = (stylesheet as any).sheet;
      return styleSheet && !styleSheet.disabled;
    });
    
    console.log(`[Preloader] Stylesheets loaded: ${loadedStylesheets.length}/${stylesheets.length}`);
    
    if (loadedStylesheets.length === stylesheets.length) {
      markStylesLoaded();
    }
  };
  
  // Check stylesheet loading status
  checkStylesheetsLoaded();
  
  // Set a timeout to ensure loading screen doesn't hang indefinitely
  setTimeout(() => {
    if (!stylesLoaded) {
      console.warn('[Preloader] Timeout: forcing styles as loaded');
      markStylesLoaded();
    }
  }, 3000);
  
  // Add load event listeners to stylesheets
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach(stylesheet => {
    stylesheet.addEventListener('load', () => {
      checkStylesheetsLoaded();
    });
    
    stylesheet.addEventListener('error', () => {
      console.error(`[Preloader] Failed to load stylesheet: ${stylesheet.getAttribute('href')}`);
      // Continue anyway to prevent hanging
      checkStylesheetsLoaded();
    });
  });
  
  // Fallback for DOM contentLoaded
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(checkStylesheetsLoaded, 100);
  } else {
    document.addEventListener('DOMContentLoaded', checkStylesheetsLoaded);
  }
  
  // Final fallback to window load
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!stylesLoaded) {
        console.warn('[Preloader] Window load: forcing styles as loaded');
        markStylesLoaded();
      }
    }, 200);
  });
}

/**
 * Adds the initial loading indicator to the page
 */
export function addInitialLoadingIndicator() {
  // Don't add if it already exists
  if (document.querySelector('.initial-loading-overlay')) {
    return;
  }
  
  console.log('[Preloader] Adding initial loading indicator');
  
  // Create loading overlay
  initialLoadingOverlay = document.createElement('div');
  initialLoadingOverlay.className = 'initial-loading-overlay';
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  // Create loading text
  const loadingText = document.createElement('div');
  loadingText.className = 'loading-text';
  loadingText.textContent = 'Loading';
  
  // Add elements to overlay
  initialLoadingOverlay.appendChild(spinner);
  initialLoadingOverlay.appendChild(loadingText);
  
  // Add overlay to body
  document.body.appendChild(initialLoadingOverlay);
}