
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const COOKIE_CONSENT_KEY = 'cookieConsent';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="max-w-[300px] w-full mx-auto bg-card rounded-lg shadow-xl border border-border/50 p-6 space-y-4">
        <motion.div 
          className="flex justify-center"
          initial={{ rotate: -10 }}
          animate={{ rotate: 10 }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <div className="relative w-[80px] h-[80px] bg-[#d4a064] rounded-full border-4 border-[#8b5e34] overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-[#3a1f0f] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: i * 0.05,
                  duration: 0.2,
                  ease: "easeOut"
                }}
                style={{
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">We use cookies</h2>
          <p className="text-sm text-muted-foreground">
            This website uses cookies to ensure you get the best experience on our site.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleAccept}
            className={cn(
              "px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium",
              "transition-all duration-200 hover:opacity-90 hover:scale-105"
            )}
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className={cn(
              "px-6 py-2 rounded-full bg-muted text-muted-foreground font-medium",
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
