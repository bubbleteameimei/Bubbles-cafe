import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCookiePreferences,
  updateCookiePreferences,
  acceptAllCookies,
  acceptEssentialCookiesOnly,
  clearNonEssentialCookies,
  CookiePreferences,
  CookieCategory,
  isCategoryAllowed,
  hasConsentChoice,
  hasConsentExpired,
  getAllCookies,
  COOKIE_CONSENT_KEY,
  COOKIE_DECISION_EXPIRY_KEY
} from '@/lib/cookie-manager';

interface CookieConsentContextType {
  // Current consent status
  consentGiven: boolean;
  showConsentBanner: boolean;
  cookiePreferences: CookiePreferences;
  
  // Methods to update preferences
  acceptAll: () => void;
  acceptEssentialOnly: () => void;
  toggleCategory: (category: CookieCategory) => void;
  updatePreferences: (preferences: Partial<Omit<CookiePreferences, 'lastUpdated'>>) => void;
  
  // Methods to check status
  isCategoryAllowed: (category: CookieCategory) => boolean;
  
  // Browser cookie access
  allCookies: Record<string, string>;
  
  // UI state methods
  openPreferencesModal: () => void;
  closePreferencesModal: () => void;
  isPreferencesModalOpen: boolean;
}

// Create the context with default values to avoid the need for undefined checks
const defaultContextValue: CookieConsentContextType = {
  consentGiven: false,
  showConsentBanner: false,
  cookiePreferences: {
    essential: true,
    functional: false,
    analytics: false,
    performance: false,
    marketing: false,
    lastUpdated: new Date().toISOString()
  },
  acceptAll: () => {},
  acceptEssentialOnly: () => {},
  toggleCategory: () => {},
  updatePreferences: () => {},
  isCategoryAllowed: () => true,
  allCookies: {},
  openPreferencesModal: () => {},
  closePreferencesModal: () => {},
  isPreferencesModalOpen: false
};

// Create the context with a default value
const CookieConsentContext = createContext<CookieConsentContextType>(defaultContextValue);

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for cookie preferences
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(getCookiePreferences());
  
  // Show consent banner if user has not yet made a choice
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  
  // UI state for preferences modal
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  
  // Set initial states when component mounts
  useEffect(() => {
    try {
      // Check if the user has already made a choice and if it's still valid
      const hasChoice = hasConsentChoice();
      console.log('Cookie consent choice detected:', hasChoice);
      
      // Only force the banner on the test page
      const isTestPage = window.location.pathname === '/cookie-test';
      if (isTestPage) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_DECISION_EXPIRY_KEY);
        setShowConsentBanner(true);
        console.log('Forced cookie consent banner to show for testing page');
      } else {
        // Check if the consent has expired
        if (hasConsentExpired()) {
          console.log('Cookie consent has expired, showing banner again');
          setShowConsentBanner(true);
        } else if (hasChoice) {
          // Valid choice exists, don't show banner
          setShowConsentBanner(false);
        } else {
          // No choice has been made, show the banner
          setShowConsentBanner(true);
        }
      }
      
      // Initialize preferences from localStorage
      setCookiePreferences(getCookiePreferences());
      
      // Set up event listener for storage changes (in case other tabs update preferences)
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === COOKIE_CONSENT_KEY || event.key === COOKIE_DECISION_EXPIRY_KEY) {
          setCookiePreferences(getCookiePreferences());
          
          // Update banner visibility based on consent status
          const hasValidConsent = hasConsentChoice() && !hasConsentExpired();
          setShowConsentBanner(!hasValidConsent);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error initializing cookie consent:', error);
      // Fallback to showing the banner if there's an error
      setShowConsentBanner(true);
    }
  }, []);
  
  // Accept all cookies - with 3 month expiry
  const acceptAll = () => {
    try {
      acceptAllCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('All cookie categories accepted with 3 month expiry');
    } catch (error) {
      console.error('Error accepting all cookies:', error);
    }
  };
  
  // Accept only essential cookies - with 1 week expiry
  const acceptEssentialOnly = () => {
    try {
      acceptEssentialCookiesOnly();
      clearNonEssentialCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('Only essential cookies accepted with 1 week expiry');
    } catch (error) {
      console.error('Error accepting essential cookies only:', error);
    }
  };
  
  // Toggle a specific cookie category
  const toggleCategory = (category: CookieCategory) => {
    try {
      // Essential cookies can't be toggled - they're always enabled
      if (category === 'essential') return;
      
      const newValue = !cookiePreferences[category];
      const updatedPreferences = { [category]: newValue } as Partial<CookiePreferences>;
      
      updateCookiePreferences(updatedPreferences);
      setCookiePreferences(getCookiePreferences());
      console.log(`Cookie category '${category}' toggled to ${newValue}`);
      
      // If toggling off, clear related cookies
      if (!newValue) {
        clearNonEssentialCookies();
      }
    } catch (error) {
      console.error(`Error toggling cookie category '${category}':`, error);
    }
  };
  
  // Update multiple preferences at once
  const updatePreferences = (preferences: Partial<Omit<CookiePreferences, 'lastUpdated'>>) => {
    try {
      updateCookiePreferences(preferences);
      setCookiePreferences(getCookiePreferences());
      console.log('Cookie preferences updated:', preferences);
    } catch (error) {
      console.error('Error updating cookie preferences:', error);
    }
  };
  
  // UI handlers for the preferences modal
  const openPreferencesModal = () => {
    console.log('Opening cookie preferences modal');
    setIsPreferencesModalOpen(true);
  };
  
  const closePreferencesModal = () => {
    console.log('Closing cookie preferences modal');
    setIsPreferencesModalOpen(false);
  };
  
  // Get the current cookies from the browser
  const cookies = getAllCookies();
  
  const value: CookieConsentContextType = {
    consentGiven: hasConsentChoice() && !hasConsentExpired(),
    showConsentBanner,
    cookiePreferences,
    acceptAll,
    acceptEssentialOnly,
    toggleCategory,
    updatePreferences,
    isCategoryAllowed,
    allCookies: cookies,
    openPreferencesModal,
    closePreferencesModal,
    isPreferencesModalOpen
  };
  
  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};

// Custom hook to use the cookie consent context
export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  return context;
}