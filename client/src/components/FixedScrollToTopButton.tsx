import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simple component with absolute minimal dependencies
const FixedScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();
    
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Extremely simple component with direct inline styles
  return (
    <div id="scroll-to-top-container" style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      pointerEvents: isVisible ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-out'
    }}>
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(244, 244, 244, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          cursor: 'pointer'
        }}
      >
        <ArrowUp size={20} color="#333" />
      </button>
    </div>
  );
};

export default FixedScrollToTopButton;