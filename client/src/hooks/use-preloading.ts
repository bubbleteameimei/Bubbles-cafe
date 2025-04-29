/**
 * usePreloading Hook
 * 
 * This hook provides easy access to the preload manager functionality within components.
 * It allows components to trigger asset preloading and track loading state.
 */

import { useState, useEffect, useCallback } from 'react';
import preloadManager from '@/lib/preloadManager';

/**
 * Hook for preloading assets within components
 */
export function usePreloading() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * Preload a specific route's assets
   */
  const preloadRoute = useCallback(async (route: string, additionalAssets: string[] = []) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await preloadManager.preloadRoute(route, additionalAssets);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[usePreloading] Error preloading route assets:', err);
    }
  }, []);
  
  /**
   * Preload specific assets
   */
  const preloadAssets = useCallback(async (assets: string[]) => {
    if (!assets.length) return;
    
    setIsLoading(true);
    setError(null);
    setTotalCount(assets.length);
    setLoadedCount(0);
    
    try {
      const preloadPromises = assets.map((asset, index) => 
        preloadManager.preload(asset, {
          onLoad: () => setLoadedCount(prev => prev + 1),
        })
      );
      
      await Promise.all(preloadPromises);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[usePreloading] Error preloading assets:', err);
    }
  }, []);
  
  /**
   * Preload a specific image
   */
  const preloadImage = useCallback(async (imageUrl: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await preloadManager.preloadImage(imageUrl);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[usePreloading] Error preloading image:', err);
    }
  }, []);
  
  /**
   * Preload API data 
   */
  const preloadApiData = useCallback(async <T>(endpoint: string, options: RequestInit = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await preloadManager.preloadApiData<T>(endpoint, options);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[usePreloading] Error preloading API data:', err);
      throw err;
    }
  }, []);
  
  /**
   * Clear preloaded resources tracking
   */
  const clearPreloadedResources = useCallback(() => {
    preloadManager.clearPreloadedResources();
    setLoadedCount(0);
    setTotalCount(0);
  }, []);
  
  // Update loaded count on mount/unmount
  useEffect(() => {
    const updateStats = () => {
      setLoadedCount(preloadManager.getPreloadedCount());
    };
    
    updateStats();
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return {
    isLoading,
    loadedCount,
    totalCount,
    progress: totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0,
    error,
    preloadRoute,
    preloadAssets,
    preloadImage,
    preloadApiData,
    clearPreloadedResources,
  };
}

/**
 * Check if a URL is already preloaded
 */
export function isPreloaded(url: string): boolean {
  return preloadManager.isPreloaded(url);
}

export default usePreloading;