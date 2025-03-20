import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-gray-200 dark:border-gray-800 py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">© {currentYear} Bubble's Cafe</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              About
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Contact
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}