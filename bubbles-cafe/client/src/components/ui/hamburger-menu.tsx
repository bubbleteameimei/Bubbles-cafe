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
      className={cn(
        "flex flex-col justify-center items-center w-10 h-10 cursor-pointer touch-manipulation rounded-md relative", 
        "active:scale-95 transition-all duration-150 ease-out", 
        "hover:bg-foreground/5 active:bg-foreground/10", 
        className
      )}
      onClick={onClick}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <motion.span
          initial="closed"
          animate={variant}
          variants={top}
          className="w-6 h-0.5 bg-foreground mb-1.5 block rounded-full"
        />
        <motion.span
          initial="closed"
          animate={variant}
          variants={center}
          className="w-6 h-0.5 bg-foreground mb-1.5 block rounded-full"
        />
        <motion.span
          initial="closed"
          animate={variant}
          variants={bottom}
          className="w-6 h-0.5 bg-foreground block rounded-full"
        />
      </div>
    </div>
  );
}
