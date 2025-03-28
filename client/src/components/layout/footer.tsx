import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-0 sm:mt-0 md:mt-0 lg:mt-0 border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8 md:py-10 lg:py-12 bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 text-center md:text-left font-medium">
              © Bubble's Cafe {currentYear}. All rights reserved.
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
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
        
        <div className="hidden md:flex justify-center mt-4 lg:mt-6">
          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-500 max-w-2xl text-center">
            Providing the best storytelling experience across all your devices - mobile, tablet, laptop, and desktop.
          </div>
        </div>
      </div>
    </footer>
  );
}