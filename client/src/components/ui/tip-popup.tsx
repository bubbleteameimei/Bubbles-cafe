import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Coffee, Heart } from "lucide-react";

interface TipPopupProps {
  autoShow?: boolean; // For reader page auto-popup
  triggerContent?: React.ReactNode; // Custom trigger content
}

export function TipPopup({ autoShow = false, triggerContent }: TipPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (autoShow) {
      const lastShown = localStorage.getItem('lastTipPopupShown');
      const showAgain = !lastShown || Date.now() - parseInt(lastShown) > 60 * 60 * 1000; // 1 hour (changed from 24 hours)

      if (showAgain) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('lastTipPopupShown', Date.now().toString());
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [autoShow]);

  const handleTip = () => {
    window.open('https://paystack.com/pay/z7fmj9rge1', '_blank');
    setIsOpen(false);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Support My Writing <Heart className="h-4 w-4 text-red-500 animate-pulse" />
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            If you're enjoying my stories, consider buying me a coffee! Your support helps me create more engaging content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <button 
            onClick={handleTip}
            className="buy-coffee-btn w-full max-w-sm"
          >
            <Coffee className="h-5 w-5" />
            <span>Buy me a coffee</span>
          </button>
          <p className="text-sm text-muted-foreground text-center">
            Powered by Paystack • Secure Payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}