import { useState } from "react";
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

export const BuyMeCoffeeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ctaActive, setCtaActive] = useState(false);
  
  const handleTip = () => {
    // Prevent multiple clicks
    if (isProcessing) return;
    
    setIsProcessing(true);
    window.open("https://paystack.shop/pay/z7fmj9rge", "_blank", "noopener,noreferrer");
    setIsOpen(false);
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleAnimatedTip = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setCtaActive(true);
    // Let the animation play before opening Paystack
    setTimeout(() => {
      try {
        window.open("https://paystack.shop/pay/z7fmj9rge", "_blank", "noopener,noreferrer");
      } catch {}
      setIsOpen(false);
    }, 1100);
    // Reset states after the animation finishes
    setTimeout(() => {
      setIsProcessing(false);
      setCtaActive(false);
    }, 2000);
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
              {!ctaActive ? (
                <motion.div
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full text-center"
                >
                  <Button
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
              ) : (
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
                    .donation-cta .arrow {
                      width: 20px;
                      height: 20px;
                      margin-right: 0;
                      flex-shrink: 0;
                    }
                    .donation-cta .new {
                      font-size: 23px;
                      margin-left: 20px;
                      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
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
                      .donation-cta .new {
                        font-size: 18px;
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
                    className={`bmc-container ${ctaActive ? 'active' : ''} ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
                    role="button"
                    tabIndex={0}
                    aria-label="Support with a donation"
                    onClick={handleAnimatedTip}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnimatedTip(); } }}
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
                    <div className="bmc-right">
                      <svg className="arrow" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 451.846 451.847" aria-hidden="true" focusable="false">
                        <path d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z" fill="#cfcfcf"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          <div className="mt-6 flex justify-center">
           <DialogClose asChild>
             <button
                type="button"
                aria-label="Close"
                className="px-3 py-1.5 rounded-full text-xs border border-border/60 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-colors opacity-80 hover:opacity-100"
              >
                Close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};