/**
 * Unified Loading Manager
 * 
 * This unified loading system combines the strengths of both ApiLoader and GlobalLoadingManager
 * in a single, consistent system that can be used across the entire application.
 * 
 * It provides:
 * 1. Component-level loading via React components
 * 2. Imperative global loading via direct function calls
 * 3. Consistent styling and animation
 * 4. Configurable timing options
 * 5. Proper cleanup and resource management
 */

// Singleton instance tracking
let overlayElement: HTMLDivElement | null = null;
let styleElement: HTMLStyleElement | null = null;
let isShowingOverlay = false;
let instances = 0;
let currentTimers: Record<string, NodeJS.Timeout> = {};

// Configuration defaults
const DEFAULT_CONFIG = {
  minimumLoadTime: 500,
  showDelay: 300,
  maximumLoadTime: 5000,
  debug: false
};

// Loading state and timing tracking
interface LoadingState {
  startTime: number | null;
  loadId: string;
  options: LoadingOptions;
}

// Loading options interface
export interface LoadingOptions {
  minimumLoadTime?: number;
  showDelay?: number;
  maximumLoadTime?: number;
  debug?: boolean;
  message?: string;
}

// Track loading states by ID to handle multiple loaders
const loadingStates: Record<string, LoadingState> = {};

/**
 * Create the loading overlay if it doesn't already exist
 */
function createOverlayIfNeeded() {
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Skip if already created
  if (overlayElement) return;

  try {
    // Create the style element first with the exact original styling
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
      
      .unified-loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        isolation: isolate;
        background-color: #000000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 2147483647; /* Maximum z-index value */
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none; /* Allow interaction with elements beneath */
      }
      
      .unified-loading-overlay.visible {
        opacity: 1;
        pointer-events: auto; /* Block interactions when visible */
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
    
    // Append to head if it exists
    if (document.head) {
      document.head.appendChild(styleElement);
    }

    // Create the overlay element
    overlayElement = document.createElement('div');
    overlayElement.className = 'unified-loading-overlay';
    overlayElement.setAttribute('role', 'alert');
    overlayElement.setAttribute('aria-live', 'assertive');
    overlayElement.setAttribute('data-overlay-id', 'unified-loading-overlay');
    
    // Create the loader with the exact original animation
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
    
    // Add the overlay to the body
    if (document.body) {
      document.body.appendChild(overlayElement);
    }
  } catch (error) {
    console.error('[UnifiedLoading] Failed to create loading overlay:', error);
  }
}

/**
 * Show the loading overlay
 */
function showOverlay() {
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
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
    setTimeout(() => {
      if (overlayElement) {
        overlayElement.classList.add('visible');
      }
    }, 10);
    
    isShowingOverlay = true;
  }
}

/**
 * Hide the loading overlay
 */
function hideOverlay() {
  // Safety check for SSR/server environments
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Only hide if all instances are done
  if (instances <= 0) {
    try {
      if (overlayElement) {
        overlayElement.classList.remove('visible');
        
        // Wait for transition to complete
        setTimeout(() => {
          if (overlayElement) {
            overlayElement.style.display = 'none';
          }
          
          // Restore body scroll
          if (document.body) {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
          }
          
          if (document.documentElement) {
            document.documentElement.style.isolation = '';
          }
        }, 300);
      }
      
      isShowingOverlay = false;
    } catch (error) {
      console.error('[UnifiedLoading] Failed to hide loading overlay:', error);
      isShowingOverlay = false;
    }
  }
}

/**
 * Generate a unique ID for tracking loading instances
 */
