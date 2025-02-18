import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-center text-sm leading-loose text-muted-foreground">
              © Bubble's Cafe 2022-{currentYear}. All rights reserved.
            </p>
            <p className="text-center text-sm leading-loose text-muted-foreground">
              <Link href="/privacy">
                <a className="hover:text-foreground">
                  Privacy Policy
                </a>
              </Link>
              {" • "}
              <Link href="/contact">
                <a className="hover:text-foreground">
                  Contact Us
                </a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}