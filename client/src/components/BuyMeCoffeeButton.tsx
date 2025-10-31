import React from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BuyMeCoffeeButtonProps {
  authorId?: number;
}

export const BuyMeCoffeeButton = ({ authorId }: BuyMeCoffeeButtonProps) => {
  const href = "#open-support-overlay";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Open the existing Support My Writing overlay instead of navigating directly
    e.preventDefault();
    try {
      window.dispatchEvent(new CustomEvent('support-writing:open', { detail: { authorId } }));
    } catch {
      // no-op
    }
  };

  return (
    <Button
      asChild
      size="lg"
      className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 text-white rounded-full shadow-xl ring-1 ring-white/20 transition-all duration-500"
      aria-label="Buy me a coffee"
    >
      <motion.a
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-2"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <motion.span
          animate={{ x: [-2, 2, -2], y: [0, -3, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Coffee className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
        </motion.span>
        <span>Buy me a coffee</span>
      </motion.a>
    </Button>
  );
};