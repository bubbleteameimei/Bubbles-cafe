/**
 * Cookie Management System
 * Handles different types of cookies and user consent preferences
 */

// Cookie consent settings key in localStorage
export const COOKIE_CONSENT_KEY = 'cookieConsent';
export const COOKIE_DECISION_EXPIRY_KEY = 'cookieConsentExpiry';

// Cookie consent expiration periods in milliseconds
export const COOKIE_ACCEPT_EXPIRY = 90 * 24 * 60 * 60 * 1000; // 3 months
export const COOKIE_REJECT_EXPIRY = 7 * 24 * 60 * 60 * 1000;  // 1 week

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
    
    let parsed;
    try {
      parsed = JSON.parse(saved);
    } catch (parseError) {
      console.warn('Invalid JSON in cookie preferences, resetting to defaults');
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return defaultPreferences;
    }
    
    // Validate the structure - ensure it's an object
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Cookie preferences not in expected format, resetting to defaults');
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return defaultPreferences;
    }
    
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
    
    // Attempt to recover by removing potentially corrupted preferences
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch (removeError) {
      console.error('Failed to remove corrupted cookie preferences', removeError);
    }
    
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
    
    // Set cookie preferences
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
    
    // Store the expiry date for the accept decision (3 months)
    const expiryDate = new Date(Date.now() + COOKIE_ACCEPT_EXPIRY).toISOString();
    localStorage.setItem(COOKIE_DECISION_EXPIRY_KEY, expiryDate);
    
    console.log(`Cookie consent accepted - will expire on ${new Date(expiryDate).toLocaleDateString()}`);
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
    // Set cookie preferences
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(defaultPreferences));
    
    // Store the expiry date for the reject decision (1 week)
    const expiryDate = new Date(Date.now() + COOKIE_REJECT_EXPIRY).toISOString();
    localStorage.setItem(COOKIE_DECISION_EXPIRY_KEY, expiryDate);
    
    console.log(`Cookie consent rejected - will expire on ${new Date(expiryDate).toLocaleDateString()}`);
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
    
    // Update cookie preferences
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(newPreferences));
    
    // Determine if this is an accept or reject overall decision
    // If any non-essential cookie is enabled, consider it an accept decision (3 months)
    // Otherwise, it's a reject decision (1 week)
    const hasAcceptedNonEssential = 
      newPreferences.functional || 
      newPreferences.analytics || 
      newPreferences.performance || 
      newPreferences.marketing;
    
    // Set appropriate expiry based on accept/reject status
    const expiryPeriod = hasAcceptedNonEssential ? COOKIE_ACCEPT_EXPIRY : COOKIE_REJECT_EXPIRY;
    const expiryDate = new Date(Date.now() + expiryPeriod).toISOString();
    localStorage.setItem(COOKIE_DECISION_EXPIRY_KEY, expiryDate);
    
    console.log(`Cookie preferences updated - will expire on ${new Date(expiryDate).toLocaleDateString()}`);
  } catch (error) {
    console.warn('Failed to update cookie preferences:', error);
  }
}

/**
 * Check if a consent decision has expired
 * @returns Boolean indicating if the consent has expired
 */
export function hasConsentExpired(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return true; // If we can't access localStorage, treat as expired
  }
  
  try {
    const expiryValue = localStorage.getItem(COOKIE_DECISION_EXPIRY_KEY);
    
    // If no expiry value, consider it expired
    if (!expiryValue) {
      return true;
    }
    
    // Check if the expiry date is valid
    try {
      const expiryDate = new Date(expiryValue);
      const now = new Date();
      
      // If the date is valid, check if it's in the past
      return now > expiryDate;
    } catch (parseError) {
      console.warn('Invalid expiry date format, treating as expired:', parseError);
      // Clean up invalid data
      localStorage.removeItem(COOKIE_DECISION_EXPIRY_KEY);
      return true;
    }
  } catch (error) {
    console.warn('Error checking consent expiration:', error);
    return true; // On error, treat as expired for safety
  }
}

/**
 * Get expiry time of consent in days remaining
 * @returns Number of days left until consent expires, or 0 if expired/not set
 */
