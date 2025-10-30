import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Coffee, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import "@/components/donation-cta.css";


interface TipPopupProps {
  autoShow?: boolean; // For reader page auto-popup
  triggerContent?: React.ReactNode; // Custom trigger content
}

export function TipPopup({ autoShow = false, triggerContent }: TipPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (autoShow) {
      const lastShown = localStorage.getItem('lastTipPopupShown');
      const showAgain = !lastShown || Date.now() - parseInt(lastShown) > 60 * 60 * 1000; // 1 hour

      if (showAgain) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('lastTipPopupShown', Date.now().toString());
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
      }
    }
    return () => {};
  }, [autoShow]);

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

    const PAYSTACK_URL = 'https://paystack.shop/pay/z7fmj9rge1';
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerContent ? (
        <DialogTrigger asChild>
          {triggerContent}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <button className="buy-coffee-btn">
            <Coffee className="h-5 w-5" />
            <span>Buy me a coffee</span>
          </button>
        </DialogTrigger>
      )}
      <DialogContent 
        className="sm:max-w-md text-center overflow-hidden"
        aria-labelledby="tip-popup-title"
        aria-describedby="tip-popup-description"
      >
        <DialogHeader className="relative z-10">
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 200, damping: 20 }}
          >
            <DialogTitle id="tip-popup-title" className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
              >
                ☕
              </motion.span>
              Would you like to support me?
              <motion.span
                animate={{ scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse" }}
              >
                💖
              </motion.span>
            </DialogTitle>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 20 }}
          >
            <DialogDescription id="tip-popup-description" className="text-center">
              Your support means the world! Every tip keeps my creativity brewing and helps me share more stories.✨
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div 
          className="mt-5 relative z-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
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
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
                  whileTap={{ scale: 0.96 }}
                  className="w-full text-center"
                >
                  <Button
                    id="coffee-btn"
                    ref={btnRef}
                    onClick={handleAnimatedTip}
                    disabled={isProcessing}
                    className="px-8 py-4 text-lg font-medium w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Support with a donation"
                  >
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ transform: "skewX(-25deg)" }}
                    />
                    <span className="relative flex items-center gap-2 justify-center">
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
  );
}