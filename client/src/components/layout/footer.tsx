import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-0 sm:mt-0 md:mt-0 lg:mt-0 border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8 md:py-10 lg:py-12 bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Copyright text - centered */}
          <div className="flex items-center justify-center">
            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
              © Bubble's Cafe {currentYear}. All rights reserved.
            </span>
          </div>
          
          {/* Navigation links - centered */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <Link href="/about" className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
              Contact
            </Link>
            <Link href="/privacy" className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors font-medium">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}