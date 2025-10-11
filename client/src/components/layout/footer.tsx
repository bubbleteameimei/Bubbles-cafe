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
      {/* Main footer grid */}
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Bubble's Cafe */}
          <div className="text-left">
            <h3 className="text-2xl font-bold">Bubble’s Cafe</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Every story here is a portal to the unexplained, the unexpected and the unsettling.
            </p>
            <Link
              href="/feedback"
              className="inline-block mt-4 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors"
            >
              Feedback
            </Link>
          </div>

          {/* Middle Column - Quick Links */}
          <div className="text-left">
            <h4 className="text-xl font-semibold">Quick Links</h4>
            <div className="mt-2 flex flex-col space-y-1">
              <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
              <Link href="/reader" className="text-sm hover:text-primary transition-colors">Reader</Link>
              <Link href="/stories" className="text-sm hover:text-primary transition-colors">Stories</Link>
              <Link href="/community" className="text-sm hover:text-primary transition-colors">Community</Link>
              <Link href="/about" className="text-sm hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="text-sm hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>

          {/* Right Column - Connect */}
          <div className="text-left">
            <h4 className="text-xl font-semibold">Connect</h4>
            <a
              href="mailto:contact@bubblescafe.space"
              className="inline-block mt-3 px-4 py-2 rounded-md border border-primary/40 hover:border-primary text-primary hover:text-primary/90 transition-colors"
            >
              contact@bubblescafe.space
            </a>
          </div>
        </div>

        {/* Divider */}
        <hr className="mt-8 border-t border-white/20" />
      </div>

      {/* Bottom footer - existing content retained */}
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