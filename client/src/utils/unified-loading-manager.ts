/**
 * Simplified Loading Manager Compatibility Layer
 * 
 * This is a compatibility layer for the simplified loading system.
 * It forwards all calls to the new simplified LoadingProvider.
 */

// Simple state to track ID generation
let lastId = 0;

export interface LoadingOptions {
  minimumLoadTime?: number;
  showDelay?: number;
  maximumLoadTime?: number;
  debug?: boolean;
  message?: string;
}

/**
 * Generate a unique ID for tracking loading instances
 */
function generateLoadId(): string {
  return `load-${Date.now()}-${++lastId}`;
}

// Simplified API that forwards to our new system
export function showLoading(_options: LoadingOptions = {}): string {
  try {
    // Try to access our global loading context if available
    const context = (window as any).__SIMPLIFIED_LOADING_CONTEXT__;
    if (context && context.showLoading) {
      context.showLoading();
    }
  } catch (e) {
    console.warn('Simplified loading context not available');
  }
  
  return generateLoadId();
}

/**
 * Hide a specific loading instance
 * @param _loadId The ID of the loading instance to hide (unused in simplified version)
 */
export function hideLoading(_loadId?: string): void {
  try {
    // Try to access our global loading context if available
    const context = (window as any).__SIMPLIFIED_LOADING_CONTEXT__;
    if (context && context.hideLoading) {
      context.hideLoading();
    }
  } catch (e) {
    console.warn('Simplified loading context not available');
  }
}

/**
 * Force hide all loading instances
 * Useful for error recovery or reset
 */
export function forceHideAllLoading(): void {
  hideLoading('all');
}

/**
 * Clean up function for tests or hot module replacement
 */
export function cleanupLoadingSystem(): void {
  // Nothing to clean up in simplified version
}

// Legacy compatibility API for backward compatibility
export const showGlobalLoading = (options: LoadingOptions = {}): string => showLoading(options);
export const hideGlobalLoading = (): void => hideLoading('all');

// Default export for more semantic imports
export default {
  showLoading,
  hideLoading,
  forceHideAllLoading,
  cleanupLoadingSystem
};