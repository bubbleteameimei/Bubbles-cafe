import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, Heart } from "lucide-react";

interface TipPopupProps {
  autoShow?: boolean; // For reader page auto-popup
  triggerContent?: React.ReactNode; // Custom trigger content
}

export function TipPopup({ autoShow = false, triggerContent }: TipPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (autoShow) {
      // Check if we've shown the popup recently
      const lastShown = localStorage.getItem('lastTipPopupShown');
      const showAgain = !lastShown || Date.now() - parseInt(lastShown) > 24 * 60 * 60 * 1000; // 24 hours

      if (showAgain) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          localStorage.setItem('lastTipPopupShown', Date.now().toString());
        }, 30000); // 30 seconds

        return () => clearTimeout(timer);
      }
    }
  }, [autoShow]); // Only re-run if autoShow changes

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
          <Button variant="ghost" size="sm" className="gap-2">
            <Coffee className="h-4 w-4" />
            Buy me a coffee
          </Button>
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
          <Button 
            onClick={handleTip}
            className="w-full max-w-sm gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
          >
            <Coffee className="h-5 w-5" />
            Buy me a coffee
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Powered by Paystack • Secure Payment
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}