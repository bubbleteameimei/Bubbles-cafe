import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="w-[300px] h-[220px] bg-card/90 backdrop-blur-sm rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-border/50 flex flex-col items-center justify-center p-6 gap-4">
        <svg 
          className="w-[50px] h-[50px] text-muted-foreground transition-colors duration-200 group-hover:text-primary" 
          viewBox="0 0 122.88 122.25"
        >
          <path 
            d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95 c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38 c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03 c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38 C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12 c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0 c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55 C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z" 
            className="fill-current"
          />
        </svg>

        <h2 className="text-[1.2em] font-extrabold text-foreground">We use cookies.</h2>
        <p className="text-[0.7em] font-semibold text-muted-foreground text-center">
          This website uses cookies to ensure you get the best experience on our site.
        </p>

        <div className="flex gap-5">
          <button
            onClick={handleAccept}
            className={cn(
              "w-[80px] h-[30px] rounded-[20px] bg-primary text-primary-foreground font-semibold",
              "transition-all duration-200 hover:opacity-90 hover:scale-105"
            )}
          >
            Allow
          </button>
          <button
            onClick={handleDecline}
            className={cn(
              "w-[80px] h-[30px] rounded-[20px] bg-muted text-muted-foreground font-semibold",
              "transition-all duration-200 hover:bg-muted/80 hover:scale-105"
            )}
          >
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  );
}