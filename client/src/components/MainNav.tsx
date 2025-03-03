import { Link } from "wouter";
import { Ghost } from "lucide-react";

export default function MainNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <Ghost className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">Horror Blog</span>
          </a>
        </Link>
      </div>
    </header>
  );
}