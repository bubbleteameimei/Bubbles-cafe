
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
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="max-w-[300px] w-full mx-auto bg-[#d4a064] rounded-full shadow-xl border-4 border-[#8b5e34] p-6 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-[#8b5e34] rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
              }}
            />
          ))}
        </div>
        
        <div className="relative">
          <h2 className="text-xl font-bold text-[#4a2f1a] text-center mb-2">We use cookies</h2>
          <p className="text-sm text-[#4a2f1a] text-center mb-4">
            This website uses cookies to ensure you get the best experience on our site.
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={handleAccept}
              className={cn(
                "px-6 py-2 rounded-full bg-[#8b5e34] text-white font-medium",
                "transition-all duration-200 hover:bg-[#6b4728] hover:scale-105 shadow-md"
              )}
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className={cn(
                "px-6 py-2 rounded-full bg-[#4a2f1a] text-white font-medium",
                "transition-all duration-200 hover:bg-[#362218] hover:scale-105 shadow-md"
              )}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
