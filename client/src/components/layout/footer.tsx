import { Link } from "wouter";

export default function Footer() {
  return (
    <footer 
      className="w-screen border-t border-primary/20 bg-background/90 backdrop-blur-md shadow-md"
      style={{
        width: "100vw",
        position: "relative",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className="w-full flex flex-col items-center px-0">
        {/* Copyright text - centered on top with normal (not blurred) text */}
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap pt-4 pb-2">
          © Bubble's Cafe 2022-2025.&nbsp;&nbsp;All rights reserved.
        </div>
        
        {/* Simplified navigation links - centered on bottom row with minimal options */}
        <div className="flex items-center justify-center w-full pb-3">
          <Link href="/privacy" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            Privacy Policy
          </Link>
          <span className="text-primary/40">•</span>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            Contact Me
          </Link>
        </div>
      </div>
    </footer>
  );
}