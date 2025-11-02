import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Loader2, Search, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getBadgeTint } from "@/lib/theme-badges";
import { THEME_CATEGORIES as THEMES_LITE } from "@/lib/themes-lite";
import { fetchWordPressPosts, getExcerpt, getReadingTime } from "@/lib/wordpress-api";


interface SearchResult {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  type: 'post' | 'page';
  url: string;
  matches: {
    field: string;
    text: string;
    context?: string;
    position: number;
  }[];
  themeCategory?: string | null;
  tags?: string[];
  readingTimeMinutes?: number;
  score?: number;
}

export default function SearchResultsPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [category, setCategory] = useState<string>("all");
  const [from, setFrom] = useState<string>("all");
  const [sort, setSort] = useState<string>("relevance");
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  

  // Helpers for WordPress fallback: strip HTML and extract context around matched terms
  const stripHtml = (html: string) => {
    try {
      return html.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim();
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
    const m = a.length, n = b.length;
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
  const performSearch = useCallback(async (query: string, pageNum = 1) => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      const qs = new URLSearchParams();
      qs.set('q', query);
      qs.set('types', 'posts'); // focus on stories
      qs.set('limit', '10');
      qs.set('page', String(pageNum));
      if (from !== 'all') qs.set('from', from);
      if (category !== 'all') qs.set('category', category);
      if (tagFilters.length > 0) qs.set('tags', tagFilters.join(','));
      if (sort) qs.set('sort', sort);
      const { results, meta } = await apiJson<any>('GET', `/api/search?${qs.toString()}`);

      const mapped: SearchResult[] = (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: '',
        type: (r.type === 'post' || r.type === 'page') ? r.type : 'post',
        url: r.url,
        matches: (r.matches || []).map((m: any) => ({ field: 'content', text: m.context || m.text || '', position: 0 })),
        themeCategory: r.themeCategory || r.theme_category || null,
        tags: Array.isArray(r.tags) ? r.tags : [],
        readingTimeMinutes: typeof r.readingTimeMinutes === 'number' ? r.readingTimeMinutes : undefined,
        score: typeof r.score === 'number' ? r.score : undefined
      }));

      let finalResults = mapped;
      let finalPages = meta?.pages || 1;
      let finalPage = meta?.page || pageNum;
      let finalTotal = meta?.total ?? mapped.length;
      let usedFallback = false;
      let finalDidYouMean: string | null = meta?.didYouMean || null;

      // Fallback to WordPress when no local results
      if (mapped.length === 0) {
        try {
          const wp = await fetchWordPressPosts({ perPage: 20, includeContent: true, search: query });
          const wpPosts = Array.isArray((wp as any)?.posts) ? (wp as any).posts : [];
          const wpMapped: SearchResult[] = wpPosts.map((p: any) => {
            const title = p?.title?.rendered || 'Untitled';
            const rawExcerpt = p?.excerpt?.rendered || '';
            const rawContent = p?.content?.rendered || '';
            const text = stripHtml(rawContent || rawExcerpt);
            const contexts = extractContexts(text, query, 3);
            return {
              id: p.id,
              title,
              excerpt: getExcerpt(rawExcerpt || rawContent || ''),
              content: '',
              type: 'post',
              url: `/reader/${p.slug || p.id}`,
              matches: contexts.map((c) => ({ field: 'content', text: c.context, context: c.context, position: c.position })),
              themeCategory: null,
              tags: [],
              readingTimeMinutes: getReadingTime(rawContent || rawExcerpt || '')
            };
          });
          finalResults = wpMapped;
          finalPages = 1;
          finalPage = 1;
          finalTotal = wpMapped.length;
          usedFallback = true;

          // Did you mean from WordPress titles (closest by Levenshtein, only when improvement is meaningful)
          if (!finalDidYouMean && wpMapped.length > 0) {
            const qNorm = query.trim().toLowerCase();
            let best = { title: '', dist: Infinity };
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
            : `Found ${finalResults.length} ${finalResults.length === 1 ? 'result' : 'results'}`) +
          (usedFallback && finalResults.length > 0 ? ' (via WordPress)' : ''),
        duration: 3000
      });
    } catch (error) {
      console.error('Search error:', error);
      // Try WordPress fallback on error as well
      try {
        const wp = await fetchWordPressPosts({ perPage: 20, includeContent: true, search: query });
        const wpPosts = Array.isArray((wp as any)?.posts) ? (wp as any).posts : [];
        const wpMapped: SearchResult[] = wpPosts.map((p: any) => {
          const title = p?.title?.rendered || 'Untitled';
          const rawExcerpt = p?.excerpt?.rendered || '';
          const rawContent = p?.content?.rendered || '';
          const text = stripHtml(rawContent || rawExcerpt);
          const contexts = extractContexts(text, query, 3);
          return {
            id: p.id,
            title,
            excerpt: getExcerpt(rawExcerpt || rawContent || ''),
            content: '',
            type: 'post',
            url: `/reader/${p.slug || p.id}`,
            matches: contexts.map((c) => ({ field: 'content', text: c.context, context: c.context, position: c.position })),
            themeCategory: null,
            tags: [],
            readingTimeMinutes: getReadingTime(rawContent || rawExcerpt || '')
          };
        });

        setSearchResults(wpMapped);
        setPage(1);
        setPages(1);
        setDidYouMean(null);

        toast({
          title: `Search Results for "${query}"`,
          description: `Found ${wpMapped.length} ${wpMapped.length === 1 ? 'result' : 'results'} (via WordPress)`,
          duration: 3000
        });
      } catch {
        toast({
          title: "Search Error",
          description: "Failed to complete your search. Please try again.",
          variant: "destructive",
          duration: 3000
        });
      }
    } finally {
      setIsSearching(false);
    }
  }, [toast, from, category, tagFilters]);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    if (query) {
      setActiveQuery(query);
      setSearchQuery('');
      performSearch(query);
    }
  }, [location, performSearch]);

  // Suggestions (typeahead)
  useEffect(() => {
    const q = searchQuery.trim();
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const url = q.length >= 2 ? `/api/search/suggest?q=${encodeURIComponent(q)}&limit=8` : `/api/search/suggest?limit=8`;
        const resp = await apiJson<any>('GET', url);
        setSuggestions(resp?.suggestions || []);
        setShowSuggest(true);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setShowSuggest(false);
      }
    }, 300);
    return () => { clearTimeout(t); controller.abort(); };
  }, [searchQuery]);

  

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(q)}`);
      setActiveQuery(q);
      performSearch(q, 1);
      setSearchQuery('');
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ))}
      </>
    );
  };

  return (
    <ErrorBoundary>
    <div className="container max-w-4xl mx-auto px-4 py-8">
      
      
      
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
            <Input
              type="search"
              placeholder="Search projects, themes, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-28"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls="advanced-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `advanced-suggestion-${suggestions[activeIndex].id}` : undefined}
              onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && showSuggest && suggestions.length > 0) {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === 'ArrowUp' && showSuggest && suggestions.length > 0) {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === 'Enter') {
                  if (showSuggest && suggestions.length > 0 && activeIndex >= 0 && activeIndex < suggestions.length) {
                    window.location.href = suggestions[activeIndex].url;
                  } else if (searchResults.length > 0) {
                    window.location.href = searchResults[0].url;
                  } else if (searchQuery.trim()) {
                    setActiveQuery(searchQuery.trim());
                    performSearch(searchQuery, 1);
                    setSearchQuery('');
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggest(false);
                }
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowFilters((v) => !v)}>
                Filters
              </Button>
              <Button type="submit" size="sm" disabled={isSearching || !searchQuery.trim()}>
                {isSearching ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            {showSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-background border border-border rounded-md shadow-sm" role="listbox" id="advanced-search-suggestions" aria-label="Suggestions">
                <ul className="max-h-64 overflow-auto py-1">
                  {suggestions.map((s, idx) => (
                    <li key={s.id} role="option" aria-selected={idx === activeIndex} id={`advanced-suggestion-${s.id}`}>
                      <Link href={s.url}>
                        <a className={`block px-3 py-2 text-sm hover:bg-accent/30 ${idx === activeIndex ? 'bg-accent/20' : ''}`}>{s.title}</a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {showFilters && (
            <div className="mt-2 rounded-md border bg-muted/20 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={category} onValueChange={(v) => { setCategory(v); if (activeQuery) performSearch(activeQuery, 1); }}>
                  <SelectTrigger className="w-[220px]"><SelectValue placeholder="Theme" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All themes</SelectItem>
                    {Object.keys(THEMES_LITE).map((name) => (
                      <SelectItem key={name} value={name.toLowerCase()}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={from} onValueChange={(v) => { setFrom(v); if (activeQuery) performSearch(activeQuery, 1); }}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Any time" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any time</SelectItem>
                    <SelectItem value="7">Past 7 days</SelectItem>
                    <SelectItem value="30">Past 30 days</SelectItem>
                    <SelectItem value="365">Past year</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sort} onValueChange={(v) => { setSort(v); if (activeQuery) performSearch(activeQuery, 1); }}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["identity", "madness", "devotion", "fear", "hunger", "machine"].map((tag) => {
                  const active = tagFilters.includes(tag);
                  return (
                    <Button
                      key={tag}
                      type="button"
                      variant={active ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTagFilters((prev) => {
                          const next = active ? prev.filter((t) => t !== tag) : [...prev, tag];
                          if (activeQuery) performSearch(activeQuery, 1);
                          return Array.from(new Set(next)).slice(0, 8);
                        });
                      }}
                    >
                      {tag}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </form>

      

      
      
      {/* Did you mean */}
      {didYouMean && (
        <div className="mb-2 text-sm">
          Did you mean: <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">{didYouMean}</Link>?
        </div>
      )}

      {/* Active query */}
      {activeQuery && (
        <div className="mb-4 text-sm text-foreground/70">
          Results for “{activeQuery}”
        </div>
      )}

      {/* Search results */}
      {isSearching ? (
        <div className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 shadow-sm">
              <Skeleton className="h-6 w-2/3 mb-2" />
              <Skeleton className="h-4 w-full" />
              <div className="mt-3 flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div className="space-y-6">
            {searchResults.map((result) => (
              <motion.div
                key={result.id}
                className="border rounded-lg p-4 shadow-sm"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
              >
                <h3 className="text-xl font-semibold mb-1">
                  <Link href={result.url}>
                    {highlightText(result.title, activeQuery)}
                  </Link>
                </h3>
                <div className="text-sm text-muted-foreground mt-2">
                  {result.excerpt}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {result.themeCategory ? (
                    <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${getBadgeTint(String(result.themeCategory).toUpperCase())}`}>
                      {String(result.themeCategory).replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  ) : null}
                  {(result.tags || []).slice(0, 3).map((t, idx) => (
                    <Badge key={`${result.id}-tag-${idx}`} variant="outline" className="text-[12px] font-medium tracking-wide px-2 py-0.5">
                      {String(t).toLowerCase()}
                    </Badge>
                  ))}
                  {typeof result.readingTimeMinutes === 'number' ? (
                    <span className="ml-auto inline-flex items-center text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {result.readingTimeMinutes} min read
                    </span>
                  ) : null}
                </div>
                
              </motion.div>
            ))}
          </div>
        </motion.section>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No matches found.
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(activeQuery, page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(activeQuery, page + 1)}>Next</Button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}