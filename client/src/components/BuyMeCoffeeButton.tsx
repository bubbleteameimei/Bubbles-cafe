import React, { useState, useCallback } from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

export const BuyMeCoffeeButton = () => {
  const href = "https://paystack.com/pay/z7fmj9rge1";
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const handleConfirm = useCallback(() => {
    try {
      window.open(href, "_blank", "noopener,noreferrer");
    } finally {
      setOpen(false);
    }
  }, [href]);

  return (
    <>
      <Button
        size="lg"
        onClick={handleOpen}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg transition-colors"
        aria-label="Buy me a coffee"
      >
        <motion.span
          className="inline-flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Coffee cup with subtle steam animation */}
          <span className="relative inline-flex items-center">
            <Coffee className="w-5 h-5" />
            <motion.span
              aria-hidden="true"
              className="absolute -top-2 left-1 h-3 w-3 rounded-full bg-white/60"
              initial={{ opacity: 0, y: 2, scale: 0.8 }}
              animate={{ opacity: [0, 0.8, 0], y: [-1, -3, -5], scale: [0.8, 1, 1.1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(1px)" }}
            />
          </span>
          <span>Buy me a coffee</span>
        </motion.span>
      </Button>

      {/* Support modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Support my writing?</DialogTitle>
            <DialogDescription>
              Your support helps me keep creating unsettling short fiction and building better reading experiences.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center py-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-white/20"
            >
              <motion.div
                className="relative"
                animate={{ y: [0, -2, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Coffee className="w-5 h-5 text-pink-600" />
                {/* Steam puffs */}
                <motion.span
                  aria-hidden="true"
                  className="absolute -top-2 left-1 h-3 w-3 rounded-full bg-pink-400/60"
                  initial={{ opacity: 0, y: 2, scale: 0.8 }}
                  animate={{ opacity: [0, 0.85, 0], y: [-1, -4, -6], scale: [0.8, 1, 1.15] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "blur(1px)" }}
                />
              </motion.div>
              <span className="text-sm font-medium text-foreground">“Yes, I’d love to.”</span>
            </motion.div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose}>
              Maybe later
            </Button>
            <Button onClick={handleConfirm} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500">
              Yes, I’d love to
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};