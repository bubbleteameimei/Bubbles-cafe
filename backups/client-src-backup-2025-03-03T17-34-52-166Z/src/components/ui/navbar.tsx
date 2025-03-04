
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Bubble's Cafe</h1>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle variant="animated" />
        </div>
      </div>
    </nav>
  );
}
