import { useCallback } from 'react';
import { useCookieConsent } from './use-cookie-consent';
import { CookieCategory } from '@/lib/cookie-manager';

/**
 * Hook for working with specific cookie categories
 * Makes it easy to conditionally execute code based on cookie consent
 */
export function useCookieCategory() {
  const { isCategoryAllowed } = useCookieConsent();

  /**
   * Run a callback function only if the specified cookie category is allowed
   * @param category Cookie category to check
   * @param callback Function to execute if the category is allowed
   * @param fallback Optional function to execute if the category is not allowed
   */
  const runIfAllowed = useCallback(<T>(
    category: CookieCategory,
    callback: () => T,
    fallback?: () => T
  ): T | undefined => {
    if (isCategoryAllowed(category)) {
      return callback();
    } else if (fallback) {
      return fallback();
    }
    return undefined;
  }, [isCategoryAllowed]);

  /**
   * Check if a specific cookie category is allowed
   * @param category Cookie category to check
   * @returns Boolean indicating if the category is allowed
   */
  const isAllowed = useCallback((category: CookieCategory): boolean => {
    return isCategoryAllowed(category);
  }, [isCategoryAllowed]);

  return {
    runIfAllowed,
    isAllowed
  };
}