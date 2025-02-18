import { Link } from "wouter";
import { SocialIcons } from "@/components/ui/social-icons";

export default function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with horror and passion.{" "}
            <Link href="/about">
              <a className="font-medium underline underline-offset-4 hover:text-foreground">
                About Us
              </a>
            </Link>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/privacy">
            <a className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
              Privacy
            </a>
          </Link>
          <span className="text-primary/30">•</span>
          <Link href="/contact">
            <a className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors">
              Contact
            </a>
          </Link>
        </div>
      </div>
    </footer>
  );
}