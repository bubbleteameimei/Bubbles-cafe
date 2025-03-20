import { Link } from "wouter";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-background/80 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-10 shadow-sm">
      <div className="container flex items-center justify-center h-10 px-4">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center">
            <Heart className="h-3 w-3 mr-1 text-primary/70" /> © {currentYear}
          </span>
          <div className="flex items-center space-x-2">
            <Link href="/privacy" className="hover:text-foreground hover:underline transition-colors">
              Privacy
            </Link>
            <span className="text-primary/50 text-xs">•</span>
            <Link href="/contact" className="hover:text-foreground hover:underline transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}