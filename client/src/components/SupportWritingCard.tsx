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

interface SupportWritingCardProps {
  className?: string;
  authorId?: number; // recipient author id for logging tips
}

export const SupportWritingCard = ({ className = "", authorId }: SupportWritingCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleTip = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Log tip intent to backend (pending status) when authorId available
    try {
      if (typeof authorId === 'number' && Number.isFinite(authorId) && authorId > 0) {
        await fetch('/api/tips', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            authorId,
            amount: '0',
            currency: 'USD',
            status: 'pending',
            message: 'support_intent'
          })
        }).catch(() => {});
      }
    } catch {
      // non-fatal
    }

    window.open("https://paystack.com/pay/z7fmj9rge1", "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className={`w-full max-w-sm mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-background/30 backdrop-blur-md rounded-xl border border-border/30 p-6 text-center shadow-lg relative overflow-hidden"
      >
        <h3 className="text-lg font-medium text-foreground tracking-tight mb-3">
          Support My Writing
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          If you're enjoying these stories, consider buying me a coffee. Your support helps me create more.
        </p>
        
        {/* Pulsing button with cup moving side-to-side and up/down */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.035, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse" }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg relative overflow-hidden"
          >
            <span className="relative flex items-center justify-center gap-2 z-10">
              <motion.div
                animate={{ 
                  x: [-4, 4, -4],
                  y: [0, -2, 0]
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <Coffee className="w-4 h-4" />
              </motion.div>
              Buy me a coffee
            </span>
          </Button>
        </motion.div>
        
        <p className="text-xs text-muted-foreground/70 mt-3">
          Powered by Paystack • Secure Payment
        </p>
      </motion.div>

      {/* Unified donation overlay (same as reader page) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:max-w-md text-center bg-background/95 backdrop-blur-md border border-border/50 overflow-hidden"
          aria-labelledby="support-writing-title"
          aria-describedby="support-writing-description"
        >
          <DialogHeader>
            <DialogTitle id="support-writing-title" className="text-xl font-semibold text-center flex items-center justify-center gap-2">
              <motion.div
                animate={{ x: [-3, 3, -3], y: [0, -2, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coffee className="w-5 h-5 text-pink-500" />
              </motion.div>
              Support My Writing
            </DialogTitle>
            <DialogDescription id="support-writing-description" className="text-center text-muted-foreground">
              Your support means the world. Every tip keeps my creativity brewing and helps me share more stories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4 relative z-10">
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="w-full"
            >
              <Button
                onClick={handleTip}
                disabled={isProcessing}
                className="w-full px-8 py-4 text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                size="lg"
                aria-label="Support with a donation"
              >
                <span className="relative flex items-center justify-center gap-2">
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
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse" }}
                      >
                        💖
                      </motion.span>
                      Yes, I’d love to
                    </>
                  )}
                </span>
              </Button>
            </motion.div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none" />
        </DialogContent>
      </Dialog>
    </div>
  );
};