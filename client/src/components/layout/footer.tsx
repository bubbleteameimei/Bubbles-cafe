import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-primary/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground/80 tracking-wide">
            © Bubble's Cafe {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/80">
            <Link href="/privacy" className="hover:text-primary transition-colors tracking-wide">
              Privacy Policy
            </Link>
            <span className="text-primary/30">•</span>
            <Link href="/contact" className="hover:text-primary transition-colors tracking-wide">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}