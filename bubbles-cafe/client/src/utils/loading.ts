/**
 * Empty loading utility
 * This is a compatibility layer that does absolutely nothing
 */

// No-op functions that do absolutely nothing
export function showLoading(): void {}
export function hideLoading(): void {}

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