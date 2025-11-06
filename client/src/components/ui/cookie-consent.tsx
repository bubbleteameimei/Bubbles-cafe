import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { createPortal } from "react-dom";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CookieCategory } from "@/lib/cookie-manager";

export function CookieConsent() {
  // Enhanced cookie consent hook
  const {
    showConsentBanner,
    consentGiven,
    acceptAll,
    acceptEssentialOnly,
    openPreferencesModal,
    closePreferencesModal,
    isPreferencesModalOpen,
    hideBannerTemporarily,
    cookiePreferences,
    updatePreferences
  } = useCookieConsent();

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const acceptBtnRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll and handle focus only when banner is visible
  useEffect(() => {
    if (!showConsentBanner) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    const id = requestAnimationFrame(() => {
      try {
        acceptBtnRef.current?.focus();
      } catch {}
    });
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      cancelAnimationFrame(id);
    };
  }, [showConsentBanner]);

  // Basic focus trap within the overlay (active only when banner visible)
  useEffect(() => {
    if (!showConsentBanner) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = overlayRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute("disabled") && el.tabIndex !== -1);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (active === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [showConsentBanner]);

  // Accept all cookies
  const handleAccept = () => {
    acceptAll();
  };

  // Decline non-essential cookies
  const handleDecline = () => {
    acceptEssentialOnly();
  };

  // Close/minimize banner when navigating to policy pages
  const handlePolicyClick = () => {
    hideBannerTemporarily();
  };

  // Open granular preferences center
  const handleOpenPreferences = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    openPreferencesModal();
  };

  if (!showConsentBanner) return null;

  // When the Preference Center is open, replace the initial consent overlay entirely
  if (isPreferencesModalOpen) {
    return (
     < CookiePreferencesModal
        open={isPreferencesModalOpen}
        onOpenChange={(open) => (open ? openPreferencesModal() : closePreferencesModal())}
        consentGiven={consentGiven}
ay = (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      {!isPreferencesModalOpen && (
        <div className="max-w-[340px] w-full mx-auto bg-card rounded-lg shadow-xl border border-border/50 p-6 space-y-4">
          <div className="flex justify-center relative">
            <svg
              className="w-[50px] h-[50px] transition-all duration-300 hover:rotate-12 hover:scale-110"
              viewBox="0 0 122.88 122.25"
              aria-hidden="true"
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

          <div className="text-center space-y-2">
            <h2 id="cookie-consent-title" className="text-xl font-bold text-foreground">We use cookies</h2>
            <p id="cookie-consent-description" className="text-sm text-muted-foreground">
              This website uses cookies to personalize content, analyze traffic, and enhance your experience. Read our{" "}
              <Link href="/privacy" onClick={handlePolicyClick} className="underline text-primary hover:text-primary/80">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/legal/terms" onClick={handlePolicyClick} className="underline text-primary hover:text-primary/80">
                Terms of Service
              </Link>.
            </p>
            <div className="flex flex-col items-center gap-1">
              <p className="text-xs text-muted-foreground/50">
                Accept: won't show for 6 months • Decline: won't show for 3 months
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5">
          <div className="flex justify-center gap-4">
            {/* Accept matches footer Email button color (bg-primary) */}
            <button
              ref={acceptBtnRef}
              onClick={handleAccept}
              className={cn(
                "px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              )}
            >
              Accept
            </button>
            {/* Decline matches Start Reading button color, no hover effects */}
            <button
              onClick={handleDecline}
              className={cn(
                "px-6 py-2 rounded-full bg-[#1A1A1A] text-white font-medium",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30"
              )}
            >
              Decline
            </button>
          </div>

          {/* Less prominent but visible preferences link below buttons */}
          <button
            type="button"
            onClick={handleOpenPreferences}
            className="text-xs leading-none underline text-primary/90 hover:text-primary bg-transparent p-0 border-0"
          >
            Manage preferences
          </button>
        </div>
        </div>
      )}

      {/* Preferences Center Modal */}
      <CookiePreferencesModal
        open={isPreferencesModalOpen}
        onOpenChange={(open) => (open ? openPreferencesModal() : closePreferencesModal())}
        consentGiven={consentGiven}
        initialPrefs={cookiePreferences}
        onSave={(prefs) => {
          updatePreferences(prefs);
          closePreferencesModal();
        }}
      />
    </motion.div>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay;
}

interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consentGiven: boolean;
  initialPrefs: { functional: boolean; analytics: boolean; performance: boolean; marketing: boolean };
  onSave: (prefs: Partial<Record<CookieCategory, boolean>>) => void;
}

function CookiePreferencesModal({
  open,
  onOpenChange,
  consentGiven,
  initialPrefs,
  onSave
}: CookiePreferencesModalProps) {
  // Local state: show default toggles (Functional ON by default per requirement) when no prior consent
  const [localPreferences, setLocalPreferences] = useState<Record<string, boolean>>({
    functional: consentGiven ? initialPrefs.functional : true,
    analytics: consentGiven ? initialPrefs.analytics : false,
    performance: consentGiven ? initialPrefs.performance : false,
    marketing: consentGiven ? initialPrefs.marketing : false
  });

  useEffect(() => {
    if (open) {
      setLocalPreferences({
        functional: consentGiven ? initialPrefs.functional : true,
        analytics: consentGiven ? initialPrefs.analytics : false,
        performance: consentGiven ? initialPrefs.performance : false,
        marketing: consentGiven ? initialPrefs.marketing : false
      });
    }
  }, [open, consentGiven, initialPrefs.functional, initialPrefs.analytics, initialPrefs.performance, initialPrefs.marketing]);

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return;
    setLocalPreferences(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = () => {
    onSave(localPreferences as Partial<Record<CookieCategory, boolean>>);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        aria-labelledby="cookie-preferences-title"
        aria-describedby="cookie-preferences-description"
      >
        <DialogHeader>
          <DialogTitle id="cookie-preferences-title">Cookie Preferences</DialogTitle>
          <DialogDescription id="cookie-preferences-description">
            Choose which cookies you want to accept. Necessary cookies are always on and cannot be disabled.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="essential">Necessary/Strictly Required</Label>
              <p className="text-xs text-muted-foreground">Required for the website to function properly</p>
            </div>
            <Switch id="essential" checked={true} disabled className="data-[state=checked]:bg-primary/70" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="functional">Functional Cookies</Label>
              <p className="text-xs text-muted-foreground">Enhance features like remembering preferences</p>
            </div>
            <Switch
              id="functional"
              checked={localPreferences.functional || false}
              onCheckedChange={() => handleToggle('functional')}
              className="data-[state=checked]:bg-primary/70"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="analytics">Analytics Cookies</Label>
              <p className="text-xs text-muted-foreground">Help us understand usage to improve performance</p>
            </div>
            <Switch
              id="analytics"
              checked={localPreferences.analytics || false}
              onCheckedChange={() => handleToggle('analytics')}
              className="data-[state=checked]:bg-primary/70"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="performance">Performance Cookies</Label>
              <p className="text-xs text-muted-foreground">Improve speed and responsiveness</p>
            </div>
            <Switch
              id="performance"
              checked={localPreferences.performance || false}
              onCheckedChange={() => handleToggle('performance')}
              className="data-[state=checked]:bg-primary/70"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing/Advertising Cookies</Label>
              <p className="text-xs text-muted-foreground">Used to deliver relevant ads</p>
            </div>
            <Switch
              id="marketing"
              checked={localPreferences.marketing || false}
              onCheckedChange={() => handleToggle('marketing')}
              className="data-[state=checked]:bg-primary/70"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={cn(
              "px-3 py-2 rounded-md border border-border text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              "transition-colors hover:bg-primary/90"
            )}
          >
            Save Choices
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}