function generateLoadId(): string {
  return `load-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Show loading with configurable options
 * @param options Loading configuration options
 * @returns A load ID that can be used to hide this specific loader
 */
export function showLoading(options: LoadingOptions = {}): string {
  const loadId = generateLoadId();
  const mergedOptions = { ...DEFAULT_CONFIG, ...options };
  
  instances++;
  
  if (mergedOptions.debug) {
    console.log(`[UnifiedLoading] Starting load ${loadId}, instances: ${instances}`);
  }
  
  // Store the loading state
  loadingStates[loadId] = {
    startTime: null,
    loadId,
    options: mergedOptions
  };
  
  // Start loading timer
  loadingStates[loadId].startTime = Date.now();
  
  // Add delay before showing loader to prevent flashing
  if (mergedOptions.showDelay && mergedOptions.showDelay > 0) {
    currentTimers[`show-${loadId}`] = setTimeout(() => {
      showOverlay();
      delete currentTimers[`show-${loadId}`];
    }, mergedOptions.showDelay);
  } else {
    showOverlay();
  }
  
  // Set maximum load time to prevent infinite loading
  if (mergedOptions.maximumLoadTime && mergedOptions.maximumLoadTime > 0) {
    currentTimers[`max-${loadId}`] = setTimeout(() => {
      if (mergedOptions.debug) {
        console.log(`[UnifiedLoading] Maximum load time reached for ${loadId}, forcing cleanup`);
      }
      
      hideLoading(loadId);
      delete currentTimers[`max-${loadId}`];
    }, mergedOptions.maximumLoadTime);
  }
  
  return loadId;
}

/**
 * Hide a specific loading instance, respecting the minimum load time
 * @param loadId The load ID to hide, or undefined to hide the most recent loader
 */
export function hideLoading(loadId?: string): void {
  // If no specific load ID was provided, use the most recent one (rare edge case)
  if (!loadId) {
    const loadIds = Object.keys(loadingStates);
    if (loadIds.length === 0) return;
    loadId = loadIds[loadIds.length - 1];
  }
  
  // If this loading state doesn't exist, just return
  if (!loadingStates[loadId]) return;
  
  const { startTime, options } = loadingStates[loadId];
  
  // Calculate elapsed time to ensure minimum display duration
  const timeElapsed = startTime ? Date.now() - startTime : 0;
  const minimumLoadTime = options.minimumLoadTime || DEFAULT_CONFIG.minimumLoadTime;
  const remainingTime = Math.max(0, minimumLoadTime - timeElapsed);
  
  // Clear any existing timers for this load ID
  if (currentTimers[`show-${loadId}`]) {
    clearTimeout(currentTimers[`show-${loadId}`]);
    delete currentTimers[`show-${loadId}`];
  }
  
  if (currentTimers[`max-${loadId}`]) {
    clearTimeout(currentTimers[`max-${loadId}`]);
    delete currentTimers[`max-${loadId}`];
  }
  
  if (currentTimers[`hide-${loadId}`]) {
    clearTimeout(currentTimers[`hide-${loadId}`]);
    delete currentTimers[`hide-${loadId}`];
  }
  
  // Only delay hiding if we need to meet minimum time
  if (remainingTime > 0) {
    currentTimers[`hide-${loadId}`] = setTimeout(() => {
      finalizeHide(loadId);
      delete currentTimers[`hide-${loadId}`];
    }, remainingTime);
  } else {
    // Hide immediately
    finalizeHide(loadId);
  }
}

/**
 * Finalize the hiding process for a specific load ID
 */
function finalizeHide(loadId: string): void {
  if (!loadingStates[loadId]) return;
  
  const { options } = loadingStates[loadId];
  
  if (options.debug) {
    console.log(`[UnifiedLoading] Hiding load ${loadId}, instances before: ${instances}`);
  }
  
  // Clean up this loading state
  delete loadingStates[loadId];
  
  // Decrement the instance counter
  instances = Math.max(0, instances - 1);
  
  if (options.debug) {
    console.log(`[UnifiedLoading] Instances after hiding: ${instances}`);
  }
  
  // Only hide the overlay if all instances are done
  if (instances === 0) {
    hideOverlay();
  }
}

/**
 * Immediately hide all loading screens and reset state
 * This is useful for error recovery and development
 */
export function forceHideAllLoading(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  // Clear all timers
  Object.values(currentTimers).forEach(timer => clearTimeout(timer));
  currentTimers = {};
  
  // Reset all state
  Object.keys(loadingStates).forEach(loadId => delete loadingStates[loadId]);
  instances = 0;
  
  // Hide the overlay
  hideOverlay();
  
  // Make sure document state is reset
  if (document.body) {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }
  
  if (document.documentElement) {
    document.documentElement.style.isolation = '';
  }
  
  console.log('[UnifiedLoading] Force-hid all loading screens and reset state');
}

/**
 * Clean up function for tests or hot module replacement
 */
export function cleanupLoadingSystem(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  
  forceHideAllLoading();
  
  try {
    if (overlayElement && document.body && document.body.contains(overlayElement)) {
      document.body.removeChild(overlayElement);
      overlayElement = null;
    }
    
    if (styleElement && document.head && document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
      styleElement = null;
    }
  } catch (error) {
    console.error('[UnifiedLoading] Failed to cleanup loading system:', error);
  }
}

// Legacy compatibility API for backward compatibility
// These make the transition easier by supporting both old and new API calls
export const showGlobalLoading = (options: LoadingOptions = {}): string => showLoading(options);
export const hideGlobalLoading = (): void => {
  const loadIds = Object.keys(loadingStates);
  loadIds.forEach(id => hideLoading(id));
};

// Initialize the overlay as soon as this module is imported
if (typeof window !== 'undefined') {
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createOverlayIfNeeded);
  } else {
    createOverlayIfNeeded();
  }
}

// Default export for more semantic imports
export default {
  showLoading,
  hideLoading,
  forceHideAllLoading,
  cleanupLoadingSystem
};