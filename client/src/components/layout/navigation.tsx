import { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavigation } from "@/components/ui/sidebar-menu";
import { Menu, Search, Moon, Sun, User, Cloud, Leaf } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

import { useTheme } from "@/components/theme-provider";
import { NotificationIcon } from "@/components/ui/notification-icon";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWordPressPosts, getExcerpt } from "@/lib/wordpress-api";

function prefetchAuthPages(): void {
  try {
    const run = () => {
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
  const { theme, setTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  // Search panel state and suggestions
  const [searchOpen, setSearchOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [noMatches, setNoMatches] = useState(false);
  const [showNoMatchesPrelim, setShowNoMatchesPrelim] = useState(false);
  const [suggestions, setSuggestions] = useState<{ community: any[]; reader: any[] }>({
    community: [],
    reader: [],
  });

  // Keyboard navigation state for suggestions
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  // Flatten suggestions for easier keyboard navigation
  const flatSuggestions = useMemo(
    () => [
      ...suggestions.reader.map((s: any) => ({ ...s, group: "reader" as const })),
      ...suggestions.community.map((s: any) => ({ ...s, group: "community" as const })),
    ],
    [suggestions.reader, suggestions.community]
  );

  // Highlight matched query in suggestion titles
  const highlight = (text: string, query: string) => {
    if (!text) return text;
    const q = query.trim();
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Focus management for accessibility (no autoFocus prop)
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastResultsRef = useRef<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [didYouMean, setDidYouMean] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const raf = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [searchOpen]);

  // Close search panel when clicking outside
  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const panel = panelRef.current;
      const btn = document.getElementById("nav-search-button") as HTMLElement | null;
      if (panel && target && panel.contains(target)) return;
      if (btn && target && btn.contains(target)) return;
      setSearchOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, [searchOpen]);

  // Persist nav search input across open/close and no-match states
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("nav-search-query");
      if (saved) setSearchValue(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("nav-search-query", searchValue);
    } catch {}
  }, [searchValue]);

  // Debounced suggestions: server search + WordPress fallback
  useEffect(() => {
    let active = true;
    const q = searchValue.trim();
    if (q.length < 1) {
      setSuggestions({ community: [], reader: [] });
      setNoMatches(false);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);

    try {
      const prev = lastResultsRef.current;
      const qLower = q.toLowerCase();
      if (prev && prev.length && qLower) {
        const filtered = prev.filter((r: any) => String(r?.title || "").toLowerCase().includes(qLower));
        const communityQuick = filtered.filter((r: any) => typeof r?.url === "string" && r.url.startsWith("/community-story"));
        const readerQuick = filtered.filter((r: any) => typeof r?.url === "string" && r.url.startsWith("/reader"));
        const normalizeQuick = (arr: any[]) =>
          arr.map((r: any) => ({
            id: r.id,
            title: String(r.title || "Untitled"),
            url: String(r.url || ""),
            excerpt: typeof r.excerpt === "string" ? r.excerpt : "",
          }));
        setSuggestions({
          community: normalizeQuick(communityQuick),
          reader: normalizeQuick(readerQuick),
        });
        setShowNoMatchesPrelim(communityQuick.length + readerQuick.length === 0 && q.length >= 2);
      } else {
        setShowNoMatchesPrelim(q.length >= 2);
      }
    } catch {
      setShowNoMatchesPrelim(q.length >= 2);
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&types=posts&limit=8`, {
          credentials: "include",
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({ results: [] }));
        let results = Array.isArray(data?.results) ? data.results : [];

        if ((!results || results.length === 0) && typeof fetchWordPressPosts === "function") {
          try {
            const wpResult = await fetchWordPressPosts({ perPage: 40, includeContent: false, search: q });
            const wpPosts = Array.isArray((wpResult as any)?.posts) ? (wpResult as any).posts : [];
            const wpMatches = wpPosts
              .filter((p: any) => {
                const title = String(p?.title?.rendered || "").toLowerCase();
                return title.includes(q.toLowerCase());
              })
              .slice(0, 8)
              .map((p: any) => ({
                id: p.id,
                title: p?.title?.rendered || "Untitled",
                url: `/reader/${encodeURIComponent(p.slug || p.id)}`,
                type: "post",
                excerpt: getExcerpt(p?.excerpt?.rendered || ""),
                matches: [],
              }));
            results = wpMatches;
          } catch {}
        }

        const community = (results || []).filter((r: any) => typeof r?.url === "string" && r.url.startsWith("/community-story"));
        const reader = (results || []).filter((r: any) => typeof r?.url === "string" && r.url.startsWith("/reader"));
        const normalize = (arr: any[]) =>
          arr.map((r: any) => ({
            id: r.id,
            title: String(r.title || "Untitled"),
            url: String(r.url || ""),
            excerpt:
              typeof r.excerpt === "string"
                ? r.excerpt
                : Array.isArray(r.matches) && r.matches.length
                ? String(r.matches[0]?.text || "").slice(0, 140)
                : "",
          }));
        if (!active) return;
        const ids = (results || []).map((r: any) => r.id);
        const prevIds = (lastResultsRef.current || []).map((r: any) => r.id);
        const same = ids.length === prevIds.length && ids.every((id: any, i: number) => id === prevIds[i]);
        lastResultsRef.current = results;
        if (!same) {
          setSuggestions({ community: normalize(community), reader: normalize(reader) });
        }
        setNoMatches(community.length === 0 && reader.length === 0);
        setShowNoMatchesPrelim(false);
      } catch {
        if (!active) return;
        setSuggestions({ community: [], reader: [] });
        setNoMatches(true);
        setShowNoMatchesPrelim(false);
      } finally {
        if (active) setLoadingSuggestions(false);
      }
    }, 25);

    return () => {
      active = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [searchValue]);

  // Compute "Did you mean" when no matches
  useEffect(() => {
    const q = searchValue.trim();
    if (!(noMatches || showNoMatchesPrelim) || q.length < 2) {
      setDidYouMean(null);
      return;
    }
    let active = true;
    const controller = new AbortController();
    (async () => {
      try {
        const wpResult = await fetchWordPressPosts({ perPage: 24, includeContent: false, search: q, signal: controller.signal } as any);
        const wpPosts = Array.isArray((wpResult as any)?.posts) ? (wpResult as any).posts : [];
        let best: any = null;
        let bestScore = Infinity;
        const qLower = q.toLowerCase();
        for (const p of wpPosts) {
          const t = String(p?.title?.rendered || "").toLowerCase();
          if (!t) continue;
          const score = levenshtein(qLower, t.slice(0, Math.max(qLower.length, 16)));
          if (score < bestScore) {
            bestScore = score;
            best = p;
          }
        }
        if (active && best) {
          const threshold = Math.max(1, Math.round(qLower.length * 0.3));
          if (bestScore <= threshold) {
            setDidYouMean({ title: best?.title?.rendered || "Untitled", url: `/reader/${encodeURIComponent(best?.slug || best?.id)}` });
          } else {
            setDidYouMean(null);
          }
        } else if (active) {
          setDidYouMean(null);
        }
      } catch {
        if (active) setDidYouMean(null);
      }
    })();
    return () => {
      active = false;
      controller.abort();
    };
  }, [noMatches, showNoMatchesPrelim, searchValue]);

  // Simple Levenshtein distance for "Did you mean" suggestions
  const levenshtein = (a: string, b: string): number => {
    const m = a.length,
      n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = new Array(n + 1);
    for (let j = 0; j <= n; j++) dp[j] = j;
    for (let i = 1; i <= m; i++) {
      let prev = dp[0];
      dp[0] = i;
      for (let j = 1; j <= n; j++) {
        const tmp = dp[j];
        dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1));
        prev = tmp;
      }
    }
    return dp[n];
  };

  // Close the sidebar drawer proactively on route changes
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    try {
      document.body.style.paddingRight = "";
    } catch {}
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // Idle prefetch auth-related routes
  useEffect(() => {
    prefetchAuthPages();
  }, []);

  // Reader route progress state (for in-header progress bar)
  const [scrollProgress, setScrollProgress] = useState(0);
  const isReaderRoute = typeof location === "string" && location.includes("/reader");

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

  // Prefetch route chunks for top nav to avoid Suspense blanks
  const prefetchRoute = (href: string) => {
    try {
      switch (href) {
        case "/":
          void import("../../pages/home");
          break;
        case "/stories":
        case "/index":
          void import("../../pages/index");
          break;
        case "/reader":
          void import("../../pages/reader");
          break;
        case "/community":
          void import("../../pages/community");
          break;
        case "/about":
          void import("../../pages/about");
          break;
        default:
          break;
      }
    } catch {}
  };

  // Async prefetch that returns the import promise (used on click)
  const prefetchRouteAsync = (href: string): Promise<any> => {
    try {
      switch (href) {
        case "/":
          return import("../../pages/home");
        case "/stories":
          return import("../../pages/index");
        case "/index":
          return import("../../pages/index");
        case "/reader":
          return import("../../pages/reader");
        case "/community":
          return import("../../pages/community");
        case "/about":
          return import("../../pages/about");
        case "/search":
          return import("../../pages/search-results");
        case "/bookmarks":
          return import("../../pages/bookmarks");
        case "/profile":
          return import("../../pages/profile");
        default:
          return Promise.resolve();
      }
    } catch {
      return Promise.resolve();
    }
  };

  return (
    <>
      <header
        className={`w-full bg-transparent supports-[backdrop-filter]:bg-transparent backdrop-blur-md shadow-sm`}
        style={{
          position: "relative",
          margin: 0,
          padding: 0,
          width: "100%",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "6px",
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
                  className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95"
                  aria-label="Open menu"
                  onClick={() => setIsOpen((v) => !v)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                data-sidebar="sidebar"
                data-mobile="true"
                className="p-0 w-[300px] max-w-[85vw] h-full bg-transparent backdrop-blur-md border-r border-border/50 shadow-2xl"
              >
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
                ${location === href ? "text-primary font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary" : "text-foreground hover:text-foreground/80"}`}
                aria-current={location === href ? "page" : undefined}
                onMouseEnter={() => prefetchRoute(href)}
                onFocus={() => prefetchRoute(href)}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="relative flex items-center space-x-2">
            {/* Search toggle */}
            <Button
              id="nav-search-button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <NotificationIcon className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95" />

            {/* Theme dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95"
                  aria-label="Change theme"
                >
                  {theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : theme === "sky" ? (
                    <Cloud className="h-5 w-5" />
                  ) : (
                    <Leaf className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as any)}>
                  <DropdownMenuRadioItem value="dark" className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="light" className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="sky" className="flex items-center gap-2">
                    <Cloud className="h-4 w-4" /> Sky
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="eco" className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" /> Eco
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {!user ? (
              <Button
                variant="ghost"
                size="icon"
                onMouseEnter={prefetchAuthPages}
                onFocus={prefetchAuthPages}
                onClick={() => {
                  if (isOpen) setIsOpen(false);
                  try {
                    document.body.style.paddingRight = "";
                  } catch {}
                  prefetchAuthPages();
                  setLocation("/auth");
                }}
                className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95"
                aria-label="Sign in"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-lg border border-border bg-card hover:bg-muted hover:-translate-y-[1px] will-change-transform text-foreground transition-colors transition-transform duration-200 ease-out active:scale-95"
              >
                <User className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Animated search panel positioned relative to header */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute left-0 right-0 top-full mt-2 z-[120]"
            >
              <div ref={panelRef} className="relative mx-auto" style={{ width: "min(calc(100vw - 48px), 600px)" }}>
                {/* Search bar */}
                <div
                  className="rounded-[10px]"
                  style={{
                    background: "#404040",
                    color: "#E0E0E0",
                    border: "1px solid #7B61FF",
                    overflow: "hidden",
                  }}
                >
                  <div className="relative h-9 w-full">
                    <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#AFAFAF" }} />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search for stories..."
                      value={searchValue}
                      onChange={(e) => {
                        setSearchValue(e.target.value);
                        setActiveIdx(-1);
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setActiveIdx((prev) => Math.min(flatSuggestions.length - 1, prev + 1));
                        } else if (e.key === "ArrowUp") {
                          e.preventDefault();
                          setActiveIdx((prev) => Math.max(0, prev - 1));
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          const item = flatSuggestions[activeIdx];
                          if (item) {
                            const href = String(item.url || "");
                            const done = prefetchRouteAsync(item.group === "reader" ? "/reader" : href).catch(() => {});
                            const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                            Promise.race([done, cap]).then(() => {
                              try {
                                sessionStorage.removeItem("nav-search-query");
                              } catch {}
                              setSearchOpen(false);
                              setLocation(href);
                            });
                          } else {
                            const q = searchValue.trim();
                            const href = "/search";
                            const done = prefetchRouteAsync(href).catch(() => {});
                            const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                            Promise.race([done, cap]).then(() => {
                              setSearchOpen(false);
                              setLocation(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                            });
                          }
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setSearchOpen(false);
                        }
                      }}
                      className="w-full pl-12 pr-32 h-9 text-base bg-transparent border-none focus-visible:ring-0 focus-visible:outline-none focus:ring-0 focus:outline-none text-[#E0E0E0] placeholder-[#AFAFAF] caret-[#7B61FF]"
                      style={{ background: "transparent", border: "none" }}
                      role="combobox"
                      aria-expanded={true}
                      aria-controls="nav-suggestions-list"
                      aria-autocomplete="list"
                      aria-activedescendant={
                        activeIdx >= 0 && flatSuggestions[activeIdx]
                          ? `nav-suggestion-${flatSuggestions[activeIdx].group}-${flatSuggestions[activeIdx].id}`
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Advanced Search bar */}
                <div
                  className="mt-1 rounded-[10px]"
                  style={{
                    background: "#1a1a1a",
                    color: "#E0E0E0",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div className="h-9 w-full flex items-center justify-center">
                    <button
                      className="flex items-center justify-center w-full h-full text-base leading-none transition-colors"
                      style={{ color: "#6A54E6" }}
                      onClick={() => {
                        const href = "/search";
                        const done = prefetchRouteAsync(href).catch(() => {});
                        const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                        Promise.race([done, cap]).then(() => {
                          setSearchOpen(false);
                          const q = encodeURIComponent(searchValue.trim());
                          setLocation(q ? `/search?q=${q}` : "/search");
                        });
                      }}
                      title="Open advanced search"
                    >
                      Advanced Search
                    </button>
                  </div>
                </div>

                {/* Suggestions */}
                {searchValue.trim().length > 0 && (
                  <div
                    className="mt-1 rounded-[10px] overflow-hidden"
                    style={{
                      background: "#242424",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="p-3" id="nav-suggestions-list" role="listbox" aria-label="Search suggestions">
                      {suggestions.community.length + suggestions.reader.length > 0 ? (
                        <div className="space-y-3">
                          {suggestions.reader.length > 0 && (
                            <div>
                              <div className="text-xs" style={{ color: "#AFAFAF" }}>
                                Reader
                              </div>
                              <ul className="space-y-1">
                                {suggestions.reader.map((s: any) => (
                                  <li key={s.id}>
                                    <button
                                      id={`nav-suggestion-reader-${s.id}`}
                                      role="option"
                                      aria-selected={
                                        flatSuggestions[activeIdx]?.id === s.id &&
                                        flatSuggestions[activeIdx]?.group === "reader"
                                      }
                                      className={`w-full text-left text-sm transition-colors ${
                                        flatSuggestions[activeIdx]?.id === s.id &&
                                        flatSuggestions[activeIdx]?.group === "reader"
                                          ? "bg-foreground/10 rounded-md"
                                          : ""
                                      }`}
                                      onMouseEnter={() => {
                                        const idx = flatSuggestions.findIndex(
                                          (i) => i.id === s.id && i.group === "reader"
                                        );
                                        if (idx >= 0) setActiveIdx(idx);
                                      }}
                                      onFocus={() => {
                                        const idx = flatSuggestions.findIndex(
                                          (i) => i.id === s.id && i.group === "reader"
                                        );
                                        if (idx >= 0) setActiveIdx(idx);
                                      }}
                                      onClick={() => {
                                        const href = String(s.url || "");
                                        const done = prefetchRouteAsync("/reader").catch(() => {});
                                        const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                                        Promise.race([done, cap]).then(() => {
                                          try {
                                            sessionStorage.removeItem("nav-search-query");
                                          } catch {}
                                          setSearchOpen(false);
                                          setLocation(href);
                                        });
                                      }}
                                      title={String(s.title || "")}
                                      style={{ color: "#E0E0E0" }}
                                    >
                                      <div className="text-left">
                                        <div className="text-sm">{highlight(String(s.title || ""), searchValue)}</div>
                                        <div className="text-xs truncate mt-0.5" style={{ color: "#AFAFAF" }}>
                                          {String(s.excerpt || "")}
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {suggestions.community.length > 0 && (
                            <div>
                              <div className="text-xs" style={{ color: "#AFAFAF" }}>
                                Community
                              </div>
                              <ul className="space-y-1">
                                {suggestions.community.map((s: any) => (
                                  <li key={s.id}>
                                    <button
                                      id={`nav-suggestion-community-${s.id}`}
                                      role="option"
                                      aria-selected={
                                        flatSuggestions[activeIdx]?.id === s.id &&
                                        flatSuggestions[activeIdx]?.group === "community"
                                      }
                                      className={`w-full text-left text-sm transition-colors ${
                                        flatSuggestions[activeIdx]?.id === s.id &&
                                        flatSuggestions[activeIdx]?.group === "community"
                                          ? "bg-foreground/10 rounded-md"
                                          : ""
                                      }`}
                                      onMouseEnter={() => {
                                        const idx = flatSuggestions.findIndex(
                                          (i) => i.id === s.id && i.group === "community"
                                        );
                                        if (idx >= 0) setActiveIdx(idx);
                                      }}
                                      onFocus={() => {
                                        const idx = flatSuggestions.findIndex(
                                          (i) => i.id === s.id && i.group === "community"
                                        );
                                        if (idx >= 0) setActiveIdx(idx);
                                      }}
                                      onClick={() => {
                                        const href = String(s.url || "");
                                        const done = prefetchRouteAsync(href).catch(() => {});
                                        const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                                        Promise.race([done, cap]).then(() => {
                                          try {
                                            sessionStorage.removeItem("nav-search-query");
                                          } catch {}
                                          setSearchOpen(false);
                                          setLocation(href);
                                        });
                                      }}
                                      title={String(s.title || "")}
                                      style={{ color: "#E0E0E0" }}
                                    >
                                      <div className="text-left">
                                        <div className="text-sm">{highlight(String(s.title || ""), searchValue)}</div>
                                        <div className="text-xs truncate mt-0.5" style={{ color: "#AFAFAF" }}>
                                          {String(s.excerpt || "")}
                                        </div>
                                      </div>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        (noMatches || showNoMatchesPrelim) && (
                          <div className="space-y-1" aria-live="polite">
                            <div className="text-sm" style={{ color: "#AFAFAF" }}>
                              No stories found
                            </div>
                            {didYouMean && (
                              <button
                                className="text-sm underline"
                                style={{ color: "#7B61FF" }}
                                onClick={() => {
                                  const href = String(didYouMean?.url || "");
                                  const done = prefetchRouteAsync(href.startsWith("/reader") ? "/reader" : href).catch(
                                    () => {}
                                  );
                                  const cap = new Promise<void>((resolve) => setTimeout(resolve, 100));
                                  Promise.race([done, cap]).then(() => {
                                    setSearchOpen(false);
                                    setLocation(href);
                                  });
                                }}
                                title={String(didYouMean?.title || "")}
                              >
                                Did you mean “{String(didYouMean?.title || "")}”?
                              </button>
                            )}
                            <div className="text-xs" style={{ color: "#AFAFAF" }}>
                              Try Advanced Search for more results.
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            zIndex: 40,
          }}
        />

        {/* Reader-only in-header progress bar */}
        {isReaderRoute && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              transform: "none",
              bottom: "-1px",
              width: "100%",
              height: "3px",
              zIndex: 41,
              pointerEvents: "none",
              background: "transparent",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                transformOrigin: "left center",
                transform: `scaleX(${Math.max(0, Math.min(1, scrollProgress / 100))}) translateZ(0)`,
                willChange: "transform",
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              }}
            />
          </div>
        )}
      </header>
    </>
  );
}