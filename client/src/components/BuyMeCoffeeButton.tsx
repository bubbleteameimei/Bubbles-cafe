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
  
  const handleTip = () => {
    window.open("https://paystack.com/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
    setIsOpen(false);
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
        repeatType: "loop",
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
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative"
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
          className="relative px-8 py-5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
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

          <span className="relative flex items-center gap-3 text-base font-medium z-10">
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
              className="relative"
            >
              <Coffee className="w-6 h-6" />
              {/* Coffee steam effect */}
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
            >
              Buy me a coffee
            </motion.span>
          </span>
        </Button>
      </motion.div>

      {/* Donation Modal - Using the Dialog component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md text-center overflow-hidden">
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
                Your support means the world! Every coffee keeps my creativity brewing. 
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ✨
                </motion.span>
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          
          <motion.div 
            className="mt-5 relative z-10"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.08,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full text-center"
            >
              <Button
                onClick={handleTip}
                className="px-8 py-4 text-lg font-medium w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg relative overflow-hidden"
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
                </span>
              </Button>
            </motion.div>
          </motion.div>
          
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" />
        </DialogContent>
      </Dialog>
    </>
  );
};