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
      className="w-full mt-10 border-t border-border/40 bg-background/40 backdrop-blur-sm shadow-inner"
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
      <div className="container mx-auto max-w-5xl px-6 py-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Brand + Contact (Left) */}
          <div className="text-left">
            <h3 className="text-sm font-semibold tracking-wide">Bubble’s Cafe</h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-md">
              Unexpected. Unexplained. Unsettling.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center">
                <Link
                  href="/contact"
                  className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/feedback"
                  className="inline-flex px-2 py-1 rounded-md border border-border/40 bg-muted/20 text-[11px] font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors"
                >
                  Feedback
                </Link>
              </div>
              <a
                href="mailto:contact@bubblescafe.space"
                className="inline-flex items-center px-2 py-1 rounded-[6px] bg-primary text-primary-foreground text-[11px] font-semibold shadow-sm hover:bg-primary/90 transition-colors"
              >
                Email
              </a>
            </div>
          </div>

          {/* Quick Links (Right) */}
          <div className="text-left">
            <h4 className="text-sm font-semibold tracking-wide">Quick Links</h4>
            <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-start">
              <li>
                <Link href="/" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/reader" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Reader</Link>
              </li>
              <li>
                <Link href="/community" className="inline-flex px-2.5 py-1.5 rounded-md border border-border/40 bg-muted/20 text-xs font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors">Community</Link>
              </li>
            </ul>
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
          </nav>
        </div>
      </div>
    </footer>
  );
}