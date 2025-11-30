import React from "react";
import { Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

interface BuyMeCoffeeButtonProps {
  authorId?: number;
}

export const BuyMeCoffeeButton = ({ authorId }: BuyMeCoffeeButtonProps) => {
  const href = "#open-support-overlay";

  const { theme } = useTheme();
  const appearance = theme.appearance;

  // Default gradient (light mode + system): match the reader \"Support My Writing\" button
  let gradientClass =
    "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500";

  // Dark mode: reuse the same gradient as the reader page for consistency
  if (appearance === "dark") {
    gradientClass =
      "bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500";
  }
  // Sky theme: cool, moody sky gradient
  else if (appearance === "sky") {
    gradientClass =
      "bg-gradient-to-r from-sky-800 via-sky-600 to-sky-400 hover:from-sky-700 hover:via-sky-500 hover:to-sky-300";
  }
  // Eco theme: deep forest to vivid green gradient
  else if (appearance === "eco") {
    gradientClass =
      "bg-gradient-to-r from-emerald-800 via-emerald-600 to-lime-500 hover:from-emerald-700 hover:via-emerald-500 hover:to-lime-400";
  }
  // appearance === "light" or "system" use the default purple/pink gradient

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Open the existing Support My Writing overlay instead of navigating directly
    e.preventDefault();
    try {
      window.dispatchEvent(
        new CustomEvent("support-writing:open", { detail: { authorId } }),
      );
    } catch {
      // no-op
    }
  };

  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "px-6 py-3 text-white rounded-full shadow-lg transition-colors",
        gradientClass,
      )}
      aria-label="Buy me a coffee"
    >
      <motion.a
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-2"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <motion.span
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="inline-flex"
        >
          <Coffee className="w-5 h-5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
        </motion.span>
        <span>Buy me a coffee</span>
      </motion.a>
    </Button>
  );
};