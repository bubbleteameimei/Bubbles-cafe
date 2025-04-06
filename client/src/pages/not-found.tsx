import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import '@/styles/eyeball-loader.css';

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      {/* Animated eyeball loader - now more prominent */}
      <div className="flex justify-center mb-8 scale-150">
        <span className="eyeball-loader" aria-hidden="true"></span>
      </div>
      
      <div className="text-center">
        <div className="flex justify-center mb-4 gap-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold">404 Page Not Found</h1>
        </div>
        <p className="mb-8 text-muted-foreground max-w-md">
          The page you're looking for seems to have vanished into the darkness. 
          Perhaps it never existed at all.
        </p>
        
        <Button asChild>
          <Link href="/" className="flex items-center gap-2">
            <Home size={16} />
            Return to Safety
          </Link>
        </Button>
      </div>
      
      {/* ARIA live region for accessibility */}
      <div className="sr-only" role="status" aria-live="polite">
        Error 404: Page not found. Please navigate to another page.
      </div>
    </div>
  );
}