import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-screen border-t border-primary/20 py-3 bg-background/90 backdrop-blur-md shadow-md"
      style={{
        width: "100vw",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className="w-full flex flex-col items-center px-6 md:px-10">
        {/* Copyright text - centered on top with subtle gradient */}
        <div className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary/70 mb-2 whitespace-nowrap">
          © Bubble's Cafe {currentYear}
        </div>
        
        {/* Navigation links - centered on bottom row with elegant separator */}
        <div className="flex items-center justify-center w-full">
          <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            About
          </Link>
          <span className="text-primary/40">•</span>
          <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            Contact
          </Link>
          <span className="text-primary/40">•</span>
          <Link href="/privacy" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            Privacy
          </Link>
          <span className="text-primary/40">•</span>
          <Link href="/legal/terms" className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors px-3 py-1 whitespace-nowrap">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}