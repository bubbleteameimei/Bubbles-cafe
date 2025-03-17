/**
 * Global Loading Manager
 * 
 * This utility creates and manages a site-wide loading overlay that is completely outside of React's control.
 * It works by directly manipulating the DOM and can be called from anywhere in the application.
 * 
 * The overlay is appended directly to the document body and uses the highest possible z-index.
 */

// Store our overlay element reference
let overlayElement: HTMLDivElement | null = null;
let styleElement: HTMLStyleElement | null = null;

// Track if the overlay is currently showing
let isShowingOverlay = false;

// Create the loading overlay if it doesn't exist
function createOverlayIfNeeded() {
  if (overlayElement) return;

  // Create the style element first
  styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    
    .global-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: var(--background, #fff);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2147483647; /* Maximum z-index value */
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: all;
      isolation: isolate;
    }
    
    .global-loading-overlay.visible {
      opacity: 1;
    }
    
    .global-loading-spinner {
      width: 60px;
      height: 60px;
      position: relative;
    }
    
    .global-loading-spinner::before {
      content: "";
      box-sizing: border-box;
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid var(--primary, #000);
      border-top-color: transparent;
      animation: spin 1s linear infinite;
    }
    
    .global-loading-spinner::after {
      content: "";
      box-sizing: border-box;
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid var(--primary, #000);
      opacity: 0.2;
    }
    
    .global-loading-text {
      margin-top: 20px;
      font-size: 16px;
      font-weight: 500;
      color: var(--foreground, #000);
      animation: pulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(styleElement);

  // Create the overlay element
  overlayElement = document.createElement('div');
  overlayElement.className = 'global-loading-overlay';
  overlayElement.setAttribute('role', 'alert');
  overlayElement.setAttribute('aria-live', 'assertive');
  overlayElement.setAttribute('data-overlay-id', 'global-loading-overlay');
  
  // Create the spinner
  const spinner = document.createElement('div');
  spinner.className = 'global-loading-spinner';
  overlayElement.appendChild(spinner);
  
  // Create the text
  const text = document.createElement('div');
  text.className = 'global-loading-text';
  text.textContent = 'Loading...';
  overlayElement.appendChild(text);
  
  // Add the overlay to the body
  document.body.appendChild(overlayElement);
}

/**
 * Show the global loading overlay
 */
export function showGlobalLoading() {
  // Ensure we have the overlay
  createOverlayIfNeeded();
  
  if (!isShowingOverlay && overlayElement) {
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    // Force the browser to create a new stacking context
    document.documentElement.style.isolation = 'isolate';
    
    // Show the overlay
    overlayElement.style.display = 'flex';
    // Use setTimeout to ensure transition happens
    setTimeout(() => {
      overlayElement?.classList.add('visible');
    }, 10);
    
    isShowingOverlay = true;
  }
}

/**
 * Hide the global loading overlay
 */
export function hideGlobalLoading() {
  if (isShowingOverlay && overlayElement) {
    // Start fade out
    overlayElement.classList.remove('visible');
    
    // Wait for transition to complete
    setTimeout(() => {
      if (overlayElement) {
        overlayElement.style.display = 'none';
      }
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.documentElement.style.isolation = '';
      
      isShowingOverlay = false;
    }, 300);
  }
}

// Initialize the overlay as soon as this module is imported
if (typeof window !== 'undefined') {
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createOverlayIfNeeded);
  } else {
    createOverlayIfNeeded();
  }
}

// Clean up function for tests or hot module replacement
export function cleanupGlobalLoading() {
  if (overlayElement && document.body.contains(overlayElement)) {
    document.body.removeChild(overlayElement);
    overlayElement = null;
  }
  
  if (styleElement && document.head.contains(styleElement)) {
    document.head.removeChild(styleElement);
    styleElement = null;
  }
  
  isShowingOverlay = false;
}