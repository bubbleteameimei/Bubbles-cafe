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
                  <style>{`
                    .donation-cta {
                      --background: #33837e;
                      --left-side: #5de2a3;
                      --card: #c7ffbc;
                      --card-line: #80ea69;
                      --button-color-3: #26850e;
                      --button-color-2: #379e1f;
                      --button-color-1: #56be3e;
                      --post: #dddde0;
                      --numbers: #838183;
                      --numbers-2: #aaa9ab;
                      --post-line: #757375;
                      --post-line2: #545354;
                      --dollar: #4b953b;
                    }
                    .donation-cta .bmc-container {
                      background-color: #ffffff;
                      display: flex;
                      width: clamp(340px, 80vw, 560px);
                      height: 120px;
                      position: relative;
                      border-radius: 6px;
                      margin: 0 auto;
                      transition: 0.3s ease-in-out;
                      overflow: hidden;
                    }
                    .donation-cta .bmc-container::before {
                      width: 200vw;
                      position: absolute;
                      top: 0;
                      left: -100vw;
                      height: 100%;
                      content: "";
                    }
                    .donation-cta .bmc-container:hover,
                    .donation-cta .bmc-container.active {
                      transform: scale(1.02);
                    }
                    .donation-cta .bmc-left {
                      background-color: var(--left-side);
                      width: 130px;
                      height: 120px;
                      border-radius: 4px;
                      position: relative;
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      cursor: pointer;
                      transition: 0.3s;
                      flex-shrink: 0;
                      overflow: hidden;
                    }
                    .donation-cta .bmc-right {
                      width: calc(100% - 130px);
                      display: flex;
                      align-items: center;
                      overflow: hidden;
                      cursor: pointer;
                      justify-content: center;
                      gap: 10px;
                      white-space: nowrap;
                      transition: 0.3s;
                      background-color: transparent;
                    }
                    .donation-cta .bmc-right:hover {
                      background-color: #f9f7f9;
                    }
                    .donation-cta .bmc-card {
                      width: 70px;
                      height: 46px;
                      background-color: var(--card);
                      border-radius: 6px;
                      position: absolute;
                      display: flex;
                      z-index: 10;
                      flex-direction: column;
                      align-items: center;
                      box-shadow: 9px 9px 9px -2px rgba(77, 200, 143, 0.72);
                    }
                    .donation-cta .card-line {
                      width: 65px;
                      height: 13px;
                      background-color: var(--card-line);
                      border-radius: 2px;
                      margin-top: 7px;
                    }
                    @media only screen and (max-width: 480px) {
                      .donation-cta .bmc-container {
                        transform: scale(0.7);
                      }
                      .donation-cta .bmc-container:hover,
                      .donation-cta .bmc-container.active {
                        transform: scale(0.74);
                      }
                    }
                    .donation-cta .buttons {
                      width: 8px;
                      height: 8px;
                      background-color: var(--button-color-2);
                      box-shadow: 0 -10px 0 0 var(--button-color-3), 0 10px 0 0 var(--button-color-1);
                      border-radius: 50%;
                      margin-top: 5px;
                      transform: rotate(90deg);
                      margin: 10px 0 0 -30px;
                    }
                    .donation-cta .bmc-container:hover .bmc-card,
                    .donation-cta .bmc-container.active .bmc-card {
                      animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
                    }
                    .donation-cta .bmc-container:hover .bmc-post,
                    .donation-cta .bmc-container.active .bmc-post {
                      animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
                    }
                    @keyframes slide-top {
                      0% { transform: translateY(0); }
                      50% { transform: translateY(-70px) rotate(90deg); }
                      60% { transform: translateY(-70px) rotate(90deg); }
                      100% { transform: translateY(-8px) rotate(90deg); }
                    }
                    .donation-cta .bmc-post {
                      width: 63px;
                      height: 75px;
                      background-color: var(--post);
                      position: absolute;
                      z-index: 11;
                      bottom: 10px;
                      top: 120px;
                      border-radius: 6px;
                      overflow: hidden;
                    }
                    .donation-cta .post-line {
                      width: 47px;
                      height: 9px;
                      background-color: var(--post-line2);
                      position: absolute;
                      border-radius: 0px 0px 3px 3px;
                      right: 8px;
                      top: 8px;
                    }
                    .donation-cta .post-line::before {
                      content: "";
                      position: absolute;
                      width: 47px;
                      height: 9px;
                      background-color: var(--post-line);
                      top: -8px;
                      left: 0;
                    }
                    .donation-cta .screen {
                      width: 47px;
                      height: 23px;
                      background-color: #ffffff;
                      position: absolute;
                      top: 22px;
                      right: 8px;
                      border-radius: 3px;
                    }
                    .donation-cta .numbers {
                      width: 12px;
                      height: 12px;
                      background-color: var(--numbers);
                      box-shadow: 0 -18px 0 0 var(--numbers), 0 18px 0 0 var(--numbers);
                      border-radius: 2px;
                      position: absolute;
                      transform: rotate(90deg);
                      left: 25px;
                      top: 52px;
                    }
                    .donation-cta .numbers-line2 {
                      width: 12px;
                      height: 12px;
                      background-color: var(--numbers-2);
                      box-shadow: 0 -18px 0 0 var(--numbers-2), 0 18px 0 0 var(--numbers-2);
                      border-radius: 2px;
                      position: absolute;
                      transform: rotate(90deg);
                      left: 25px;
                      top: 68px;
                    }
                    @keyframes slide-post {
                      50% { transform: translateY(0); }
                      100% { transform: translateY(-70px); }
                    }
                    .donation-cta .dollar {
                      position: absolute;
                      font-size: 16px;
                      width: 100%;
                      left: 0;
                      top: 0;
                      color: var(--dollar);
                      text-align: center;
                    }
                    .donation-cta .bmc-container:hover .dollar,
                    .donation-cta .bmc-container.active .dollar {
                      animation: fade-in-fwd 0.3s 1s backwards;
                    }
                    @keyframes fade-in-fwd {
                      0% { opacity: 0; transform: translateY(-5px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>

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