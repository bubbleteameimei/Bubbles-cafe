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
      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-full shadow-lg transition-colors animate-pulse"
      aria-label="Buy me a coffee"
    >
      <a href={href} onClick={handleClick} className="inline-flex items-center gap-2">
        <motion.span
          animate={{ x: [-3, 3, -3], y: [0, -2, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Coffee className="w-5 h-5" />
        </motion.span>
        <span>Buy me a coffee</span>
      </a>
    </Button>
  );
};