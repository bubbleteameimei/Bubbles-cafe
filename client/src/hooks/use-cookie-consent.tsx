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
import { useLocation } from 'wouter';

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

  // Banner visibility controls (do not imply consent)
  hideBannerTemporarily: () => void;
}

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
  isPreferencesModalOpen: false,
  hideBannerTemporarily: () => {}
};

const CookieConsentContext = createContext<CookieConsentContextType>(defaultContextValue);

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences>(getCookiePreferences());
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Initial mount: decide whether to show the banner
  useEffect(() => {
    try {
      const hasChoice = hasConsentChoice();
      console.log('Cookie consent choice detected:', hasChoice);

      const isTestPage = window.location.pathname === '/cookie-test';
      if (isTestPage) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_DECISION_EXPIRY_KEY);
        setShowConsentBanner(true);
        console.log('Forced cookie consent banner to show for testing page');
      } else {
        if (hasConsentExpired()) {
          console.log('Cookie consent has expired, showing banner again');
          setShowConsentBanner(true);
        } else if (hasChoice) {
          setShowConsentBanner(false);
        } else {
          setShowConsentBanner(true);
        }
      }

      setCookiePreferences(getCookiePreferences());

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === COOKIE_CONSENT_KEY || event.key === COOKIE_DECISION_EXPIRY_KEY) {
          setCookiePreferences(getCookiePreferences());
          const hasValidConsent = hasConsentChoice() && !hasConsentExpired();
          setShowConsentBanner(!hasValidConsent);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error initializing cookie consent:', error);
      setShowConsentBanner(true);
      return () => {};
    }
  }, []);

  // Accept all cookies - 6 month expiry
  const acceptAll = () => {
    try {
      acceptAllCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('All cookie categories accepted with 6 month expiry');
    } catch (error) {
      console.error('Error accepting all cookies:', error);
    }
  };

  // Accept only essential cookies - 3 month expiry
  const acceptEssentialOnly = () => {
    try {
      acceptEssentialCookiesOnly();
      clearNonEssentialCookies();
      setCookiePreferences(getCookiePreferences());
      setShowConsentBanner(false);
      console.log('Only essential cookies accepted with 3 month expiry');
    } catch (error) {
      console.error('Error accepting essential cookies only:', error);
    }
  };

  // Toggle a specific cookie category
  const toggleCategory = (category: CookieCategory) => {
    try {
      if (category === 'essential') return;
      const newValue = !cookiePreferences[category];
      const updatedPreferences = { [category]: newValue } as Partial<CookiePreferences>;

      updateCookiePreferences(updatedPreferences);
      setCookiePreferences(getCookiePreferences());
      console.log(`Cookie category '${category}' toggled to ${newValue}`);

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
      setShowConsentBanner(false);
      console.log('Cookie preferences updated:', preferences);
    } catch (error) {
      console.error('Error updating cookie preferences:', error);
    }
  };

  // Preferences modal UI handlers
  const openPreferencesModal = () => {
    console.log('Opening cookie preferences modal');
    setIsPreferencesModalOpen(true);
  };

  const closePreferencesModal = () => {
    console.log('Closing cookie preferences modal');
    setIsPreferencesModalOpen(false);
  };

  // Explicitly hide the banner without implying consent (used when navigating to policy pages)
  const hideBannerTemporarily = () => {
    setShowConsentBanner(false);
  };

  // Re-show the banner on route changes when no valid consent has been given,
  // but keep it hidden on policy/legal pages to avoid blocking the content.
  const [location] = useLocation();
  useEffect(() => {
    try {
      const path = location || '';
      const isLegalDoc =
        path.startsWith('/privacy') ||
        path.startsWith('/legal/terms') ||
        path.startsWith('/legal/cookie-policy');

      const hasValidConsent = hasConsentChoice() && !hasConsentExpired();

      if (hasValidConsent) {
        setShowConsentBanner(false);
      } else {
        setShowConsentBanner(!isLegalDoc);
      }
    } catch (error) {
      // On error, do not force a state change
    }
  }, [location]);

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
    isPreferencesModalOpen,
    hideBannerTemporarily
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