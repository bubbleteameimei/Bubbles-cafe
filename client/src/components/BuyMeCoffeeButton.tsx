import { useState, useRef } from "react";
import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
} from "@/components/ui/dialog";
import "@/components/donation-cta.css";

export const BuyMeCoffeeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  
  const handleTip = () => {
    // Prevent multiple clicks
    if (isProcessing) return;
    
    setIsProcessing(true);
    window.open("https://paystack.shop/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
    setIsOpen(false);
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleAnimatedTip = (e: any) => {
    e?.preventDefault?.();
    if (isProcessing || isAnimating) return;

    setIsProcessing(true);
    setIsAnimating(true);

    const anim = animRef.current;
    const btn = btnRef.current;
    try {
      anim?.setAttribute('aria-hidden', 'false');
      anim?.setAttribute('aria-live', 'polite');
    } catch {}

    const PAYSTACK_URL = "https://paystack.shop/pay/z7fmj9rge1";
    let opened = false;

    const openCheckout = () => {
      if (opened) return;
      opened = true;
      try {
        window.location.href = PAYSTACK_URL; // redirect in same tab to avoid popup blockers
      } catch {}
      setIsOpen(false);
      setIsProcessing(false);
      setIsAnimating(false);
      try { btn?.focus(); } catch {}
    };

    if (anim) {
      const onEnd = () => {
        openCheckout();
        anim.removeEventListener('animationend', onEnd);
      };
      anim.addEventListener('animationend', onEnd);
      window.setTimeout(openCheckout, 1300);
    } else {
      window.setTimeout(openCheckout, 1100);
    }
  };

  // Steam particles animation
  const steamVariants = {
    initial: { 
      y: 0, 
      x: 0, 
      opacity: 0.7, 
      scale: 0.8 
    },
    animate: { 
      y: -15, 
      x: [0, 2, -2, 0], 
      opacity: 0, 
      scale: 1.2,
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        repeatType: "loop" as const,
        ease: "easeOut" 
      } 
    }
  };

  // Floating hearts animation
  const heartVariants = {
    initial: { 
      scale: 0,
      y: 0,
      opacity: 0 
    },
    animate: { 
      scale: [0, 1, 0],
      y: -20,
      opacity: [0, 1, 0],
      transition: { 
        duration: 2, 
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeOut" 
      } 
    }
  };

  return (
    <>
      {/* Main Button */}
      <motion.div
        whileHover={{ 
          scale: 1.1,
          rotate: [0, -1, 1, 0],
          transition: { 
            scale: { type: "spring", stiffness: 300, damping: 10 },
            rotate: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
          }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative"
        style={{ contain: 'layout paint', isolation: 'isolate' }}
      >
        {/* Cute sparkles around the button when hovered */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360,
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 30]
                  }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.2 
                  }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full pointer-events-none"
                  style={{ 
                    filter: 'drop-shadow(0 0 4px rgba(255, 255, 0, 0.8))' 
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Buy me a coffee"
          className="relative px-8 py-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          size="lg"
        >
          {/* Animated gradient background */}
          <motion.div
            animate={{ 
              background: [
                "linear-gradient(45deg, rgba(245, 158, 11, 0.3), rgba(249, 115, 22, 0.3))",
                "linear-gradient(45deg, rgba(249, 115, 22, 0.3), rgba(245, 158, 11, 0.3))"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 rounded-full"
          />
          
          {/* Steam particles */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={steamVariants}
                initial="initial"
                animate="animate"
                style={{ 
                  animationDelay: `${i * 0.5}s` 
                }}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
              />
            ))}
          </div>

          {/* Floating hearts when hovered */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={heartVariants}
                initial="initial"
                animate="animate"
                className="absolute top-0 right-2 pointer-events-none"
              >
                <Heart className="w-3 h-3 text-pink-300 fill-current" />
              </motion.div>
            )}
          </AnimatePresence>

          <span className="relative flex items-center gap-3 text-base font-medium leading-none z-10">
            <motion.div 
              animate={{ 
                y: [0, -4, 0],
                rotate: [0, 10, -10, 0]
              }} 
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="relative inline-flex items-center"
            >
              <Coffee className="w-6 h-6" />
              {/* Coffee steam effect (doesn't affect layout) */}
              <motion.div
                animate={{ 
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.8, 1.1, 0.8]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white/30 rounded-full blur-sm"
              />
            </motion.div>
            
            <motion.span
              animate={{ 
                color: isHovered ? "#fef3c7" : "#ffffff"
              }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center"
            >
              Buy me a coffee
            </motion.span>
          </span>
        </Button>
      </motion.div>

      {/* Donation Modal - Using the Dialog component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:max-w-md text-center overflow-hidden"
          aria-labelledby="donation-title"
          aria-describedby="donation-description"
        >
          {/* Cute sparkles in the background */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  x: Math.random() * 300,
                  y: Math.random() * 200,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  repeatType: "loop"
                }}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{ 
                  filter: 'drop-shadow(0 0 3px rgba(255, 255, 0, 0.6))' 
                }}
              />
            ))}
          </div>

          <DialogHeader className="relative z-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            >
              <DialogTitle id="donation-title" className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                >
                  ☕
                </motion.span>
                Would you like to support me? 
                <motion.span
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  💖
                </motion.span>
              </DialogTitle>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            >
              <DialogDescription id="donation-description" className="text-center">
                Your support means the world! Every tip keeps my creativity brewing and helps me share more stories.✨
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          
          <motion.div 
            className="mt-5 relative z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="w-full flex justify-center">
              <div
                className="w-full text-center"
              >
                {isAnimating ? (
                  <div className="donation-cta">

                    <div
                      id="atm-animation"
                      ref={animRef}
                      className={`bmc-container ${isAnimating ? 'active' : ''} ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
                      aria-label="Support with a donation"
                      aria-hidden={!isAnimating}
                      aria-live={isAnimating ? "polite" : undefined}
                    >
                      <div className="bmc-left">
                        <div className="bmc-card">
                          <div className="card-line"></div>
                          <div className="buttons"></div>
                        </div>
                        <div className="bmc-post">
                          <div className="post-line"></div>
                          <div className="screen">
                            <div className="dollar">$</div>
                          </div>
                          <div className="numbers"></div>
                          <div className="numbers-line2"></div>
                        </div>
                      </div>
                      <div className="bmc-right"></div>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full text-center"
                  >
                    <Button
                      id="coffee-btn"
                      ref={btnRef}
                      onClick={handleAnimatedTip}
                      disabled={isProcessing}
                      className="px-8 py-4 text-lg font-medium w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                      size="lg"
                      aria-label="Support with a donation"
                    >
                      {/* Animated shine effect */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        style={{ transform: "skewX(-25deg)" }}
                      />
                      
                      <span className="relative flex items-center gap-2">
                        {isProcessing ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              ⏳
                            </motion.span>
                            Opening payment...
                          </>
                        ) : (
                          <>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                            >
                              🥰
                            </motion.span>
                            Yes, I'd love to!
                            <motion.span
                              animate={{ y: [0, -2, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                            >
                              💝
                            </motion.span>
                          </>
                        )}
                      </span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
          
          <div className="mt-6 flex justify-center">
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors opacity-80 hover:opacity-100"
              >
                ×
              </button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};