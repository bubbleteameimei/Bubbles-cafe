import React, { useState, useEffect } from 'react';
import { CookieConsent } from '@/components/ui/cookie-consent';
import { CookieConsentProvider, useCookieConsent } from '@/hooks/use-cookie-consent';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CookieIcon, CheckCircle2, XCircle } from 'lucide-react';

export default function CookieTestPage() {
  const [cookieStorageValue, setCookieStorageValue] = useState<string | null>(null);
  const [cookiePreferencesValue, setCookiePreferencesValue] = useState<string | null>(null);
  const [bannerStatus, setBannerStatus] = useState<'visible' | 'hidden' | 'unknown'>('unknown');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const { 
    consentGiven, 
    showConsentBanner, 
    cookiePreferences,
    acceptAll,
    acceptEssentialOnly,
    openPreferencesModal
  } = useCookieConsent();

  // Custom logging function
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log(`[Cookie Test] ${logEntry}`);
    setLogMessages(prev => [logEntry, ...prev].slice(0, 10)); // Keep last 10 logs
  };

  // Update local storage values on mount and when they change
  useEffect(() => {
    const checkStorageValues = () => {
      try {
        const consent = localStorage.getItem('cookieConsent');
        const prefs = localStorage.getItem('cookie-preferences');
        setCookieStorageValue(consent);
        setCookiePreferencesValue(prefs);
        setBannerStatus(consent ? 'hidden' : 'visible');
        addLog(`Storage checked - consent: ${consent ? 'given' : 'not given'}`);
      } catch (error) {
        console.error('Error reading localStorage:', error);
        addLog(`Error reading localStorage: ${error}`);
      }
    };

    // Check initial values
    checkStorageValues();
    addLog(`Initial banner status from context: ${showConsentBanner ? 'visible' : 'hidden'}`);
    addLog(`Initial consent from context: ${consentGiven ? 'given' : 'not given'}`);

    // Listen for storage changes
    const handleStorageChange = () => {
      checkStorageValues();
      setLastAction('Storage updated');
      addLog('Storage event triggered');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [showConsentBanner, consentGiven]);
  
  // Log changes to cookie consent state
  useEffect(() => {
    addLog(`Banner visibility changed: ${showConsentBanner ? 'visible' : 'hidden'}`);
  }, [showConsentBanner]);
  
  useEffect(() => {
    addLog(`Consent status changed: ${consentGiven ? 'given' : 'not given'}`);
  }, [consentGiven]);
  
  useEffect(() => {
    if (cookiePreferences) {
      const enabledCategories = Object.entries(cookiePreferences)
        .filter(([key, value]) => value === true && key !== 'lastUpdated')
        .map(([key]) => key);
      addLog(`Cookie preferences updated: ${enabledCategories.join(', ')}`);
    }
  }, [cookiePreferences]);

  const clearPreferences = () => {
    try {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('cookie-preferences');
      setCookieStorageValue(null);
      setCookiePreferencesValue(null);
      setBannerStatus('visible');
      setLastAction('Preferences cleared');
      // Force reload to ensure the banner appears
      window.location.reload();
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto p-4 flex-grow">
        <div className="flex items-center gap-3 mb-6">
          <CookieIcon className="h-8 w-8 text-amber-600" />
          <h1 className="text-3xl font-bold">Cookie Consent Test Page</h1>
          <Badge variant="outline" className="ml-auto">Test Environment</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Alert className="mb-4">
              <AlertTitle className="text-lg">Cookie Consent Status</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Banner:</span>
                    {bannerStatus === 'visible' ? (
                      <Badge className="bg-green-600">Visible</Badge>
                    ) : bannerStatus === 'hidden' ? (
                      <Badge className="bg-red-600">Hidden (Consent Given)</Badge>
                    ) : (
                      <Badge className="bg-yellow-600">Unknown</Badge>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Consent Value:</span>
                    <pre className="mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm overflow-auto">
                      {cookieStorageValue || 'null'}
                    </pre>
                  </div>
                  <div>
                    <span className="font-semibold">Preferences Value:</span>
                    <pre className="mt-1 bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm overflow-auto">
                      {cookiePreferencesValue || 'null'}
                    </pre>
                  </div>
                  {lastAction && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Last Action:</span>
                      <Badge variant="outline">{lastAction}</Badge>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="p-4 border rounded-lg bg-amber-50 mb-4">
              <h2 className="font-semibold text-amber-800 mb-2">Reset Test Environment</h2>
              <p className="text-amber-800 mb-3">
                If you don't see the cookie consent banner, it might be because you've already
                accepted cookies. Clear your preferences and reload the page.
              </p>
              <button 
                onClick={clearPreferences}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                Clear Cookie Preferences & Reload
              </button>
            </div>
            
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900 mb-4">
              <h2 className="font-semibold mb-2 flex items-center gap-2">
                <span>Debug Logs</span>
                <Badge variant="outline" className="ml-auto">{logMessages.length} entries</Badge>
              </h2>
              <div className="bg-slate-100 dark:bg-slate-800 rounded p-2 h-[200px] overflow-y-auto text-xs font-mono">
                {logMessages.length > 0 ? (
                  <ul className="space-y-1">
                    {logMessages.map((log, index) => (
                      <li key={index} className="border-b border-slate-200 dark:border-slate-700 pb-1">
                        {log}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">No logs yet...</p>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Cookie Banner Features</h2>
            <p className="mb-4">
              This page tests the cookie consent banner with the following interactive features:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Falling cookie animations around the banner</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Steam effects coming from the cookie</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>A bite animation when clicking "Accept All"</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Delicious cookie-themed design</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Custom cookie preferences modal</span>
              </li>
            </ul>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">Implementation Notes</h3>
              <ul className="space-y-1 text-sm">
                <li>• Uses React Context API for state management</li>
                <li>• Stores preferences in localStorage</li>
                <li>• Framer Motion for animations</li>
                <li>• Built with Tailwind CSS</li>
                <li>• GDPR and CCPA compliant design</li>
              </ul>
            </div>
            
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-300">Test Banner Actions</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                Use these buttons to test consent banner actions programmatically:
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    localStorage.removeItem('cookieConsent');
                    localStorage.removeItem('cookie-preferences');
                    addLog('Manually cleared preferences via test panel');
                    window.location.reload();
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Show Banner
                </button>
                
                <button 
                  onClick={() => {
                    addLog('Manually triggered acceptAll via test panel');
                    // Use the extracted acceptAll function from useCookieConsent hook
                    if (acceptAll) acceptAll();
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Accept All Cookies
                </button>
                
                <button 
                  onClick={() => {
                    addLog('Manually triggered acceptEssentialOnly via test panel');
                    // Use the extracted acceptEssentialOnly function from useCookieConsent hook
                    if (acceptEssentialOnly) acceptEssentialOnly();
                  }}
                  className="px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                >
                  Essential Only
                </button>
                
                <button 
                  onClick={() => {
                    addLog('Manually opened preferences modal via test panel');
                    // Use the extracted openPreferencesModal function from useCookieConsent hook
                    if (openPreferencesModal) openPreferencesModal();
                  }}
                  className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  Open Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Force the CookieConsent component to render */}
      <CookieConsentProvider>
        <CookieConsent />
      </CookieConsentProvider>
    </div>
  );
}