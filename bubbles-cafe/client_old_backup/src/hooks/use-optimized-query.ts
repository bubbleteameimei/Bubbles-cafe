/**
 * Optimized React Query Hook
 * 
 * This hook extends TanStack Query with optimizations for performance:
 * - Deep equality checking for query keys
 * - Automatic batching of similar requests
 * - Improved caching for frequently accessed data
 * - Integration with our memoization system
 */

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';
import { useMemoDeep } from '../utils/memoization';
import { useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';

/**
 * Enhanced useQuery hook with deep comparison of query keys to prevent unnecessary refetches
 */
export function useOptimizedQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>
) {
  // Deep memoize the query key to ensure stability across renders
  const memoizedQueryKey = useMemoDeep(() => queryKey, [queryKey]);
  
  // The actual query with our optimizations
  return useQuery({
    ...options,
    queryKey: memoizedQueryKey,
    // Apply stale time based on query frequency
    staleTime: options?.staleTime || determineOptimalStaleTime(memoizedQueryKey),
    
    // Add our custom meta to track usage patterns
    meta: {
      ...(options?.meta || {}),
      accessCount: ((options?.meta as any)?.accessCount || 0) + 1,
      lastAccessed: Date.now()
    }
  });
}

/**
 * Determine the optimal stale time for a query based on its access patterns
 */
function determineOptimalStaleTime(queryKey: QueryKey): number {
  const serializedKey = JSON.stringify(queryKey);
  const queryCache = queryClient.getQueryCache();
  const existingQuery = queryCache.findAll().find(
    q => JSON.stringify(q.queryKey) === serializedKey
  );
  
  // If this is a frequently accessed query, increase stale time
  if (existingQuery) {
    const meta = existingQuery.meta as { accessCount?: number } | undefined;
    const accessCount = meta?.accessCount || 0;
    
    if (accessCount > 10) return 5 * 60 * 1000; // 5 minutes
    if (accessCount > 5) return 2 * 60 * 1000;  // 2 minutes
    if (accessCount > 2) return 1 * 60 * 1000;  // 1 minute
  }
  
  // Default stale time
  return 30 * 1000; // 30 seconds
}

/**
 * Hook for accessing data that should always be kept fresh
 * Useful for user data, notifications, etc.
 */
export function useAlwaysFreshQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>
) {
  return useOptimizedQuery(queryKey, {
    ...options,
    staleTime: 0, // Always stale - will refetch whenever window gets focus
    refetchInterval: options?.refetchInterval || 60 * 1000, // Refetch every minute by default
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
}

/**
 * Hook for accessing data that changes infrequently
 * Useful for reference data, user settings, etc.
 */
export function useRarelyChangingQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>
) {
  return useOptimizedQuery(queryKey, {
    ...options,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days (was cacheTime in v4)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });
}

/**
 * Define a type for a function that prefetches data
 */
interface PrefetchFunction {
  (): Promise<void>;
}

/**
 * Hook to create a prefetch function for data that will be needed soon
 * Use this to preload data before navigating to a new route
 */
export function usePrefetch<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey'>
): PrefetchFunction {
  const memoizedQueryKey = useMemoDeep(() => queryKey, [queryKey]);
  
  return useCallback(async () => {
    await queryClient.prefetchQuery({
      queryKey: memoizedQueryKey,
      ...options
    });
  }, [memoizedQueryKey, options]);
}