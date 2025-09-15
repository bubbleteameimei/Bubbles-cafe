import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

interface RefreshControllerOptions {
  onBeforeRefresh?: () => Promise<void> | void;
  onAfterRefresh?: () => Promise<void> | void;
  shouldInvalidateQueries?: boolean;
}

/**
 * A hook that provides a controller for refreshing data in the application
 * 
 * @param options Configuration options for the refresh controller
 * @returns An object with refresh functions and status indicators
 */
export function useRefreshController(options: RefreshControllerOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  
  // Function to handle the refresh action
  const refresh = useCallback(async () => {
    if (isRefreshing) return false;
    
    try {
      setIsRefreshing(true);
      
      // Call the before refresh hook if provided
      if (options.onBeforeRefresh) {
        await options.onBeforeRefresh();
      }
      
      // Invalidate queries if enabled
      if (options.shouldInvalidateQueries) {
        await queryClient.invalidateQueries();
      }
      
      // Add a small delay to ensure visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Call the after refresh hook if provided
      if (options.onAfterRefresh) {
        await options.onAfterRefresh();
      }
      
      // Update the last refreshed timestamp
      setLastRefreshed(new Date());
      return true;
    } catch (error) {
      console.error('Error during refresh:', error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, queryClient, options]);
  
  // Function to get a human-readable text of when the last refresh happened
  const getLastRefreshedText = useCallback(() => {
    if (!lastRefreshed) return 'Never refreshed';
    return `Last updated ${formatDistanceToNow(lastRefreshed, { addSuffix: true })}`;
  }, [lastRefreshed]);
  
  return {
    refresh,
    isRefreshing,
    lastRefreshed,
    getLastRefreshedText
  };
}