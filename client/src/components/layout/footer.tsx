import { Link } from "wouter";
import { useEffect } from "react";

export default function Footer() {
  // Clean up any styles when unmounting
  useEffect(() => {
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, []);
  
  return (
    <footer 
      className="w-screen border-t border-primary/20 bg-background/95 mt-8"
      style={{
        position: "relative",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0,
        zIndex: 10,
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)'
      }}
    >
      <div className="w-full flex flex-col sm:flex-row justify-between items-center py-2">
        {/* Copyright text - responsive alignment */}
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap mb-1 sm:mb-0 ml-4 sm:ml-8">
          © Bubble's Cafe 2025.&nbsp;All rights reserved.
        </div>
        
        {/* Navigation links - responsive alignment */}
        <div className="flex items-center mr-4 sm:mr-8">
          <Link 
            href="/privacy" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 whitespace-nowrap"
          >
            Privacy Policy
          </Link>
          <span className="text-primary/40 text-sm mx-1">•</span>
          <Link 
            href="/contact" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 whitespace-nowrap"
          >
            Contact Me
          </Link>
        </div>
      </div>
    </footer>
  );
}