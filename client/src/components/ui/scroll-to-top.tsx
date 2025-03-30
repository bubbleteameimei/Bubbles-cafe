import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./button";

// NOTE: This component has been deprecated in favor of ScrollToTopButton.tsx
// It is kept here for reference but is no longer used in the application.
// The main ScrollToTopButton component in /components/ScrollToTopButton.tsx 
// should be used instead with proper positioning.

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Handle scroll visibility
    const toggleVisibility = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      variant="default"
      size="icon"
      // Fixed position classes applied directly for clarity
      className="fixed bottom-5 right-5 p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 z-50"
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
}