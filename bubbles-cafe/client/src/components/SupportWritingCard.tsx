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

interface SupportWritingCardProps {
  className?: string;
}

export const SupportWritingCard = ({ className = "" }: SupportWritingCardProps) => {
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
      y: -12, 
      x: [0, 1, -1, 0], 
      opacity: 0, 
      scale: 1.1,
      transition: { 
        duration: 1.8, 
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
      y: -15,
      opacity: [0, 1, 0],
      transition: { 
        duration: 1.8, 
        repeat: Infinity,
        repeatDelay: 0.8,
        ease: "easeOut" 
      } 
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Support My Writing Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-md rounded-xl border border-border/30 p-6 text-center shadow-lg relative overflow-hidden"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Cute sparkles around the card when hovered */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    rotate: 360,
                    x: [0, Math.cos(i * 90 * Math.PI / 180) * 25],
                    y: [0, Math.sin(i * 90 * Math.PI / 180) * 25]
                  }}
                  exit={{ scale: 0 }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    delay: i * 0.15 
                  }}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full pointer-events-none"
                  style={{ 
                    filter: 'drop-shadow(0 0 3px rgba(255, 255, 0, 0.7))' 
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-center gap-2 mb-3 relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </motion.div>
          <h3 className="text-lg font-medium text-foreground tracking-tight">
            Support My Writing
          </h3>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          >
            <Heart className="w-5 h-5 text-pink-500" />
          </motion.div>

          {/* Floating hearts when hovered */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                variants={heartVariants}
                initial="initial"
                animate="animate"
                className="absolute top-0 right-0 pointer-events-none"
              >
                <Heart className="w-3 h-3 text-pink-300 fill-current" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          If you're enjoying these stories, consider buying me a coffee! Your support helps me create more engaging content.
        </p>
        
        <motion.div
          whileHover={{ 
            scale: 1.05,
            rotate: [0, -0.5, 0.5, 0],
            transition: { 
              scale: { type: "spring", stiffness: 300, damping: 10 },
              rotate: { duration: 0.4, repeat: Infinity, repeatType: "reverse" }
            }
          }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg relative overflow-hidden"
          >
            {/* Animated gradient background */}
            <motion.div
              animate={{ 
                background: [
                  "linear-gradient(45deg, rgba(236, 72, 153, 0.3), rgba(147, 51, 234, 0.3))",
                  "linear-gradient(45deg, rgba(147, 51, 234, 0.3), rgba(236, 72, 153, 0.3))"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 rounded-lg"
            />

            {/* Steam particles */}
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 pointer-events-none">
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={i}
                  variants={steamVariants}
                  initial="initial"
                  animate="animate"
                  style={{ 
                    animationDelay: `${i * 0.4}s` 
                  }}
                  className="absolute w-0.5 h-0.5 bg-white/50 rounded-full"
                />
              ))}
            </div>

            <span className="relative flex items-center justify-center gap-2 z-10">
              <motion.div 
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, 8, -8, 0]
                }} 
                transition={{ 
                  duration: 1.2, 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <Coffee className="w-4 h-4" />
                {/* Coffee steam effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/20 rounded-full blur-sm"
                />
              </motion.div>
              Buy me a coffee ☕
            </span>
          </Button>
        </motion.div>
        
        <p className="text-xs text-muted-foreground/70 mt-3">
          Powered by Paystack • Secure Payment
        </p>
      </motion.div>

      {/* Donation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md text-center bg-background/95 backdrop-blur-md border border-border/50 overflow-hidden">
          {/* Cute sparkles in the background */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.5, 0],
                  x: Math.random() * 250,
                  y: Math.random() * 150,
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  repeatType: "loop"
                }}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{ 
                  filter: 'drop-shadow(0 0 2px rgba(255, 255, 0, 0.5))' 
                }}
              />
            ))}
          </div>

          <DialogHeader className="relative z-10">
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            >
              <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Coffee className="w-5 h-5 text-pink-500" />
                </motion.div>
                Support My Writing
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 4, -4, 0]
                  }}
                  transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Heart className="w-5 h-5 text-pink-500" />
                </motion.div>
              </DialogTitle>
            </motion.div>
            
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            >
              <DialogDescription className="text-center text-muted-foreground">
                Your support means the world! Every coffee keeps my creativity brewing and helps me share more stories.
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="inline-block ml-1"
                >
                  ✨
                </motion.span>
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          
          <motion.div 
            className="mt-6 space-y-4 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.06,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
              }}
              whileTap={{ scale: 0.96 }}
              className="w-full"
            >
              <Button
                onClick={handleTip}
                className="w-full px-8 py-4 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg relative overflow-hidden"
                size="lg"
                aria-label="Support with a donation"
              >
                {/* Animated shine effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  style={{ transform: "skewX(-20deg)" }}
                />
                
                <span className="relative flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse" }}
                  >
                    🥰
                  </motion.span>
                  Yes, I'd love to!
                  <motion.span
                    animate={{ y: [0, -1.5, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity, repeatType: "reverse" }}
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
    </div>
  );
};