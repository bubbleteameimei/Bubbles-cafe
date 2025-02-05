
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const updatePosition = (x: number, y: number) => {
      setPosition({ x, y });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    if (isMobile) {
      window.addEventListener("touchmove", handleTouchMove);
    } else {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (isMobile) {
        window.removeEventListener("touchmove", handleTouchMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isMobile]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50"
      animate={{ 
        x: position.x - 16,
        y: position.y - 16,
        scale: visible ? 1 : 0,
        opacity: visible ? 0.7 : 0 
      }}
      transition={{ 
        type: "spring",
        damping: 25,
        stiffness: 250
      }}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
      </svg>
    </motion.div>
  );
}
