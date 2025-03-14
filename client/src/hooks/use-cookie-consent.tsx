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
  hasConsentChoice
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
      // Check if the user has already made a choice
      const hasChoice = hasConsentChoice();
      console.log('Cookie consent choice detected:', hasChoice);
      
      // Only force the banner on the test page
      const isTestPage = window.location.pathname === '/cookie-test';
      if (isTestPage) {
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('cookie-preferences');
        setShowConsentBanner(true);
        console.log('Forced cookie consent banner to show for testing page');
      } else {
        // Normal behavior for other pages - show banner if no choice made
        setShowConsentBanner(!hasChoice);
      }
      
      // Initialize preferences from localStorage
      setCookiePreferences(getCookiePreferences());
      
      // Set up event listener for storage changes (in case other tabs update preferences)
      const handleStorageChange = () => {
        setCookiePreferences(getCookiePreferences());
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error initializing cookie consent:', error);
      // Fallback to showing the banner if there's an error
      setShowConsentBanner(true);
    }
  }, []);
  
  // Accept all cookies
  const acceptAll = () => {
    try {
      acceptAllCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('All cookie categories accepted');
    } catch (error) {
      console.error('Error accepting all cookies:', error);
    }
  };
  
  // Accept only essential cookies
  const acceptEssentialOnly = () => {
    try {
      acceptEssentialCookiesOnly();
      clearNonEssentialCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('Only essential cookies accepted');
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
  
  const value: CookieConsentContextType = {
    consentGiven: hasConsentChoice(),
    showConsentBanner,
    cookiePreferences,
    acceptAll,
    acceptEssentialOnly,
    toggleCategory,
    updatePreferences,
    isCategoryAllowed,
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