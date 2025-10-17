import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/contexts/notification-context";

function prefetchAuthPages() {
  try {
    const run = () => {
      // Warm the chunks for auth routes so Suspense doesn't show layout-changing fallbacks
      void import("@/pages/auth");
      void import("@/pages/auth-success");
      void import("@/pages/auth-callback");
      void import("@/pages/reset-password");
    };
    const ric = (window as any)?.requestIdleCallback as any;
    if (typeof ric === "function") {
      ric(() => run(), { timeout: 1500 });
    } else {
      setTimeout(run, 300);
    }
  } catch {}
}

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  // Reader route progress state (for in-header progress bar)
  const [scrollProgress, setScrollProgress] = useState(0);
  const isReaderRoute = typeof location === "string" && location.includes("/reader");

  // Close the sidebar drawer proactively on route changes to avoid layout reflow
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    // Also clear any temporary body styles a drawer might have applied
    try {
      document.body.style.paddingRight = '';
    } catch {}
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Idle prefetch auth-related routes to avoid Suspense flashes
  useEffect(() => {
    prefetchAuthPages();
  }, []);

  // Track page scroll to drive the in-header progress bar on reader routes
  useEffect(() => {
    if (!isReaderRoute) return;
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScrollable = Math.max(docHeight - winHeight, 1);
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScrollable) * 100));
      setScrollProgress(pct);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    window.addEventListener("resize", onScroll, { passive: true } as any);
    return () => {
      window.removeEventListener("scroll", onScroll as any);
      window.removeEventListener("resize", onScroll as any);
    };
  }, [isReaderRoute]);

  
  const handleSearch = () => {
    const q = searchValue.trim();
    if (!q) return;
    try {
      setLocation(`/search?q=${encodeURIComponent(q)}`);
    } catch {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  const smoothThemeToggle = () => {
    try {
      const root = document.documentElement;
      root.classList.add('theme-smooth');
      setTimeout(() => root.classList.remove('theme-smooth'), 300);
    } catch {}
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  return (
    <>
      <header
        className={`w-full bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-md shadow-sm`}
        style={{
          position: 'relative',
          margin: 0,
          padding: 0,
          width: '100%',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="main-header flex items-center justify-between h-14 px-4">
          
          {/* Left: menu */}
          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
                  aria-label="Open menu"
                  onClick={() => setIsOpen((v) => !v)}
                  noOutline
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px] max-w-[85vw] h-full bg-background/70 supports-[backdrop-filter]:bg-background/40 backdrop-blur-md border-r border-border/50 shadow-2xl">
                <div className="border-b border-border/30" />
                <SidebarNavigation onNavigate={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

        {/* Center nav */}
        <nav aria-label="Main" className="hidden lg:flex items-center justify-center flex-1 space-x-4">
          {[
            { href: "/", label: "Home" },
            { href: "/stories", label: "Stories" },
            { href: "/reader", label: "Reader" },
            { href: "/community", label: "Community" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-4 py-2 text-sm font-medium transition-colors
                ${location === href
                  ? "text-primary font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-white hover:text-white/80"
                }`}
              aria-current={location === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
                aria-label="Search"
                noOutline
              >
                <Search className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3 bg-background/70 supports-[backdrop-filter]:bg-background/40 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search stories…"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  className="h-9 text-sm bg-background/40 supports-[backdrop-filter]:bg-background/20 border-border/40 flex-1"
                />
                <Button
                  variant="default"
                  size="sm"
                  className="h-9 bg-background/40 supports-[backdrop-filter]:bg-background/20 hover:bg-background/30 transition-colors"
                  onClick={handleSearch}
                  disabled={!searchValue.trim()}
                >
                  Go
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <NotificationIcon
            className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
            noOutline
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={smoothThemeToggle}
            className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            noOutline
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {!user ? (
            <Button
              variant="ghost"
              size="icon"
              onMouseEnter={prefetchAuthPages}
              onFocus={prefetchAuthPages}
              onClick={() => {
                // Ensure the sidebar is closed before navigating to prevent reflow
                if (isOpen) setIsOpen(false);
                try { document.body.style.paddingRight = ''; } catch {}
                // Aggressively ensure auth chunks are loaded before navigation
                prefetchAuthPages();
                setLocation("/auth");
              }}
              className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
              aria-label="Sign in"
              noOutline
            >
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
              noOutline
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Full-bleed demarcation line (exactly like footer) */}
      <div
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          width: "100vw",
          transform: "translateX(-50%)",
          borderTop: "1px solid hsl(var(--border) / 0.70)",
          zIndex: 40
        }}
      />

      {/* Reader-only in-header progress bar, aligned to the bottom demarcation line */}
      {isReaderRoute && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            transform: 'none',
            bottom: '-1px', // sit directly under the separator line
            width: '100%',
            height: '3px',
            zIndex: 41,
            pointerEvents: 'none'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          />
        </div>
      )}
    </header>
  </>
  );
}