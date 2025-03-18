/**
 * Global Loading Manager
 * 
 * This utility creates and manages a site-wide loading overlay that is completely outside of React's control.
 * It works by directly manipulating the DOM and can be called from anywhere in the application.
 * 
 * The overlay is appended directly to the document body and uses the standardized LoadingScreen styling.
 */

// Store our overlay element reference
let overlayElement: HTMLDivElement | null = null;
let styleElement: HTMLStyleElement | null = null;

// Track if the overlay is currently showing
let isShowingOverlay = false;

// Create the loading overlay if it doesn't exist
function createOverlayIfNeeded() {
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Skip if already created
  if (overlayElement) return;

  try {
    // Create the style element first
    styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes blur {
        0%, 90%, 100% {
          filter: blur(0);
          opacity: 1;
        }
        
        50% {
          filter: blur(5px);
          opacity: 0.6;
        }
      }
      
      .global-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2147483647; /* Maximum z-index value */
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none; /* Allow interaction with elements beneath */
        isolation: isolate;
      }
      
      .global-loading-overlay.visible {
        opacity: 1;
        pointer-events: auto; /* Block interactions only when visible */
      }
      
      .loader {
        display: flex;
        gap: 0.5rem;
      }

      .loader span {
        font-size: 22px;
        font-family: 'Space Mono', monospace;
        font-weight: 600;
        animation: blur 2s linear infinite;
        line-height: 20px;
        transition: all 0.5s;
        letter-spacing: 0.2em;
        color: white;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      }

      .loader span:nth-child(1) { animation-delay: 0.0s; }
      .loader span:nth-child(2) { animation-delay: 0.2s; }
      .loader span:nth-child(3) { animation-delay: 0.4s; }
      .loader span:nth-child(4) { animation-delay: 0.6s; }
      .loader span:nth-child(5) { animation-delay: 0.8s; }
      .loader span:nth-child(6) { animation-delay: 1.0s; }
      .loader span:nth-child(7) { animation-delay: 1.2s; }
      
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    
    // Only append to the head if it exists
    if (document.head) {
      document.head.appendChild(styleElement);
    }

    // Create the overlay element
    overlayElement = document.createElement('div');
    overlayElement.className = 'global-loading-overlay';
    overlayElement.setAttribute('role', 'alert');
    overlayElement.setAttribute('aria-live', 'assertive');
    overlayElement.setAttribute('data-overlay-id', 'global-loading-overlay');
    
    // Create the loader with the same animation as LoadingScreen
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    // Create letters L-O-A-D-I-N-G
    const letters = ['L', 'O', 'A', 'D', 'I', 'N', 'G'];
    letters.forEach(letter => {
      const span = document.createElement('span');
      span.textContent = letter;
      loader.appendChild(span);
    });
    
    overlayElement.appendChild(loader);
    
    // Create the accessibility message (screen reader only)
    const srElement = document.createElement('div');
    srElement.className = 'sr-only';
    srElement.setAttribute('role', 'status');
    srElement.setAttribute('aria-live', 'polite');
    srElement.textContent = 'Loading content, please wait...';
    overlayElement.appendChild(srElement);
    
    // Add the overlay to the body only if document.body exists
    if (document.body) {
      document.body.appendChild(overlayElement);
    }
  } catch (error) {
    console.error('Failed to create loading overlay:', error);
  }
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
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Force hide even if isShowingOverlay is false to ensure cleanup
  try {
    // Start fade out if element exists
    if (overlayElement) {
      overlayElement.classList.remove('visible');
      
      // Wait for transition to complete
      setTimeout(() => {
        if (overlayElement) {
          overlayElement.style.display = 'none';
        }
        
        // Restore body scroll if document.body exists
        if (document.body) {
          document.body.style.overflow = '';
          document.body.style.touchAction = '';
        }
        
        if (document.documentElement) {
          document.documentElement.style.isolation = '';
        }
      }, 300);
    }
    
    // Always reset the state
    isShowingOverlay = false;
  } catch (error) {
    console.error('Failed to hide loading overlay:', error);
    isShowingOverlay = false;
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
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  try {
    if (overlayElement && document.body && document.body.contains && document.body.contains(overlayElement)) {
      document.body.removeChild(overlayElement);
      overlayElement = null;
    }
    
    if (styleElement && document.head && document.head.contains && document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
      styleElement = null;
    }
  } catch (error) {
    console.error('Failed to cleanup loading overlay:', error);
  } finally {
    isShowingOverlay = false;
  }
}