import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useCookieConsent } from '@/hooks/use-cookie-consent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CookieCategory } from '@/lib/cookie-manager';

export function CookieConsent() {
  const { 
    showConsentBanner, 
    cookiePreferences,
    acceptAll, 
    acceptEssentialOnly,
    updatePreferences,
    isPreferencesModalOpen,
    openPreferencesModal,
    closePreferencesModal
  } = useCookieConsent();
  
  // Cookie bite animation state
  const [isBitten, setIsBitten] = useState(false);
  
  if (!showConsentBanner) return null;

  const handleAcceptAll = () => {
    // Accept all cookies
    acceptAll();
  };

  const handleAcceptEssential = () => {
    acceptEssentialOnly();
  };

  const handleCustomize = () => {
    openPreferencesModal();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.4, 0, 0.2, 1],
          y: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
        role="dialog"
        aria-labelledby="cookie-consent-title"
      >
        {/* Floating chocolate chip animations */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + i * 20}%`,
                zIndex: 0
              }}
              animate={{
                y: [0, -5, 0],
                x: [0, Math.random() * 5, 0],
                rotate: [0, Math.random() * 10 - 5, 0]
              }}
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.2
              }}
            >
              <div className="h-3 w-3 rounded-full bg-[#6F4E37]" />
            </motion.div>
          ))}
        </div>
        
        <div className="relative p-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="hidden sm:block flex-shrink-0"
            >
              <svg 
                className="w-12 h-12" 
                viewBox="0 0 122.88 122.25"
              >
                <path 
                  d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z" 
                  className="fill-[#D2A76C]"
                />
                <circle cx="45" cy="25" r="5" className="fill-[#6F4E37]" />
                <circle cx="92" cy="42" r="4" className="fill-[#6F4E37]" />
                <circle cx="35" cy="68" r="6" className="fill-[#6F4E37]" />
                <circle cx="73" cy="55" r="3" className="fill-[#6F4E37]" />
                <circle cx="58" cy="82" r="4" className="fill-[#6F4E37]" />
                <circle cx="25" cy="45" r="3" className="fill-[#6F4E37]" />
              </svg>
            </motion.div>

            <div className="flex-1">
              <h2 id="cookie-consent-title" className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100">
                Fresh Baked Cookies!
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Enjoy a More Personalized Experience
                <br />
                This website uses cookies to enhance your experience, analyze site traffic, and personalize content. 
                By clicking "Accept", you agree to our use of cookies as described in our <Link href="/legal/cookie-policy" className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Cookie Policy</Link>. 
                You can manage your preferences at any time in "Cookie preferences".
              </p>

              <div className="flex flex-wrap gap-2 sm:items-center sm:justify-start">
                <Button 
                  onClick={handleAcceptAll}
                  variant="default"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Accept
                </Button>
                
                <Button 
                  onClick={handleAcceptEssential}
                  variant="outline"
                  className="px-4 py-2 border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Decline
                </Button>
                
                <Button 
                  onClick={handleCustomize}
                  variant="ghost"
                  className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Cookie preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <CookiePreferencesModal 
        open={isPreferencesModalOpen} 
        onOpenChange={closePreferencesModal}
      />
    </>
  );
}

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CookiePreferencesModal({ open, onOpenChange }: CookiePreferencesModalProps) {
  const { cookiePreferences, toggleCategory, updatePreferences, acceptAll } = useCookieConsent();
  
  // Make a local copy of preferences for the modal
  const [localPreferences, setLocalPreferences] = useState<Record<string, boolean>>({});
  
  // Initialize local state when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalPreferences({
        functional: cookiePreferences.functional,
        analytics: cookiePreferences.analytics,
        performance: cookiePreferences.performance,
        marketing: cookiePreferences.marketing
      });
    }
  }, [open, cookiePreferences]);
  
  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return;
    
    setLocalPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleSave = () => {
    updatePreferences(localPreferences);
    onOpenChange(false);
  };
  
  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Choose which cookies you want to accept. Essential cookies cannot be disabled as they are necessary for the website to function properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="essential">Essential Cookies</Label>
              <p className="text-xs text-muted-foreground">Required for the website to function properly</p>
            </div>
            <Switch id="essential" checked={true} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="functional">Functional Cookies</Label>
              <p className="text-xs text-muted-foreground">Enhance the functionality of the website</p>
            </div>
            <Switch 
              id="functional" 
              checked={localPreferences.functional || false} 
              onCheckedChange={() => handleToggle('functional')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">Help us understand how you use our website</p>
            </div>
            <Switch 
              id="analytics" 
              checked={localPreferences.analytics || false} 
              onCheckedChange={() => handleToggle('analytics')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performance">Performance Cookies</Label>
              <p className="text-xs text-muted-foreground">Improve website performance and speed</p>
            </div>
            <Switch 
              id="performance" 
              checked={localPreferences.performance || false} 
              onCheckedChange={() => handleToggle('performance')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing Cookies</Label>
              <p className="text-xs text-muted-foreground">Used to deliver relevant ads and track their effectiveness</p>
            </div>
            <Switch 
              id="marketing" 
              checked={localPreferences.marketing || false} 
              onCheckedChange={() => handleToggle('marketing')} 
            />
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="ghost"
            onClick={handleAcceptAll}
          >
            Accept All
          </Button>
          <Button 
            onClick={handleSave}
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}