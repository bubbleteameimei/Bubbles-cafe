import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useCookieConsent } from '@/hooks/use-cookie-consent';

// Cookie animation variants
const cookieDropVariants = {
  initial: (i: number) => ({
    y: -20,
    x: i * 30 - 50,
    opacity: 0,
    rotate: Math.random() * 180 - 90,
    scale: 0.5,
  }),
  animate: (i: number) => ({
    y: 0,
    opacity: 1,
    rotate: Math.random() * 30 - 15,
    scale: 0.7 + Math.random() * 0.4,
    transition: {
      duration: 0.5 + Math.random() * 0.5,
      delay: 0.1 * i,
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  })
};

// Mini cookie component for animations
const MiniCookie = ({ index }: { index: number }) => {
  return (
    <motion.div
      custom={index}
      variants={cookieDropVariants}
      initial="initial"
      animate="animate"
      className="absolute"
      style={{
        top: `${Math.random() * 80}%`,
        left: `${index * 20}%`,
        zIndex: 10
      }}
    >
      <div className="relative">
        <svg 
          className="w-[30px] h-[30px]" 
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
      </div>
    </motion.div>
  );
};

export function CookieConsent() {
  const { 
    showConsentBanner, 
    acceptAll, 
    acceptEssentialOnly,
    openPreferencesModal,
    isPreferencesModalOpen,
    closePreferencesModal
  } = useCookieConsent();
  
  // Steam animation state
  const [showSteam, setShowSteam] = useState(false);
  
  // Cookie bite animation state
  const [isBitten, setIsBitten] = useState(false);
  
  // Trigger steam animation periodically
  useEffect(() => {
    if (showConsentBanner) {
      const steamInterval = setInterval(() => {
        setShowSteam(true);
        setTimeout(() => setShowSteam(false), 2000);
      }, 4000);
      
      return () => clearInterval(steamInterval);
    }
    return () => {};
  }, [showConsentBanner]);

  if (!showConsentBanner) return null;

  const handleAcceptAll = () => {
    // Bite cookie animation before accepting
    setIsBitten(true);
    setTimeout(() => {
      acceptAll();
    }, 600);
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
        className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm overflow-hidden"
        role="dialog"
        aria-labelledby="cookie-consent-title"
      >
        {/* Falling cookies animation */}
        {Array.from({ length: 6 }).map((_, i) => (
          <MiniCookie key={i} index={i} />
        ))}
        
        <div className="max-w-md w-full mx-auto bg-gradient-to-b from-[#F5F5DC] to-[#E8D9B5] rounded-xl shadow-xl border-2 border-[#C4A484] p-6 space-y-4 relative">
          {/* Steam animation */}
          <AnimatePresence>
            {showSteam && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 0.8, 0], y: [-5, -20, -40] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, times: [0, 0.4, 1] }}
                  className="absolute -top-2 left-1/4 w-2 h-8 bg-white/40 rounded-full blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 0.6, 0], y: [-5, -25, -45] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.3, delay: 0.3, times: [0, 0.4, 1] }}
                  className="absolute -top-2 left-1/2 w-3 h-10 bg-white/30 rounded-full blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: [0, 0.7, 0], y: [-5, -15, -35] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, delay: 0.5, times: [0, 0.4, 1] }}
                  className="absolute -top-2 left-3/4 w-2 h-6 bg-white/40 rounded-full blur-sm"
                />
              </>
            )}
          </AnimatePresence>
          
          <div className="flex justify-center relative">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="relative"
            >
              <motion.svg 
                className="w-[80px] h-[80px] drop-shadow-lg" 
                viewBox="0 0 122.88 122.25"
                animate={isBitten ? { scale: [1, 0.9, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.path 
                  d={isBitten ? 
                    "M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z M40,20 A10,15 0 1,1 38,45" 
                    : "M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z"
                  }
                  className="fill-[#E8B88C]"
                />
                <circle cx="45" cy="25" r="9" className="fill-[#6F4E37]" />
                <circle cx="92" cy="42" r="8" className="fill-[#6F4E37]" />
                <circle cx="35" cy="68" r="10" className="fill-[#6F4E37]" />
                <circle cx="73" cy="55" r="7" className="fill-[#6F4E37]" />
                <circle cx="58" cy="82" r="8" className="fill-[#6F4E37]" />
                <circle cx="25" cy="45" r="7" className="fill-[#6F4E37]" />
                <circle cx="82" cy="75" r="6" className="fill-[#6F4E37]" />
              </motion.svg>
              
              {/* Cookie crumbs animation when bitten */}
              <AnimatePresence>
                {isBitten && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, x: -15, y: 15 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute top-1/3 left-1/3 w-2 h-2 rounded-full bg-[#E8B88C]"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, x: -20, y: 5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute top-1/3 left-1/3 w-1 h-1 rounded-full bg-[#E8B88C]"
                    />
                    <motion.div
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, x: -10, y: 20 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-[#E8B88C]"
                    />
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="text-center space-y-3">
            <h2 id="cookie-consent-title" className="text-2xl font-bold text-[#6F4E37]">Fresh Baked Cookies!</h2>
            <p className="text-sm text-[#8B5A2B]">
              Our website uses cookies to enhance your browsing experience. They're warm, delicious, and help make your visit even better!
              <Link href="/legal/cookie-policy" className="block mt-1 underline hover:text-[#6F4E37] transition-colors">
                View our cookie recipe (policy)
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button 
              onClick={handleAcceptAll}
              className="w-full py-2.5 font-semibold shadow-lg bg-[#8B5A2B] hover:bg-[#6F4E37] hover:scale-105 transition-all text-white rounded-lg"
            >
              Take a bite (Accept All)
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={handleAcceptEssential}
                className="flex-1 py-2 font-medium border border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#F5F5DC] hover:scale-105 transition-all rounded-lg"
              >
                Just a small taste (Essential Only)
              </button>
              <button 
                onClick={handleCustomize}
                className="flex-1 underline underline-offset-4 text-[#8B5A2B] hover:text-[#6F4E37] hover:scale-105 transition-all"
              >
                Choose ingredients (Customize)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-[#F5F5DC] to-[#E8D9B5] rounded-xl shadow-xl border-2 border-[#C4A484] p-6 max-w-lg w-full mx-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-2 right-3 opacity-60">
              <svg className="w-[40px] h-[40px]" viewBox="0 0 122.88 122.25">
                <path 
                  d="M101.77,49.38c2.09,3.1,4.37,5.11,6.86,5.78c2.45,0.66,5.32,0.06,8.7-2.01c1.36-0.84,3.14-0.41,3.97,0.95c0.28,0.46,0.42,0.96,0.43,1.47c0.13,1.4,0.21,2.82,0.24,4.26c0.03,1.46,0.02,2.91-0.05,4.35h0v0c0,0.13-0.01,0.26-0.03,0.38c-0.91,16.72-8.47,31.51-20,41.93c-11.55,10.44-27.06,16.49-43.82,15.69v0.01h0c-0.13,0-0.26-0.01-0.38-0.03c-16.72-0.91-31.51-8.47-41.93-20C5.31,90.61-0.73,75.1,0.07,58.34H0.07v0c0-0.13,0.01-0.26,0.03-0.38C1,41.22,8.81,26.35,20.57,15.87C32.34,5.37,48.09-0.73,64.85,0.07V0.07h0c1.6,0,2.89,1.29,2.89,2.89c0,0.4-0.08,0.78-0.23,1.12c-1.17,3.81-1.25,7.34-0.27,10.14c0.89,2.54,2.7,4.51,5.41,5.52c1.44,0.54,2.2,2.1,1.74,3.55l0.01,0c-1.83,5.89-1.87,11.08-0.52,15.26c0.82,2.53,2.14,4.69,3.88,6.4c1.74,1.72,3.9,3,6.39,3.78c4.04,1.26,8.94,1.18,14.31-0.55C99.73,47.78,101.08,48.3,101.77,49.38L101.77,49.38z" 
                  className="fill-[#D2A76C]" 
                />
                <circle cx="45" cy="25" r="5" className="fill-[#6F4E37]" />
                <circle cx="92" cy="42" r="4" className="fill-[#6F4E37]" />
                <circle cx="35" cy="68" r="6" className="fill-[#6F4E37]" />
              </svg>
            </div>
            
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-[#6F4E37]">Cookie Recipe Builder</h2>
              <p className="text-[#8B5A2B]">
                Choose your cookie ingredients! Essential ingredients cannot be removed as they're needed for the basic cookie recipe to work.
              </p>
            </div>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#F5F5DC]/50 border border-[#D2A76C]/30">
                <div className="space-y-0.5">
                  <label className="text-base font-semibold text-[#6F4E37]">Essential Ingredients</label>
                  <p className="text-sm text-[#8B5A2B]">The base of our cookie recipe - can't make cookies without these!</p>
                </div>
                <input type="checkbox" checked disabled className="rounded-full bg-[#8B5A2B]" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5DC]/50 transition-colors border border-transparent hover:border-[#D2A76C]/30">
                <div className="space-y-0.5">
                  <label className="text-base font-semibold text-[#6F4E37]">Chocolate Chips (Functional)</label>
                  <p className="text-sm text-[#8B5A2B]">Makes your cookie experience richer and more flavorful</p>
                </div>
                <input type="checkbox" className="rounded-full" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5DC]/50 transition-colors border border-transparent hover:border-[#D2A76C]/30">
                <div className="space-y-0.5">
                  <label className="text-base font-semibold text-[#6F4E37]">Sprinkles (Analytics)</label>
                  <p className="text-sm text-[#8B5A2B]">Helps us see which cookies are most popular with visitors</p>
                </div>
                <input type="checkbox" className="rounded-full" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5DC]/50 transition-colors border border-transparent hover:border-[#D2A76C]/30">
                <div className="space-y-0.5">
                  <label className="text-base font-semibold text-[#6F4E37]">Extra Butter (Performance)</label>
                  <p className="text-sm text-[#8B5A2B]">Makes everything run smoother with the perfect texture</p>
                </div>
                <input type="checkbox" className="rounded-full" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5DC]/50 transition-colors border border-transparent hover:border-[#D2A76C]/30">
                <div className="space-y-0.5">
                  <label className="text-base font-semibold text-[#6F4E37]">Special Flavors (Marketing)</label>
                  <p className="text-sm text-[#8B5A2B]">Adds special flavors to make your cookie experience personalized</p>
                </div>
                <input type="checkbox" className="rounded-full" />
              </div>
            </div>
            
            <div className="flex justify-between flex-wrap gap-2 pt-2 border-t border-[#D2A76C]/30">
              <div className="flex gap-2 flex-wrap">
                <button 
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 border border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#F5F5DC] hover:text-[#6F4E37] rounded-lg"
                >
                  Basic Recipe
                </button>
                <button 
                  onClick={handleAcceptAll}
                  className="px-4 py-2 border border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#F5F5DC] hover:text-[#6F4E37] rounded-lg"
                >
                  Deluxe Recipe
                </button>
              </div>
              <button 
                onClick={() => closePreferencesModal()}
                className="px-4 py-2 bg-[#8B5A2B] hover:bg-[#6F4E37] text-white rounded-lg"
              >
                Bake My Cookies
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}