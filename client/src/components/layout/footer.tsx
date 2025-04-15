import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="w-screen border-t border-gray-200 dark:border-gray-800 py-2 bg-background/95 backdrop-blur-sm shadow-sm"
      style={{
        width: "100vw",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0
      }}
    >
      <div className="w-full flex justify-between items-center px-4">
        {/* Copyright text - left aligned */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          © Bubble's Cafe {currentYear}
        </div>
        
        {/* Navigation links - right aligned */}
        <div className="flex items-center gap-3">
          <Link href="/about" className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            Contact
          </Link>
          <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            Privacy
          </Link>
          <Link href="/legal/terms" className="text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}