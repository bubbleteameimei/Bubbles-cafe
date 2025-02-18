import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 md:gap-2">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left nowrap">
            © Bubble's Cafe 2022-{currentYear}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="/privacy">
              <a className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </Link>
            <span>•</span>
            <Link href="/contact">
              <a className="hover:text-foreground transition-colors">
                Contact Us
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}