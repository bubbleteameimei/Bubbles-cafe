import { Link } from "wouter";
import { useEffect } from "react";

export default function Footer() {
  useEffect(() => {
    return () => {
      document.body.style.paddingBottom = '';
    };
  }, []);

  return (
    <footer
      className="w-screen mt-10 border-t border-border/40 bg-background/40 backdrop-blur-sm shadow-inner"
      style={{
        position: "relative",
        left: 0,
        right: 0,
        margin: 0,
        padding: 0,
        zIndex: 10,
        width: "100vw",
        marginLeft: "calc(-50vw + 50%)",
      }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto max-w-5xl px-5 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div className="text-left">
            <h3 className="text-sm font-semibold tracking-wide">Bubble’s Cafe</h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-md">
              Unsettling, psychological, and gothic fiction—short reads best enjoyed after dark.
            </p>
            <Link
              href="/feedback"
              className="inline-flex items-center justify-center mt-3 px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/30 text-xs font-medium hover:bg-muted/50 hover:border-primary/40 transition-colors"
            >
              Feedback
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-left">
            <h4 className="text-sm font-semibold tracking-wide">Quick Links</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link href="/" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Home</Link>
              <Link href="/reader" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Reader</Link>
              <Link href="/stories" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Stories</Link>
              <Link href="/community" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Community</Link>
              <Link href="/about" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">About</Link>
              <Link href="/privacy" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Privacy</Link>
            </div>
          </div>

          {/* Connect */}
          <div className="text-left">
            <h4 className="text-sm font-semibold tracking-wide">Connect</h4>
            <a
              href="mailto:contact@bubblescafe.space"
              className="inline-flex items-center justify-center mt-2.5 px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium text-primary hover:bg-muted/40 hover:border-primary/40 transition-colors"
            >
              contact@bubblescafe.space
            </a>
          </div>
        </div>

        <hr className="mt-6 border-t border-border/40" />

        {/* Bottom strip */}
        <div className="mt-4 w-full flex flex-col items-center justify-center">
          <div className="text-xs font-medium text-foreground/80 whitespace-nowrap mb-2">
            © Bubble’s Cafe {new Date().getFullYear()}. All rights reserved.
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-2"
            aria-label="Footer navigation"
          >
            <Link href="/about" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">About</Link>
            <Link href="/privacy" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Privacy</Link>
            <Link href="/legal/terms" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Terms</Link>
            <Link href="/legal/cookie-policy" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Cookies</Link>
            <Link href="/legal/copyright" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Copyright</Link>
            <Link href="/contact" className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}