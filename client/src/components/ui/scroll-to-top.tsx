import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Handle scroll visibility
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    
    // Initial check
    toggleVisibility();
    
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div 
      className={cn(
        "fixed z-50 right-4 bottom-4 md:right-6 md:bottom-6 transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}
    >
      <Button
        variant="default"
        size="icon"
        className="h-10 w-10 md:h-12 md:w-12 rounded-full shadow-md hover:shadow-lg hover:bg-primary/80 focus:ring-2 focus:ring-primary/50"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    </div>
  );
}