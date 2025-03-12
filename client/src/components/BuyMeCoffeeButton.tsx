import { useState } from "react";
import { Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const BuyMeCoffeeButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleTip = () => {
    window.open("https://paystack.com/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Main Button */}
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Buy me a coffee"
          className="relative px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-2xl transition-all duration-300"
          size="lg"
        >
          <motion.div
            initial={{ opacity: 0.5, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 bg-primary-foreground/15 rounded-full"
          />
          <span className="relative flex items-center gap-3 text-xl font-semibold">
            <motion.div 
              animate={{ y: [0, -3, 0] }} 
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            >
              <Coffee className="w-6 h-6" />
            </motion.div>
            Buy me a coffee
          </span>
        </Button>
      </motion.div>

      {/* Cute Donation Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-background p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Cute Message */}
              <h2 className="text-xl font-semibold text-foreground mb-3">Would you like to support me? 💖</h2>
              <p className="text-muted-foreground mb-5">
               Your support means more than words can say. Thank you for your generosity. ✨
              </p>

              {/* Donate Button */}
              <motion.button
                onClick={() => {
                  handleTip(); // Paystack only opens when this button is clicked
                  setIsOpen(false); // Close modal after clicking
                }}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-md transition-all duration-300 text-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -6, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                Yes, I'd love to!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};