export function getConsentDaysRemaining(): number {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 0;
  }
  
  try {
    const expiryValue = localStorage.getItem(COOKIE_DECISION_EXPIRY_KEY);
    
    if (!expiryValue) {
      return 0;
    }
    
    try {
      const expiryDate = new Date(expiryValue);
      const now = new Date();
      
      // If already expired, return 0
      if (now > expiryDate) {
        return 0;
      }
      
      // Calculate days remaining
      const msRemaining = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
      
      return daysRemaining;
    } catch (parseError) {
      console.warn('Invalid expiry date format:', parseError);
      return 0;
    }
  } catch (error) {
    console.warn('Error calculating remaining consent days:', error);
    return 0;
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
    const consentValue = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    // Check if the consent has expired
    if (hasConsentExpired()) {
      console.log('Cookie consent has expired, clearing preferences');
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      localStorage.removeItem(COOKIE_DECISION_EXPIRY_KEY);
      return false;
    }
    
    // Additional validation to ensure the stored value is valid JSON
    if (consentValue) {
      try {
        const parsed = JSON.parse(consentValue);
        // Verify it has the expected structure (at least one preference)
        return (parsed && typeof parsed === 'object' && 
                (parsed.essential !== undefined || 
                 parsed.functional !== undefined || 
                 parsed.analytics !== undefined));
      } catch (parseError) {
        console.warn('Invalid consent data in localStorage, treating as no consent');
        // Clean up invalid data
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_DECISION_EXPIRY_KEY);
        return false;
      }
    }
    return false;
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
  
  if (!name) {
    console.warn('Attempted to get cookie with empty name');
    return '';
  }
  
  try {
    // Handle the empty cookie case gracefully
    if (!document.cookie) {
      return '';
    }
    
    const cookies = document.cookie.split(';');
    
    // Encode the name for comparison
    const encodedName = encodeURIComponent(name);
    
    for (const cookie of cookies) {
      if (!cookie.trim()) continue;
      
      try {
        // Use index-based parsing for more reliable results
        const separatorIndex = cookie.indexOf('=');
        
        // Skip cookies with no value separator
        if (separatorIndex === -1) continue;
        
        const cookieName = cookie.substring(0, separatorIndex).trim();
        // If names match, return the decoded value
        if (cookieName === encodedName || cookieName === name) {
          const cookieValue = cookie.substring(separatorIndex + 1).trim();
          try {
            return cookieValue ? decodeURIComponent(cookieValue) : '';
          } catch (decodeError) {
            console.warn(`Failed to decode cookie value for ${name}, returning raw value`);
            return cookieValue || '';
          }
        }
      } catch (cookieError) {
        console.warn(`Error parsing cookie during getCookie: ${cookie}`, cookieError);
        // Continue with other cookies
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
    // Handle the empty cookie case
    if (!document.cookie) {
      return;
    }
    
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Expanded list of essential cookies that should not be cleared
    const essentialCookies = [
      'session', 'csrftoken', 'cookieConsent', 'connect.sid', 
      'XSRF-TOKEN', 'JSESSIONID', 'sessionid'
    ];
    
    // Delete each non-essential cookie
    for (const cookie of cookies) {
      try {
        // Use more robust parsing
        const separatorIndex = cookie.indexOf('=');
        if (separatorIndex === -1) continue;
        
        const cookieName = cookie.substring(0, separatorIndex).trim();
        let name;
        
        // Safely decode the cookie name
        try {
          name = decodeURIComponent(cookieName);
        } catch (decodeError) {
          console.warn(`Failed to decode cookie name: ${cookieName}, using raw value`);
          name = cookieName;
        }
        
        // Don't delete essential cookies
        if (!essentialCookies.includes(name)) {
          deleteCookie(name);
        }
      } catch (cookieError) {
        console.warn(`Error processing cookie during clear operation: ${cookie}`, cookieError);
        // Continue with other cookies
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
    
    // Handle the empty cookie case gracefully
    if (!document.cookie) {
      return result;
    }
    
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      if (cookie.trim()) {
        try {
          // Use a more robust parsing approach
          const separatorIndex = cookie.indexOf('=');
          
          // Handle cookies without values
          if (separatorIndex === -1) {
            const cookieName = cookie.trim();
            result[decodeURIComponent(cookieName)] = '';
            continue;
          }
          
          const cookieName = cookie.substring(0, separatorIndex).trim();
          const cookieValue = cookie.substring(separatorIndex + 1).trim();
          
          // Safely decode URI components, fallback to raw values if decoding fails
          let name, value;
          try {
            name = decodeURIComponent(cookieName);
          } catch (e) {
            console.warn(`Failed to decode cookie name: ${cookieName}`);
            name = cookieName;
          }
          
          try {
            value = cookieValue ? decodeURIComponent(cookieValue) : '';
          } catch (e) {
            console.warn(`Failed to decode cookie value for ${cookieName}`);
            value = cookieValue || '';
          }
          
          result[name] = value;
        } catch (cookieError) {
          console.warn(`Failed to parse individual cookie: ${cookie}`, cookieError);
          // Continue processing other cookies even if one fails
        }
      }
    }
    
    return result;
  } catch (error) {
    console.warn('Failed to get all cookies:', error);
    return {};
  }
}