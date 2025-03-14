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

  if (!showConsentBanner) return null;

  const handleAcceptAll = () => {
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
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1],
        }}
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        role="dialog"
        aria-labelledby="cookie-consent-title"
      >
        <div className="max-w-3xl mx-auto bg-background/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-primary p-4 md:p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
            <div className="flex-shrink-0">
              <svg 
                className="w-[50px] h-[50px] transition-all duration-300 hover:rotate-12 hover:scale-110" 
                viewBox="0 0 122.88 122.25"
              >
                <path 
                  d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z" 
                  className="fill-[#C4A484]"
                />
                <circle cx="45" cy="25" r="6" className="fill-[#3D1C02]" />
                <circle cx="92" cy="42" r="5" className="fill-[#3D1C02]" />
                <circle cx="35" cy="68" r="7" className="fill-[#3D1C02]" />
                <circle cx="73" cy="55" r="4" className="fill-[#3D1C02]" />
                <circle cx="58" cy="82" r="5" className="fill-[#3D1C02]" />
                <circle cx="25" cy="45" r="4" className="fill-[#3D1C02]" />
                <circle cx="82" cy="75" r="3" className="fill-[#3D1C02]" />
              </svg>
            </div>

            <div className="flex-grow text-center md:text-left space-y-2">
              <h2 id="cookie-consent-title" className="text-xl font-bold text-foreground">This site uses cookies</h2>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                Visit our <Link href="/legal/cookie-policy" className="underline hover:text-primary transition-colors">cookie policy</Link> to learn more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button 
                onClick={handleAcceptAll}
                variant="default"
                className="w-full sm:w-auto font-semibold shadow-sm hover:bg-primary/90 hover:scale-105 transition-all"
              >
                Accept All
              </Button>
              <Button 
                onClick={handleAcceptEssential}
                variant="outline"
                className="w-full sm:w-auto font-medium hover:bg-secondary/80 hover:scale-105 transition-all"
              >
                Essential Only
              </Button>
              <Button 
                onClick={handleCustomize}
                variant="ghost"
                className="w-full sm:w-auto underline underline-offset-4 hover:text-primary hover:scale-105 transition-all"
              >
                Customize
              </Button>
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
  onOpenChange: () => void;
}

function CookiePreferencesModal({ open, onOpenChange }: CookiePreferencesModalProps) {
  const { 
    cookiePreferences, 
    acceptAll, 
    acceptEssentialOnly,
    updatePreferences
  } = useCookieConsent();

  // Local state to track changes before saving
  const [localPreferences, setLocalPreferences] = useState(cookiePreferences);

  // Reset local preferences when modal opens
  React.useEffect(() => {
    if (open) {
      setLocalPreferences(cookiePreferences);
    }
  }, [open, cookiePreferences]);

  const handleToggleCategory = (category: CookieCategory) => {
    // Don't allow essential to be toggled
    if (category === 'essential') return;
    
    setLocalPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    // Update preferences excluding 'lastUpdated' which is handled by the manager
    const { lastUpdated, ...prefsToUpdate } = localPreferences;
    updatePreferences(prefsToUpdate);
    onOpenChange();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Customize which cookies you allow us to use. Essential cookies cannot be disabled as they are required for the website to function.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Essential Cookies</Label>
              <p className="text-sm text-muted-foreground">Required for basic site functionality</p>
            </div>
            <Switch checked={true} disabled className="data-[state=checked]:bg-primary" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Functional Cookies</Label>
              <p className="text-sm text-muted-foreground">Enhance your experience with personalized features</p>
            </div>
            <Switch 
              checked={localPreferences.functional} 
              onCheckedChange={() => handleToggleCategory('functional')} 
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Analytics Cookies</Label>
              <p className="text-sm text-muted-foreground">Help us understand how visitors use our site</p>
            </div>
            <Switch 
              checked={localPreferences.analytics} 
              onCheckedChange={() => handleToggleCategory('analytics')} 
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Performance Cookies</Label>
              <p className="text-sm text-muted-foreground">Collect information about site performance</p>
            </div>
            <Switch 
              checked={localPreferences.performance} 
              onCheckedChange={() => handleToggleCategory('performance')} 
              className="data-[state=checked]:bg-primary"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing Cookies</Label>
              <p className="text-sm text-muted-foreground">Provide personalized content and relevant advertisements</p>
            </div>
            <Switch 
              checked={localPreferences.marketing} 
              onCheckedChange={() => handleToggleCategory('marketing')} 
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-between flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={acceptEssentialOnly}>Essential Only</Button>
            <Button variant="outline" onClick={acceptAll}>Accept All</Button>
          </div>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}