import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { useNotifications } from "@/contexts/notification-context";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWordPressPosts } from "@/lib/wordpress-api";

function prefetchAuthPages(): void {
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

  // New: main nav search panel state and suggestions
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [suggestions, setSuggestions] = useState<{ community: any[]; reader: any[] }>({
    community: [],
    reader: []
  });

  // Focus management: programmatic focus for accessibility (no autoFocus prop)
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (searchOpen) {
      try {
        const raf = requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
        return () => cancelAnimationFrame(raf);
      } catch {}
    }
  }, [searchOpen]);

  // Positioning: compute left offset so the search bar covers nav and right actions, but not the sidebar button
  const [searchLeft, setSearchLeft] = useState<number>(56);
  useEffect(() => {
    const computeLeft = (_e?: Event): void => {uteLeft = (): void =>      try {
        const el = document.getElementById('sidebar-toggle') as HTMLElement | null;
        if (el) {
          const rect = el.getBoundingClientRect();
          // Add small gap after the menu button
          setSearchLeft(Math.round(rect.width + 12));
        } else {
          setSearchLeft(56);
        }
      } catch {
        setSearchLeft(56);
      }
    };
    computeLeft();
    window.addEventListener('resize', computeLeft);
    return () => window.removeEventListener('resize', computeLeft);
  }, []);

  // Persist nav search input across open/close and no-match states
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('nav-search-query');
      if (saved) setSearchValue(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('nav-search-query', searchValue);
    } catch {}
  }, [searchValue]);

  // Debounced suggestions fetch from server search API + WordPress fallback (distinguishes community vs reader)
  useEffect(() => {
    let active = true;
    const q = searchValue.trim();
    if (q.length < 2) {
      setSuggestions({ community: [], reader: [] });
      setNoMatches(false);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    const t = setTimeout(async () => {
      try {
        // Primary: server-side search
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&types=posts&limit=8`, { credentials: 'include' });
        const data = await res.json().catch(() => ({ results: [] }));
        let results = Array.isArray(data?.results) ? data.results : [];

        // Fallback: WordPress source when server returns no matches or limited dataset
        if ((!results || results.length === 0) && typeof fetchWordPressPosts === 'function') {
          try {
            const wpResult = await fetchWordPressPosts({ perPage: 40, includeContent: false, search: q });
            const wpPosts = Array.isArray((wpResult as any)?.posts) ? (wpResult as any).posts : [];
            const wpMatches = wpPosts
              .filter((p: any) => {
                const title = String(p?.title?.rendered || '').toLowerCase();
                return title.includes(q.toLowerCase());
              })
              .slice(0, 8)
              .map((p: any) => ({
                id: p.id,
                title: p?.title?.rendered || 'Untitled',
                url: `/reader/${encodeURIComponent(p.slug || p.id)}`,
                type: 'post',
                matches: []
              }));
            results = wpMatches;
          } catch {}
        }

        const community = (results || []).filter((r: any) => typeof r?.url === 'string' && r.url.startsWith('/community-story'));
        const reader = (results || []).filter((r: any) => typeof r?.url === 'string' && r.url.startsWith('/reader'));
        if (!active) return;
        setSuggestions({ community, reader });
        setNoMatches((community.length === 0 && reader.length === 0));
      } catch {
        if (!active) return;
        setSuggestions({ community: [], reader: [] });
        setNoMatches(true);
      } finally {
        if (active) setLoadingSuggestions(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [searchValue]);

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

  
  

  const smoothThemeToggle = () => {
    try {
      const root = document.documentElement;
      root.classList.add('theme-smooth');
      setTimeout(() => root.classList.remove('theme-smooth'), 300);
    } catch {}
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Prefetch route chunks for top nav to avoid Suspense blanks
  const prefetchRoute = (href: string) => {
    try {
      switch (href) {
        case '/':
          void import('../../pages/home'); break;
        case '/stories':
        case '/index':
          void import('../../pages/index'); break;
        case '/reader':
          void import('../../pages/reader'); break;
        case '/community':
          void import('../../pages/community'); break;
        case '/about':
          void import('../../pages/about'); break;
        default:
          break;
      }
    } catch {}
  };

  // Async prefetch that returns the import promise (used on click)
  const prefetchRouteAsync = (href: string): Promise<any> => {
    try {
      switch (href) {
        case '/': return import('../../pages/home');
        case '/stories': return import('../../pages/index');
        case '/index': return import('../../pages/index');
        case '/reader': return import('../../pages/reader');
        case '/community': return import('../../pages/community');
        case '/about': return import('../../pages/about');
        case '/search': return import('../../pages/search-results');
        case '/bookmarks': return import('../../pages/bookmarks');
        case '/profile': return import('../../pages/profile');
        default: return Promise.resolve();
      }
    } catch {
      return Promise.resolve();
    }
  };

  // Click handler that waits briefly for the chunk to be ready before navigating
  const handleNav = (href: string, e?: React.MouseEvent) => {
    try {
      if (e) e.preventDefault();
      const done = prefetchRouteAsync(href).catch(() => {});
      const cap = new Promise<void>((resolve) => setTimeout(resolve, 150));
      Promise.race([done, cap]).then(() => {
        setLocation(href);
      });
    } catch {
      // Fallback navigation
      window.location.href = href;
    }
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
          paddingBottom: '6px', // slightly reduced extra space
        }}
      >
        <div className="main-header flex items-center justify-between h-14 px-4">
          
          {/* Left: menu */}
          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  id="sidebar-toggle"
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
              <SheetContent side="left" className="p-0 w-[300px] max-w-[85vw] h-full bg-transparent backdrop-blur-md border-r border-border/50 shadow-2xl">
                <div className="border-b border-border/30" />
                <SidebarNavigation onNavigate={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>

        {/* Center nav */}
        <nav aria-label="Main" className="hidden lg:flex items-center justify-center flex-1 space-x-4">
          {[
            { href: "/", label: "Home" },
            { href: "/index", label: "Index" },
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
              onMouseEnter={() => prefetchRoute(href)}
              onFocus={() => prefetchRoute(href)}
              onClick={(e) => handleNav(href, e)}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="relative flex items-center space-x-2">
          {/* Search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-lg border border-border/20 bg-background/20 supports-[backdrop-filter]:bg-background/10 hover:bg-background/30 supports-[backdrop-filter]:hover:bg-background/20 text-white transition-colors transition-transform duration-200 ease-out active:scale-95"
            aria-label="Search"
            noOutline
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Animated search panel */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-1 left-0 right-0 z-50"
              >
                {/* Morphing search bar that covers nav and right actions (except sidebar button) */}
                <div
                  className="relative"
                  style={{
                    marginLeft: `${searchLeft}px`,
                    marginRight: '8px',
                  }}
                >
                  <div className="rounded-2xl ring-2 ring-indigo-400 bg-[#2A2A2A] text-white shadow-xl">
                    <div className="relative h-12">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
                      <Input
                        ref={searchInputRef}
                        placeholder="Search for novels..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-11 pr-10 h-12 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:outline-none"
                      />
                      <button
                        aria-label="Close search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                        onClick={() => setSearchOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Suggestions and Advanced Search panel */}
                  <div className="mt-2 rounded-2xl bg-[#121212] border border-white/10 shadow-lg overflow-hidden">
                    <div className="p-3">
                      {loadingSuggestions ? (
                        <div className="text-xs text-white/70">Searching…</div>
                      ) : (
                        <>
                          {(suggestions.community.length > 0 || suggestions.reader.length > 0) ? (
                            <div className="space-y-4">
                              {suggestions.reader.length > 0 && (
                                <div>
                                  <div className="text-xs text-white/60 mb-1">Reader</div>
                                  <ul className="space-y-1">
                                    {suggestions.reader.map((s: any) => (
                                      <li key={s.id}>
                                        <button
                                          className="w-full text-left text-sm text-white hover:text-indigo-400 transition-colors"
                                          onClick={() => {
                                            const href = String(s.url || '');
                                            const done = prefetchRouteAsync('/reader').catch(() => {});
                                            const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                                            Promise.race([done, cap]).then(() => {
                                              try { sessionStorage.removeItem('nav-search-query'); } catch {}
                                              setSearchOpen(false);
                                              setLocation(href);
                                            });
                                          }}
                                          title={String(s.title || '')}
                                        >
                                          {String(s.title || '')}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {suggestions.community.length > 0 && (
                                <div>
                                  <div className="text-xs text-white/60 mb-1">Community</div>
                                  <ul className="space-y-1">
                                    {suggestions.community.map((s: any) => (
                                      <li key={s.id}>
                                        <button
                                          className="w-full text-left text-sm text-white hover:text-indigo-400 transition-colors"
                                          onClick={() => {
                                            const href = String(s.url || '');
                                            const done = prefetchRouteAsync(href).catch(() => {});
                                            const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                                            Promise.race([done, cap]).then(() => {
                                              try { sessionStorage.removeItem('nav-search-query'); } catch {}
                                              setSearchOpen(false);
                                              setLocation(href);
                                            });
                                          }}
                                          title={String(s.title || '')}
                                        >
                                          {String(s.title || '')}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ) : (
                            noMatches && <div className="text-sm text-white/70">No stories found</div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Advanced search bar */}
                    <div className="border-t border-white/10">
                      <button
                        className="w-full text-center py-3 text-indigo-400 hover:text-indigo-300 transition-colors text-base"
                        onClick={() => {
                          const href = '/search';
                          const done = prefetchRouteAsync(href).catch(() => {});
                          const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                          Promise.race([done, cap]).then(() => {
                            setSearchOpen(false);
                            const q = encodeURIComponent(searchValue.trim());
                            setLocation(q ? `/search?q=${q}` : '/search');
                          });
                        }}
                        title="Open advanced search"
                      >
                        Advanced Search
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

      {/* Reader-only in-header progress bar (GPU-accelerated via transform) */}
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
            pointerEvents: 'none',
            background: 'transparent'
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              transformOrigin: 'left center',
              transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress / 100))}) translateZ(0)`,
              willChange: 'transform',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
            }}
          />
        </div>
      )}
    </header>
  </>
  );
}