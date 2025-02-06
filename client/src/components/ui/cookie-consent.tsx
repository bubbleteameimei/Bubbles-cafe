import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COOKIE_CONSENT_KEY = 'cookieConsent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      setIsVisible(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDecline();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.4, 0, 0.2, 1],
        y: { type: "spring", stiffness: 300, damping: 30 }
      }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-labelledby="cookie-consent-title"
      tabIndex={-1}
      ref={dialogRef}
    >
      <div className="max-w-[300px] w-full mx-auto bg-card rounded-lg shadow-xl border border-border/50 p-6 space-y-4">
        <div className="flex justify-center relative">
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
          <div className="absolute -bottom-2 -right-1 w-2 h-2 rounded-full bg-[#C4A484] opacity-80" />
          <div className="absolute -bottom-3 -left-1 w-1.5 h-1.5 rounded-full bg-[#C4A484] opacity-60" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">We use cookies</h2>
          <p className="text-sm text-muted-foreground">
            This website uses cookies to ensure you get the best experience on our site.
          </p>
        </div>

        <div className="relative flex justify-center gap-4">
          <div className="absolute -top-8 -left-6 w-2 h-2 rounded-full bg-[#C4A484] opacity-40 animate-float" />
          <div className="absolute -top-4 -right-4 w-1.5 h-1.5 rounded-full bg-[#C4A484] opacity-30 animate-float-delayed" />
          <button
            onClick={handleAccept}
            className={cn(
              "px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium",
              "transition-all duration-300 hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
            )}
          >
            Allow
          </button>
          <button
            onClick={handleDecline}
            className={cn(
              "px-6 py-2 rounded-full bg-muted text-muted-foreground font-medium",
              "transition-all duration-300 hover:bg-muted/80 hover:scale-105 hover:shadow-lg"
            )}
          >
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  );
}