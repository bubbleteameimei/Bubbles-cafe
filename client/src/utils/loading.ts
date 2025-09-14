
/**
 * Loading utility - simplified
 * All loading is now handled by the main LoadingScreen component
 */

// No-op functions for backward compatibility
export function showLoading(): void {
  console.log("Loading functionality moved to LoadingScreen component");
}

export function hideLoading(): void {
  console.log("Loading functionality moved to LoadingScreen component");
}

// Legacy compatibility exports - all no-ops
export const showGlobalLoading = showLoading;
export const hideGlobalLoading = hideLoading;
export const forceHideAllLoading = hideLoading;

export default {
  showLoading,
  hideLoading,
  showGlobalLoading,
  hideGlobalLoading,
  forceHideAllLoading
};
