/**
 * Cookie Management System
 * Handles different types of cookies and user consent preferences
 */

// Cookie consent settings key in localStorage
export const COOKIE_CONSENT_KEY = 'cookieConsent';

// Cookie categories
export type CookieCategory = 'essential' | 'functional' | 'analytics' | 'performance' | 'marketing';

// Cookie consent preferences
export interface CookiePreferences {
  essential: boolean; // Always true, required for website functionality
  functional: boolean;
  analytics: boolean;
  performance: boolean;
  marketing: boolean;
  lastUpdated: string;
}

// Default preferences - only essential cookies are enabled by default
const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false, 
  analytics: false,
  performance: false,
  marketing: false,
  lastUpdated: new Date().toISOString()
};

/**
 * Get the user's cookie consent preferences
 * @returns User's cookie preferences or default if not set
 */
export function getCookiePreferences(): CookiePreferences {
  // Use default preferences if we're not in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultPreferences;
  }
  
  try {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) return defaultPreferences;
    
    const parsed = JSON.parse(saved);
    
    // Ensure our preferences object has all needed fields (handles cases where 
    // the schema is updated but a user has older preferences stored)
    return {
      ...defaultPreferences,
      ...parsed,
      // Essential cookies are always enabled
      essential: true
    };
  } catch (error) {
    console.warn('Error getting cookie preferences:', error);
    return defaultPreferences;
  }
}

/**
 * Check if a specific cookie category is allowed
 * @param category Cookie category to check
 * @returns Boolean indicating if the category is allowed
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  // Essential cookies are always allowed
  if (category === 'essential') return true;

  const preferences = getCookiePreferences();
  return preferences[category] === true;
}

/**
 * Accept all cookie categories
 */
export function acceptAllCookies(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    const newPreferences: CookiePreferences = {
      essential: true,
      functional: true,
      analytics: true,
      performance: true,
      marketing: true,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
  } catch (error) {
    console.warn('Failed to accept all cookies:', error);
  }
}

/**
 * Accept only essential cookies
 */
export function acceptEssentialCookiesOnly(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(defaultPreferences));
  } catch (error) {
    console.warn('Failed to accept essential cookies:', error);
  }
}

/**
 * Update specific cookie preferences
 * @param preferences Partial preferences to update
 */
export function updateCookiePreferences(preferences: Partial<Omit<CookiePreferences, 'lastUpdated'>>): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    const currentPreferences = getCookiePreferences();
    const newPreferences: CookiePreferences = {
      ...currentPreferences,
      ...preferences,
      // Essential cookies can't be disabled
      essential: true,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
  } catch (error) {
    console.warn('Failed to update cookie preferences:', error);
  }
}

/**
 * Check if user has made a cookie consent choice
 * @returns Boolean indicating if the user has made a choice
 */
export function hasConsentChoice(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
  } catch (error) {
    console.warn('Failed to check consent choice:', error);
    return false;
  }
}

/**
 * Set a cookie with the given name, value, and options
 * @param name Cookie name
 * @param value Cookie value
 * @param days Number of days until cookie expires
 * @param category Cookie category for consent purposes
 * @param path Path for the cookie
 */
export function setCookie(
  name: string, 
  value: string, 
  days: number = 30, 
  category: CookieCategory = 'essential',
  path: string = '/'
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  try {
    // Only set the cookie if the category is allowed
    if (!isCategoryAllowed(category)) {
      console.log(`Cookie '${name}' not set because ${category} cookies are not allowed`);
      return;
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=${path}; SameSite=Lax`;
    document.cookie = cookie;
  } catch (error) {
    console.warn(`Failed to set cookie '${name}':`, error);
  }
}

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or empty string if not found
 */
export function getCookie(name: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }
  
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === encodeURIComponent(name)) {
        return cookieValue ? decodeURIComponent(cookieValue) : '';
      }
    }
    return '';
  } catch (error) {
    console.warn(`Failed to get cookie '${name}':`, error);
    return '';
  }
}

/**
 * Delete a cookie by name
 * @param name Cookie name
 * @param path Path for the cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
  } catch (error) {
    console.warn(`Failed to delete cookie '${name}':`, error);
  }
}

/**
 * Clear all non-essential cookies
 */
export function clearNonEssentialCookies(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  try {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // List of essential cookies that should not be cleared
    const essentialCookies = ['session', 'csrftoken', 'cookieConsent'];
    
    // Delete each non-essential cookie
    for (const cookie of cookies) {
      const [cookieName] = cookie.trim().split('=');
      const name = decodeURIComponent(cookieName.trim());
      
      if (!essentialCookies.includes(name)) {
        deleteCookie(name);
      }
    }
  } catch (error) {
    console.warn('Failed to clear non-essential cookies:', error);
  }
}

/**
 * Get all cookies as an object
 * @returns Object with all cookies
 */
export function getAllCookies(): Record<string, string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {};
  }
  
  try {
    const result: Record<string, string> = {};
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      if (cookie.trim()) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        const name = decodeURIComponent(cookieName.trim());
        const value = cookieValue ? decodeURIComponent(cookieValue) : '';
        result[name] = value;
      }
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to get all cookies:', error);
    return {};
  }
}