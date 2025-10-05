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
      className="w-screen border-t border-primary/20 bg-background/15 backdrop-blur-sm mt-8"
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
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="w-full flex flex-col items-center justify-center py-4 px-4">
        {/* Copyright text - centered */}
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap mb-2">
          © Bubble's Cafe {new Date().getFullYear()}.&nbsp;All rights reserved.
        </div>
        
        {/* Navigation links - centered */}
        <nav className="flex flex-wrap items-center justify-center gap-1" aria-label="Footer navigation">
          <Link 
            href="/about" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            About
          </Link>
          <span className="text-primary/40 text-sm">•</span>
          <Link 
            href="/privacy" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            Privacy
          </Link>
          <span className="text-primary/40 text-sm">•</span>
          <Link 
            href="/legal/terms" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            Terms
          </Link>
          <span className="text-primary/40 text-sm">•</span>
          <Link 
            href="/legal/cookie-policy" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            Cookies
          </Link>
          <span className="text-primary/40 text-sm">•</span>
          <Link 
            href="/legal/copyright" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            Copyright
          </Link>
          <span className="text-primary/40 text-sm">•</span>
          <Link 
            href="/contact" 
            className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-2 whitespace-nowrap underline decoration-gray-400 hover:decoration-primary underline-offset-2"
          >
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}