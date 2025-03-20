import { useContext } from 'react';
import { LoadingContext } from '../contexts/loading-context';

/**
 * Custom hook to access and control the global loading state
 * 
 * @returns {Object} loading state and functions to control it
 * @example
 * const { isLoading, showLoading, hideLoading } = useLoading();
 * 
 * // Show the loading screen
 * showLoading();
 * 
 * // Hide the loading screen when operation completes
 * hideLoading();
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  
  return context;
}