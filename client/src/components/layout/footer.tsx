import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-2 py-4 md:h-14 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © Bubble's Cafe 2022-{currentYear}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Link href="/privacy">
              <a className="hover:text-foreground transition-colors">
                Privacy
              </a>
            </Link>
            <span>•</span>
            <Link href="/contact">
              <a className="hover:text-foreground transition-colors">
                Contact
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}