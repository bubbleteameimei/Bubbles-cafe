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
    console.error('Error getting cookie preferences:', error);
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
  const newPreferences: CookiePreferences = {
    essential: true,
    functional: true,
    analytics: true,
    performance: true,
    marketing: true,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
}

/**
 * Accept only essential cookies
 */
export function acceptEssentialCookiesOnly(): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(defaultPreferences));
}

/**
 * Update specific cookie preferences
 * @param preferences Partial preferences to update
 */
export function updateCookiePreferences(preferences: Partial<Omit<CookiePreferences, 'lastUpdated'>>): void {
  const currentPreferences = getCookiePreferences();
  const newPreferences: CookiePreferences = {
    ...currentPreferences,
    ...preferences,
    // Essential cookies can't be disabled
    essential: true,
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
}

/**
 * Check if user has made a cookie consent choice
 * @returns Boolean indicating if the user has made a choice
 */
export function hasConsentChoice(): boolean {
  return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
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
  // Only set the cookie if the category is allowed
  if (!isCategoryAllowed(category)) {
    console.log(`Cookie '${name}' not set because ${category} cookies are not allowed`);
    return;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expiryDate.toUTCString()}; path=${path}; SameSite=Lax`;
  document.cookie = cookie;
}

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or empty string if not found
 */
export function getCookie(name: string): string {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === encodeURIComponent(name)) {
      return decodeURIComponent(cookieValue);
    }
  }
  return '';
}

/**
 * Delete a cookie by name
 * @param name Cookie name
 * @param path Path for the cookie
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
}

/**
 * Clear all non-essential cookies
 */
export function clearNonEssentialCookies(): void {
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
}