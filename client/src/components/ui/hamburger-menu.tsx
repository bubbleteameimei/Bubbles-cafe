import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HamburgerMenuProps {
  isOpen: boolean;
  className?: string;
  onClick?: () => void;
}

export function HamburgerMenu({ isOpen, className, onClick }: HamburgerMenuProps) {
  const variant = isOpen ? "opened" : "closed";
  
  const top = {
    closed: {
      rotate: 0,
      translateY: 0
    },
    opened: {
      rotate: 45,
      translateY: 8
    }
  };
  
  const center = {
    closed: {
      opacity: 1
    },
    opened: {
      opacity: 0
    }
  };
  
  const bottom = {
    closed: {
      rotate: 0,
      translateY: 0
    },
    opened: {
      rotate: -45,
      translateY: -8
    }
  };

  return (
    <div 
      className={cn("flex flex-col justify-center items-center w-6 h-6 cursor-pointer", className)}
      onClick={onClick}
    >
      <motion.span
        initial="closed"
        animate={variant}
        variants={top}
        className="w-6 h-0.5 bg-foreground mb-1.5 block"
      />
      <motion.span
        initial="closed"
        animate={variant}
        variants={center}
        className="w-6 h-0.5 bg-foreground mb-1.5 block"
      />
      <motion.span
        initial="closed"
        animate={variant}
        variants={bottom}
        className="w-6 h-0.5 bg-foreground block"
      />
    </div>
  );
}
