import { useState } from "react";
import { Coffee, Heart } from "lucide-react";
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

interface SupportWritingCardProps {
  className?: string;
}

export const SupportWritingCard = ({ className = "" }: SupportWritingCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleTip = () => {
    window.open("https://paystack.com/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      {/* Support My Writing Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-background/30 backdrop-blur-md rounded-xl border border-border/30 p-6 text-center shadow-lg"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart className="w-5 h-5 text-primary/80" />
          <h3 className="text-lg font-medium text-foreground tracking-tight">
            Support My Writing
          </h3>
          <Heart className="w-5 h-5 text-primary/80" />
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          If you're enjoying these stories, consider buying me a coffee! Your support helps me create more engaging content.
        </p>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-primary/80 hover:bg-primary text-primary-foreground font-medium py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <motion.div 
              animate={{ y: [0, -3, 0] }} 
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
              className="inline-flex items-center"
            >
              <Coffee className="w-4 h-4 mr-2" />
            </motion.div>
            Buy me a coffee ☕
          </Button>
        </motion.div>
        
        <p className="text-xs text-muted-foreground/70 mt-3">
          Powered by Paystack • Secure Payment
        </p>
      </motion.div>

      {/* Donation Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md text-center bg-background/95 backdrop-blur-md border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              Support My Writing
              <Coffee className="w-5 h-5 text-primary" />
            </DialogTitle>
            
            <DialogDescription className="text-center text-muted-foreground">
              Your support means the world! Every coffee keeps my creativity brewing and helps me share more stories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={handleTip}
                className="w-full px-6 py-3 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
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
    </div>
  );
};