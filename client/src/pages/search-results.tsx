import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Loader2, BookOpen, SlidersHorizontal, ChevronDown, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWordPressPosts, getExcerpt } from "@/lib/wordpress-api";

interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  type: "post" | "page";
  url: string;
  date?: string;
  matches: {
    field: string;
    text: string;
    context?: string;
    position: number;
  }[];
}

export default function SearchResultsPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);

  // Suggestion state
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filters
  const [category, setCategory] = useState<string>("all");
  const [from, setFrom] = useState<string>("all");
  const [sort, setSort] = useState<'relevance' | 'newest' | 'oldest'>('relevance');

  // Recent searches
  const [recent, setRecent] = useState<string[]>([]);

  // Locally cached posts for suggestion scoring (mirrors Index page behavior)
  const [indexPosts, setIndexPosts] = useState<Array<{ id: number; title: string; slug: string }>>([]);

  // Helpers for WordPress fallback: strip HTML and extract context around matched terms
  const stripHtml = (html: string) => {
    try {
      return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    } catch {
      return html;
    }
  };
  const extractContexts = (text: string, query: string, max = 3): { context: string; position: number }[] => {
    const q = query.trim();
    if (!text || !q) return [];
    const lower = text.toLowerCase();
    const qLower = q.toLowerCase();
    const contexts: { context: string; position: number }[] = [];
    let start = 0;
    while (contexts.length < max) {
      const idx = lower.indexOf(qLower, start);
      if (idx === -1) break;
      const snippetStart = Math.max(0, idx - 80);
      const snippetEnd = Math.min(text.length, idx + q.length + 80);
      const snippet = text.slice(snippetStart, snippetEnd).trim();
      contexts.push({ context: snippet, position: idx });
      start = idx + q.length;
    }
    return contexts;
  };
  const levenshtein = (a: string, b: string) => {
    const m = a.length,
      n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  };

  // Perform search across all content with WordPress fallback when local DB returns no results
  const performSearch = useCallback(
    async (query: string, pageNum = 1) => {
      if (!query.trim()) return;

      setIsSearching(true);

      try {
        const qs = new URLSearchParams();
        qs.set("q", query);
        qs.set("types", "posts"); // focus on stories
        qs.set("limit", "10");
        qs.set("page", String(pageNum));
        if (from !== "all") qs.set("from", from);
        if (category !== "all") qs.set("category", category);

        const { results, meta } = await apiJson<any>("GET", `/api/search?${qs.toString()}`);

        const mapped: SearchResult[] = (results || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          excerpt: r.excerpt,
          content: "",
          type: r.type === "post" || r.type === "page" ? r.type : "post",
          url: r.url,
          date: r.date || r.createdAt || r.publishedAt || r.updatedAt,
          matches: (r.matches || []).map((m: any) => ({
            field: "content",
            text: m.context || m.text || "",
            position: 0,
          })),
        }));

        let finalResults = mapped;
        let finalPages = meta?.pages || 1;
        let finalPage = meta?.page || pageNum;
        let finalTotal = meta?.total ?? mapped.length;
        let usedFallback = false;
        let finalDidYouMean: string | null = meta?.didYouMean || null;

        // Helpers to apply client-side time filter and sorting when available
        const withinRange = (dateStr?: string) => {
          if (!dateStr || from === "all") return true;
          const days = parseInt(from, 10);
          if (!Number.isFinite(days)) return true;
          const d = new Date(dateStr);
          if (!Number.isFinite(d.getTime())) return true;
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
          return d.getTime() >= cutoff;
        };
        const applyFiltersAndSort = (arr: SearchResult[]) => {
          let out = arr;
          if (from !== "all") out = out.filter((r) => withinRange(r.date));
          if (sort !== "relevance") {
            out = [...out].sort((a, b) => {
              const da = a.date ? new Date(a.date).getTime() : 0;
              const db = b.date ? new Date(b.date).getTime() : 0;
              return sort === "newest" ? db - da : da - db;
            });
          }
          return out;
        };

        // Apply on server results (in case server doesn't handle these)
        finalResults = applyFiltersAndSort(finalResults);

        // Fallback to WordPress when no local results
        if (mapped.length === 0) {
          try {
            const wp = await fetchWordPressPosts({ perPage: 20, includeContent: true, search: query });
            const wpPosts = Array.isArray((wp as any)?.posts) ? (wp as any).posts : [];
            const wpMapped: SearchResult[] = wpPosts.map((p: any) => {
              const title = p?.title?.rendered || "Untitled";
              const rawExcerpt = p?.excerpt?.rendered || "";
              const rawContent = p?.content?.rendered || "";
              const text = stripHtml(rawContent || rawExcerpt);
              const contexts = extractContexts(text, query, 3);
              return {
                id: p.id,
                title,
                excerpt: getExcerpt(rawExcerpt || rawContent || ""),
                content: "",
                type: "post",
                url: `/reader/${p.slug || p.id}`,
                date: p?.date,
                matches: contexts.map((c) => ({ field: "content", text: c.context, context: c.context, position: c.position })),
              };
            });
            const filteredSorted = applyFiltersAndSort(wpMapped);
            finalResults = filteredSorted;
            finalPages = 1;
            finalPage = 1;
            finalTotal = filteredSorted.length;
            usedFallback = true;

            // Did you mean from WordPress titles (closest by Levenshtein, only when improvement is meaningful)
            if (!finalDidYouMean && wpMapped.length > 0) {
              const qNorm = query.trim().toLowerCase();
              let best = { title: "", dist: Infinity };
              for (const r of wpMapped) {
                const t = r.title.toLowerCase();
                const d = levenshtein(qNorm, t);
                if (d < best.dist) best = { title: r.title, dist: d };
              }
              if (best.dist > 0 && best.dist <= Math.max(2, Math.floor(qNorm.length * 0.3))) {
                finalDidYouMean = best.title;
              }
            }
          } catch {
            // swallow WP fallback errors to avoid breaking UX
          }
        }

        // Final safety net: if still no results, use client-side heuristics from preloaded titles
        if (finalResults.length === 0 && indexPosts.length > 0) {
          const normalizeText = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const tokenize = (s: string) => normalizeText(s.toLowerCase()).split(/[^a-z0-9]+/).filter(Boolean);
          const jaccard = (a: string[], b: string[]) => {
            if (!a.length || !b.length) return 0;
            const setA = new Set(a);
            const setB = new Set(b);
            const inter = [...setA].filter((x) => setB.has(x)).length;
            const union = new Set([...a, ...b]).size;
            return inter / union;
          };
          const qTokens = tokenize(query);
          const qLower = query.toLowerCase();

          const scored = indexPosts.map((p) => {
            const t = String(p.title || "");
            const tTokens = tokenize(t);
            let minD = Infinity;
            for (const qt of qTokens) {
              for (const tt of tTokens) {
                const d = levenshtein(qt, tt);
                if (d < minD) minD = d;
              }
            }
            const includesBonus = t.toLowerCase().includes(qLower) ? 3 : 0;
            const j = jaccard(qTokens, tTokens);
            const distanceBoost = Number.isFinite(minD) ? (minD <= 2 ? 2 - minD : -minD * 0.15) : 0;
            const score = includesBonus + j * 2 + distanceBoost;
            return { p, score };
          });

          const top = scored
            .filter((x) => x.score > 0.5)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((x) => ({
              id: x.p.id,
              title: x.p.title,
              excerpt: "",
              content: "",
              type: "post" as const,
              url: `/reader/${encodeURIComponent(x.p.slug)}`,
              matches: [],
            }));

          if (top.length > 0) {
            finalResults = top;
            finalPages = 1;
            finalPage = 1;
            finalTotal = top.length;
          }
        }

        setSearchResults(finalResults);
        setPage(finalPage);
        setPages(finalPages);
        setDidYouMean(finalDidYouMean);

        // Show toast with result count
        toast({
          title: `Search Results for "${query}"`,
          description:
            (finalTotal !== undefined
              ? `${finalTotal} total results`
              : `Found ${finalResults.length} ${finalResults.length === 1 ? "result" : "results"}`) +
            (usedFallback && finalResults.length > 0 ? " (via WordPress)" : ""),
          duration: 3000,
        });
      } catch (error) {
        console.error("Search error:", error);
        // Try WordPress fallback on error as well
        try {
          const wp = await fetchWordPressPosts({ perPage: 20, includeContent: true, search: query });
          const wpPosts = Array.isArray((wp as any)?.posts) ? (wp as any).posts : [];
          const wpMapped: SearchResult[] = wpPosts.map((p: any) => {
            const title = p?.title?.rendered || "Untitled";
            const rawExcerpt = p?.excerpt?.rendered || "";
            const rawContent = p?.content?.rendered || "";
            const text = stripHtml(rawContent || rawExcerpt);
            const contexts = extractContexts(text, query, 3);
            return {
              id: p.id,
              title,
              excerpt: getExcerpt(rawExcerpt || rawContent || ""),
              content: "",
              type: "post",
              url: `/reader/${p.slug || p.id}`,
              date: p?.date,
              matches: contexts.map((c) => ({ field: "content", text: c.context, context: c.context, position: c.position })),
            };
          });

          // Apply time filter and sort on fallback results
          const filteredSorted = wpMapped
            .filter((r) => {
              if (from === "all") return true;
              const days = parseInt(from, 10);
              const d = r.date ? new Date(r.date) : null;
              if (!d || !Number.isFinite(d.getTime())) return true;
              const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
              return d.getTime() >= cutoff;
            })
            .sort((a, b) => {
              if (sort === "relevance") return 0;
              const da = a.date ? new Date(a.date).getTime() : 0;
              const db = b.date ? new Date(b.date).getTime() : 0;
              return sort === "newest" ? db - da : da - db;
            });

          setSearchResults(filteredSorted);
          setPage(1);
          setPages(1);
          setDidYouMean(null);

          toast({
            title: `Search Results for "${query}"`,
            description: `Found ${filteredSorted.length} ${filteredSorted.length === 1 ? "result" : "results"} (via WordPress)`,
            duration: 3000,
          });
        } catch {
          toast({
            title: "Search Error",
            description: "Failed to complete your search. Please try again.",
            variant: "destructive",
            duration: 3000,
          });
        }
      } finally {
        setIsSearching(false);
      }
    },
    [toast, category, from, sort, indexPosts]
  );

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location, performSearch]);

  // Re-run search when filters/sort change
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery, 1);
    }
  }, [from, sort, performSearch]);

  // Preload posts for local suggestion scoring (mirrors Index page approach)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const collected: Array<{ id: number; title: string; slug: string }> = [];
        // Fetch up to ~90 latest posts for rich suggestions without heavy payload
        for (let p = 1; p <= 3; p++) {
          const res = await fetchWordPressPosts({ page: p, perPage: 30, includeContent: false });
          const posts = Array.isArray((res as any)?.posts) ? (res as any).posts : [];
          for (const wp of posts) {
            collected.push({
              id: wp.id,
              title: String(wp?.title?.rendered || "Untitled"),
              slug: String(wp?.slug || wp?.id),
            });
          }
          if (posts.length < 30) break;
        }
        if (!mounted) return;
        setIndexPosts(collected);
      } catch {
        if (mounted) setIndexPosts([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Suggestions (typeahead) using the Index page scoring heuristics
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggest(false);
      setActiveIndex(-1);
      return;
    }

    const normalizeText = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const tokenize = (s: string) => normalizeText(s.toLowerCase()).split(/[^a-z0-9]+/).filter(Boolean);
    const jaccard = (a: string[], b: string[]) => {
      if (!a.length || !b.length) return 0;
      const setA = new Set(a);
      const setB = new Set(b);
      const inter = [...setA].filter((x) => setB.has(x)).length;
      const union = new Set([...a, ...b]).size;
      return inter / union;
    };

    const qTokens = tokenize(q);
    const qLower = q.toLowerCase();

    const scored = indexPosts.map((p) => {
      const t = String(p.title || "");
      const tTokens = tokenize(t);
      // minimum edit distance between any token pair
      let minD = Infinity;
      for (const qt of qTokens) {
        for (const tt of tTokens) {
          const d = levenshtein(qt, tt);
          if (d < minD) minD = d;
        }
      }
      const includesBonus = t.toLowerCase().includes(qLower) ? 3 : 0;
      const j = jaccard(qTokens, tTokens);
      const distanceBoost = Number.isFinite(minD) ? (minD <= 2 ? 2 - minD : -minD * 0.15) : 0;
      const score = includesBonus + j * 2 + distanceBoost;
      return { p, score };
    });

    const top = scored
      .filter((x) => x.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => ({
        id: x.p.id,
        title: x.p.title,
        url: `/reader/${encodeURIComponent(x.p.slug)}`,
      }));

    setSuggestions(top);
    setShowSuggest(top.length > 0);
    setActiveIndex(-1);
  }, [searchQuery, indexPosts]);

  // Load/save recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recent-searches");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const pushRecent = (q: string) => {
    try {
      const arr = [q, ...recent.filter((r) => r !== q)].slice(0, 8);
      setRecent(arr);
      localStorage.setItem("recent-searches", JSON.stringify(arr));
    } catch {}
  };

  const removeRecent = (term: string) => {
    try {
      const arr = recent.filter((r) => r !== term);
      setRecent(arr);
      localStorage.setItem("recent-searches", JSON.stringify(arr));
    } catch {}
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, "", `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, 1);
      pushRecent(searchQuery.trim());
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, "gi"));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <ErrorBoundary>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search Results</h1>

        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/50" />
                <Input
                  type="search"
                  placeholder="Search for keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  role="combobox"
                  aria-expanded={showSuggest}
                  aria-controls="advanced-search-suggestions"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeIndex >= 0 && suggestions[activeIndex] ? `advanced-suggestion-${suggestions[activeIndex].id}` : undefined
                  }
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggest(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
                  onKeyDown={(e) => {
                    if (!showSuggest || suggestions.length === 0) {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        e.preventDefault();
                        performSearch(searchQuery, 1);
                      }
                      return;
                    }
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveIndex((prev) => (prev + 1) % suggestions.length);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (activeIndex >= 0 && activeIndex < suggestions.length) {
                        window.location.href = suggestions[activeIndex].url;
                      } else if (searchQuery.trim()) {
                        performSearch(searchQuery, 1);
                      }
                    } else if (e.key === "Escape") {
                      setShowSuggest(false);
                    }
                  }}
                />
                {showSuggest && suggestions.length > 0 && (
                  <div
                    className="absolute z-20 mt-0 w-full bg-background border border-border rounded-md shadow-sm overflow-hidden"
                    role="listbox"
                    id="advanced-search-suggestions"
                    aria-label="Suggestions"
                  >
                    <div className="px-3 py-2 text-xs font-medium text-foreground/70 border-b">Suggestions</div>
                    <ul className="max-h-64 overflow-auto py-1">
                      {suggestions.map((s, idx) => (
                        <li key={s.id} role="option" aria-selected={idx === activeIndex} id={`advanced-suggestion-${s.id}`}>
                          <Link href={s.url}>
                            <a className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/30 ${idx === activeIndex ? "bg-accent/20" : ""}`}>
                              <Search className="h-3.5 w-3.5 text-foreground/60" />
                              <span className="truncate">{highlightText(s.title, searchQuery)}</span>
                            </a>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                variant="default"
                className="h-10 px-4"
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(v => !v)}
                aria-expanded={showFilters}
                aria-controls="advanced-filter-panel"
                className="inline-flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            <div className="flex justify-end">
              <AnimatePresence initial={false}>
                {showFilters && (
                  <motion.div
                    id="advanced-filter-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 pt-2">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="PSYCHOLOGICAL">Psychological</SelectItem>
                          <SelectItem value="SUPERNATURAL">Supernatural</SelectItem>
                          <SelectItem value="TECHNOLOGICAL">Technological</SelectItem>
                          <SelectItem value="BODY_HORROR">Body Horror</SelectItem>
                          <SelectItem value="GOTHIC">Gothic</SelectItem>
                          <SelectItem value="APOCALYPTIC">Apocalyptic</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={from} onValueChange={setFrom}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Any time" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">Any time</SelectItem>
                          <SelectItem value="7">Past 7 days</SelectItem>
                          <SelectItem value="30">Past 30 days</SelectItem>
                          <SelectItem value="365">Past year</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sort} onValueChange={(v) => setSort(v as any)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>

        {/* Recent searches */}
        {recent.length > 0 && (
          <div className="mb-6 text-sm">
            <div className="mb-2 text-foreground/70">Recent searches:</div>
            <div className="flex flex-wrap gap-2">
              {recent.map((r) => (
                <div key={r} className="relative">
                  <button
                    type="button"
                    aria-label={`Remove ${r} from recent searches`}
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-muted text-foreground/70 hover:text-foreground flex items-center justify-center"
                    onClick={(e) => { e.stopPropagation(); removeRecent(r); }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <Button variant="outline" size="sm" onClick={() => { setSearchQuery(r); performSearch(r, 1); }}>
                    {r}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Did you mean */}
        {didYouMean && (
          <div className="mb-4 text-sm">
            Did you mean:{" "}
            <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">
              {didYouMean}
            </Link>
            ?
          </div>
        )}

        {/* Search results */}
        {isSearching ? (
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold mb-3">Reader Stories</h2>
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 shadow-sm">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <div className="space-y-2 mt-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-10/12" />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Community Stories</h2>
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 shadow-sm">
                    <Skeleton className="h-6 w-2/3 mb-2" />
                    <div className="space-y-2 mt-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-10/12" />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            {(() => {
              const readerResults = searchResults.filter((r) => r.url?.startsWith("/reader/"));
              const communityResults = searchResults.filter((r) => r.url?.startsWith("/community-story/"));
              return (
                <div className="space-y-10">
                  <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-lg font-semibold mb-3">Reader Stories</h2>
                    {readerResults.length > 0 ? (
                      <div className="space-y-6">
                        {readerResults.map((result) => (
                          <motion.div
                            key={`reader-${result.id}`}
                            className="border rounded-lg p-4 shadow-sm"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            <h3 className="text-xl font-semibold mb-2">
                              <Link href={result.url}>{highlightText(result.title, searchQuery)}</Link>
                            </h3>
                            <div className="space-y-2 mt-3">
                              {result.matches
                                .filter((m) => m.field === "content")
                                .slice(0, 3)
                                .map((match, idx) => (
                                  <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                                    ...{highlightText(match.context || match.text, searchQuery)}...
                                  </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {result.matches.length} {result.matches.length === 1 ? "match" : "matches"}
                              </span>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={result.url} className="inline-flex items-center">
                                  <BookOpen className="mr-1 h-4 w-4" />
                                  Read More
                                </Link>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/60" aria-live="polite">
                        No reader stories matched.
                      </p>
                    )}
                  </motion.section>

                  <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <h2 className="text-lg font-semibold mb-3">Community Stories</h2>
                    {communityResults.length > 0 ? (
                      <div className="space-y-6">
                        {communityResults.map((result) => (
                          <motion.div
                            key={`community-${result.id}`}
                            className="border rounded-lg p-4 shadow-sm"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18 }}
                          >
                            <h3 className="text-xl font-semibold mb-2">
                              <Link href={result.url}>{highlightText(result.title, searchQuery)}</Link>
                            </h3>
                            <div className="space-y-2 mt-3">
                              {result.matches
                                .filter((m) => m.field === "content")
                                .slice(0, 3)
                                .map((match, idx) => (
                                  <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                                    ...{highlightText(match.context || match.text, searchQuery)}...
                                  </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {result.matches.length} {result.matches.length === 1 ? "match" : "matches"}
                              </span>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={result.url} className="inline-flex items-center">
                                  <BookOpen className="mr-1 h-4 w-4" />
                                  Read More
                                </Link>
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/60" aria-live="polite">
                        No community stories matched.
                      </p>
                    )}
                  </motion.section>
                </div>
              );
            })()}
          </>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No results found for "{searchQuery}"</p>
            <p className="text-sm text-muted-foreground mt-2">Try different keywords or check your spelling</p>
          </div>
        ) : null}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(searchQuery, page - 1)}>
              Prev
            </Button>
            <span className="text-sm">
              Page {page} of {pages}
            </span>
            <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(searchQuery, page + 1)}>
              Next
            </Button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}