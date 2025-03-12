import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import SearchBar from "../SearchBar";
import { Button } from "../ui/button";
import { Sun, Moon, Menu } from "lucide-react";
import useUserPreferences from "../../hooks/useUserPreferences";

interface AutoHideNavbarProps {
  title?: string;
  toggleSidebar?: () => void;
  searchData?: { title: string; slug: string }[];
}

const AutoHideNavbar: React.FC<AutoHideNavbarProps> = ({
  title = "Horror Stories",
  toggleSidebar,
  searchData = []
}) => {
  const [hidden, setHidden] = useState(false);
  const [darkMode, setDarkMode] = useUserPreferences("darkMode", false);
  const lastScrollY = useRef(0);
  const scrollThreshold = 100; // Pixels to scroll before hiding

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) {
        return;
      }
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY <= 0 || currentScrollY < lastScrollY.current) {
        setHidden(false);
      } 
      // Hide navbar when scrolling down past threshold
      else if (currentScrollY > lastScrollY.current && currentScrollY > scrollThreshold) {
        setHidden(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border h-16"
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-4">
          {toggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href="/">
            <a className="text-xl font-bold hover:text-accent transition-colors">
              {title}
            </a>
          </Link>
        </div>
        
        <div className="hidden md:block w-1/3 mx-4">
          <SearchBar data={searchData} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Link href="/auth">
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

export default AutoHideNavbar;