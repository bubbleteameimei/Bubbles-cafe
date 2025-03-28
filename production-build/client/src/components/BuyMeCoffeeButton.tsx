import { useState } from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
  
  const handleTip = () => {
    window.open("https://paystack.com/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
    setIsOpen(false);
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

      {/* Donation Modal - Using the Dialog component */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle id="donation-title" className="text-xl font-semibold text-center">
              Would you like to support me? ☕💖
            </DialogTitle>
            
            <DialogDescription id="donation-description" className="text-center">
              Your support means the world! Every coffee keeps my creativity brewing. ✨
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-5">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full text-center"
            >
              <Button
                onClick={handleTip}
                className="px-6 py-3 text-lg font-medium w-full sm:w-auto"
                size="lg"
                aria-label="Support with a donation"
              >
                Yes, I'd love to
              </Button>
            </motion.div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" />
        </DialogContent>
      </Dialog>
    </>
  );
};