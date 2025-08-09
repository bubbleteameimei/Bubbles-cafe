/**
 * Style Preloader - Prevents Flash of Unstyled Content (FOUC)
 * 
 * This module ensures that the main content is only displayed after all styles
 * are properly loaded, showing a loading screen in the meantime.
 */

// Track whether styles have been loaded
let stylesLoaded = false;
let initialLoadingOverlay: HTMLDivElement | null = null;

// Night mode functionality has been completely removed

/**
 * Mark styles as loaded and remove loading overlay
 */
function markStylesLoaded() {
  
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
        
        // Night mode has been removed
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
  
  
  // Night mode functionality has been removed
  
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
    
    
    
    if (loadedStylesheets.length === stylesheets.length) {
      markStylesLoaded();
    }
  };
  
  // Check stylesheet loading status
  checkStylesheetsLoaded();
  
  // Set a shorter timeout to prevent hanging during page transitions
  setTimeout(() => {
    if (!stylesLoaded) {
      console.warn('[Preloader] Timeout: forcing styles as loaded');
      markStylesLoaded();
    }
  }, 1500); // Reduced from 3000ms to 1500ms
  
  // Add load event listeners to stylesheets
  const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach(stylesheet => {
    stylesheet.addEventListener('load', () => {
      checkStylesheetsLoaded();
    });
    
    stylesheet.addEventListener('error', () => {
      
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
  
  
  
  // Create loading overlay
  initialLoadingOverlay = document.createElement('div');
  initialLoadingOverlay.className = 'initial-loading-overlay';
  
  // Create your beautiful LOADING animation
  const loadingText = document.createElement('div');
  loadingText.className = 'loading-text';
  loadingText.innerHTML = `
    <span>L</span>
    <span>O</span>
    <span>A</span>
    <span>D</span>
    <span>I</span>
    <span>N</span>
    <span>G</span>
  `;
  
  // Create fallback spinner (shows until Megrim font loads)
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  
  // Add both to overlay
  initialLoadingOverlay.appendChild(spinner);
  initialLoadingOverlay.appendChild(loadingText);
  
  // Hide spinner once font loads
  document.fonts.ready.then(() => {
    spinner.style.display = 'none';
  }).catch(() => {
    // If font loading fails, still hide spinner after delay
    setTimeout(() => {
      spinner.style.display = 'none';
    }, 1000);
  });
  
  // Add overlay to body
  document.body.appendChild(initialLoadingOverlay);
}