import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Loader2, Search, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWordPressPosts, getExcerpt, getReadingTime as wpReadingTime } from "@/lib/wordpress-api";

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
  tags?: string[];
  readingTime?: string;
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
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [themeTag, setThemeTag] = useState<string>("any");
  const [from, setFrom] = useState<string>("all");
  const [recent, setRecent] = useState<string[]>([]);

  const popularQueries = ["mind", "mirror", "devotion"];
  const tryQueries = ["fear", "hunger", "machine"];

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
      if (themeTag && themeTag !== 'any') qs.set('tags', themeTag);

      const { results, meta } = await apiJson<any>('GET', `/api/search?${qs.toString()}`);

      const mapped: SearchResult[] = (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: '',
        type: (r.type === 'post' || r.type === 'page') ? r.type : 'post',
        url: r.url,
        matches: (r.matches || []).map((m: any) => ({ field: 'content', text: m.context || m.text || '', position: 0 })),
        tags: Array.isArray(r.tags) ? r.tags : [],
        readingTime: typeof r.readingTime === 'string' ? r.readingTime : undefined
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
              tags: [],
              readingTime: `${wpReadingTime(rawContent || rawExcerpt)} min`
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
        title: `Search results`,
        description:
          (finalTotal !== undefined
            ? `${finalTotal} results`
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
            tags: [],
            readingTime: `${wpReadingTime(rawContent || rawExcerpt)} min`
          };
        });

        setSearchResults(wpMapped);
        setPage(1);
        setPages(1);
        setDidYouMean(null);

        toast({
          title: `Search results`,
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
  }, [toast, from, themeTag]);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    const urlTag = params.get('tags');
    if (urlTag) setThemeTag(urlTag);
    if (query) {
      setSearchQuery(query);
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

  // Load/save recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-searches');
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const pushRecent = (q: string) => {
    try {
      const arr = [q, ...recent.filter(r => r !== q)].slice(0, 8);
      setRecent(arr);
      localStorage.setItem('recent-searches', JSON.stringify(arr));
    } catch {}
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery)}${themeTag && themeTag !== 'any' ? `&tags=${encodeURIComponent(themeTag)}` : ''}`);
      performSearch(searchQuery, 1);
      pushRecent(searchQuery.trim());
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Loader2, Search, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWordPressPosts, getExcerpt, getReadingTime as wpReadingTime } from "@/lib/wordpress-api";

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
  tags?: string[];
  readingTime?: string;
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
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [themeTag, setThemeTag] = useState<string>("any");
  const [from, setFrom] = useState<string>("all");
  const [recent, setRecent] = useState<string[]>([]);

  const popularQueries = ["mind", "mirror", "devotion"];
  const tryQueries = ["fear", "hunger", "machine"];

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
      if (themeTag && themeTag !== 'any') qs.set('tags', themeTag);

      const { results, meta } = await apiJson<any>('GET', `/api/search?${qs.toString()}`);

      const mapped: SearchResult[] = (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: '',
        type: (r.type === 'post' || r.type === 'page') ? r.type : 'post',
        url: r.url,
        matches: (r.matches || []).map((m: any) => ({ field: 'content', text: m.context || m.text || '', position: 0 })),
        tags: Array.isArray(r.tags) ? r.tags : [],
        readingTime: typeof r.readingTime === 'string' ? r.readingTime : undefined
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
              tags: [],
              readingTime: `${wpReadingTime(rawContent || rawExcerpt)} min`
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
        title: `Search results`,
        description:
          (finalTotal !== undefined
            ? `${finalTotal} results`
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
            tags: [],
            readingTime: `${wpReadingTime(rawContent || rawExcerpt)} min`
          };
        });

        setSearchResults(wpMapped);
        setPage(1);
        setPages(1);
        setDidYouMean(null);

        toast({
          title: `Search results`,
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
  }, [toast, from, themeTag]);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    const urlTag = params.get('tags');
    if (urlTag) setThemeTag(urlTag);
    if (query) {
      setSearchQuery(query);
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

  // Load/save recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-searches');
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const pushRecent = (q: string) => {
    try {
      const arr = [q, ...recent.filter(r => r !== q)].slice(0, 8);
      setRecent(arr);
      localStorage.setItem('recent-searches', JSON.stringify(arr));
    } catch {}
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery)}${themeTag && themeTag !== 'any' ? `&tags=${encodeURIComponent(themeTag)}` : ''}`);
      performSearch(searchQuery, 1);
      pushRecent(searchQuery.trim());
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link } from "wouter";
import { Loader2, Search, BookOpen } from "lucide-react";
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
  type: 'post' | 'page';
  url: string;
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
  const [suggestions, setSuggestions] = useState<{ id: number | string; title: string; url: string }[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [category, setCategory] = useState<string>("all");
  const [from, setFrom] = useState<string>("all");
  const [recent, setRecent] = useState<string[]>([]);
  

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

      const { results, meta } = await apiJson<any>('GET', `/api/search?${qs.toString()}`);

      const mapped: SearchResult[] = (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        content: '',
        type: (r.type === 'post' || r.type === 'page') ? r.type : 'post',
        url: r.url,
        matches: (r.matches || []).map((m: any) => ({ field: 'content', text: m.context || m.text || '', position: 0 }))
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
              matches: contexts.map((c) => ({ field: 'content', text: c.context, context: c.context, position: c.position }))
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
            matches: contexts.map((c) => ({ field: 'content', text: c.context, context: c.context, position: c.position }))
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
  }, [toast, from, category]);

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
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

  // Load/save recent searches
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-searches');
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const pushRecent = (q: string) => {
    try {
      const arr = [q, ...recent.filter(r => r !== q)].slice(0, 8);
      setRecent(arr);
      localStorage.setItem('recent-searches', JSON.stringify(arr));
    } catch {}
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(searchQuery)}`);
      performSearch(searchQuery, 1);
      pushRecent(searchQuery.trim());
    }
  };

  // Highlight matched text in a string
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}')})`, 'gi'));
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
              placeholder="Search by title, theme, or word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls="advanced-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `advanced-suggestion-${suggestions[activeIndex].id}` : undefined}
              onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // If a suggestion is active, follow it; otherwise open first result if available
                  if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    e.preventDefault();
                    window.location.href = suggestions[activeIndex].url;
                    return;
                  }
                  if (!showSuggest && searchResults.length > 0) {
                    e.preventDefault();
                    window.location.href = searchResults[0].url;
                    return;
                  }
                }
                if (!showSuggest || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === 'Escape') {
                  setShowSuggest(false);
                }
              }}
            />
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
          <div className="text-xs text-muted-foreground">You can search by title, theme, or word.</div>
          
          <div className="flex items-center gap-2">
            <Select value={themeTag} onValueChange={setThemeTag}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any theme</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
                <SelectItem value="madness">Madness</SelectItem>
                <SelectItem value="devotion">Devotion</SelectItem>
                <SelectItem value="psychological">Psychological</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
                <SelectItem value="gothic">Gothic</SelectItem>
                <SelectItem value="cosmic">Cosmic</SelectItem>
                <SelectItem value="body-horror">Body Horror</SelectItem>
              </SelectContent>
            </Select>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Any time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any time</SelectItem>
                <SelectItem value="7">Past 7 days</SelectItem>
                <SelectItem value="30">Past 30 days</SelectItem>
                <SelectItem value="365">Past year</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Optional curated suggestions */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs text-muted-foreground mr-1">Popular:</span>
            {popularQueries.map((q) => (
              <Button key={`pop-${q}`} variant="outline" size="sm" onClick={() => { setSearchQuery(q); performSearch(q, 1); }}>
                {q}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground ml-3 mr-1">Try:</span>
            {tryQueries.map((q) => (
              <Button key={`try-${q}`} variant="outline" size="sm" onClick={() => { setSearchQuery(q); performSearch(q, 1); }}>
                {q}
              </Button>
            ))}
          </div>
        </div>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mb-6 text-sm">
          <div className="mb-2 text-foreground/70">Recent searches:</div>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <Button key={r} variant="outline" size="sm" onClick={() => { setSearchQuery(r); performSearch(r, 1); }}>
                {r}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Did you mean */}
      {didYouMean && (
        <div className="mb-4 text-sm">
          Did you mean: <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">{didYouMean}</Link>?
        </div>
      )}

      {/* Search results */}
      {isSearching ? (
        <div className="space-y-10">
          <section aria-busy="true" aria-live="polite">
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 shadow-sm">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="space-y-2 mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-6">
          {searchResults.map(result => (
            <motion.div key={result.id} className="border rounded-lg p-4 shadow-sm"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              <h3 className="text-xl font-semibold mb-1">
                <Link href={result.url}>
                  {highlightText(result.title, searchQuery)}
                </Link>
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                {result.readingTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {result.readingTime} read
                  </span>
                )}
                {Array.isArray(result.tags) && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 4).map((t, idx) => (
                      <span key={`${result.id}-tag-${idx}`} className="px-2 py-0.5 rounded bg-muted text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/80">{highlightText(result.excerpt, searchQuery)}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {result.matches?.length || 0} {result.matches?.length === 1 ? 'match' : 'matches'}
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
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No matches found — maybe try another word.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Popular: {popularQueries.join(", ")}. Try: {tryQueries.join(", ")}.
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(searchQuery, page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(searchQuery, page + 1)}>Next</Button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
})`, 'gi'));
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
      
      <h1 className="text-2xl font-bold mb-6">Search Results</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
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
              aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `advanced-suggestion-${suggestions[activeIndex].id}` : undefined}
              onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              onKeyDown={(e) => {
                if (!showSuggest || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === 'Enter') {
                  if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    window.location.href = suggestions[activeIndex].url;
                  } else if (searchQuery.trim()) {
                    performSearch(searchQuery, 1);
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggest(false);
                }
              }}
            />
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
          
          <div className="flex items-center gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="gothic">Gothic</SelectItem>
                <SelectItem value="dark-academia">Dark Academia</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
              </SelectContent>
            </Select>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Any time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any time</SelectItem>
                <SelectItem value="7">Past 7 days</SelectItem>
                <SelectItem value="30">Past 30 days</SelectItem>
                <SelectItem value="365">Past year</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mb-6 text-sm">
          <div className="mb-2 text-foreground/70">Recent searches:</div>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <Button key={r} variant="outline" size="sm" onClick={() => { setSearchQuery(r); performSearch(r, 1); }}>
                {r}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Did you mean */}
      {didYouMean && (
        <div className="mb-4 text-sm">
          Did you mean: <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">{didYouMean}</Link>?
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
          {/* Split into Reader vs Community */}
          {(() => {
            const readerResults = searchResults.filter(r => r.url?.startsWith('/reader/'));
            const communityResults = searchResults.filter(r => r.url?.startsWith('/community-story/'));
            return (
              <div className="space-y-10">
                <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-lg font-semibold mb-3">Reader Stories</h2>
                  {readerResults.length > 0 ? (
                    <div className="space-y-6">
                      {readerResults.map(result => (
                        <motion.div key={`reader-${result.id}`} className="border rounded-lg p-4 shadow-sm"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                          <h3 className="text-xl font-semibold mb-2">
                            <Link href={result.url}>
                              {highlightText(result.title, searchQuery)}
                            </Link>
                          </h3>
                          <div className="space-y-2 mt-3">
                            {result.matches
                              .filter(m => m.field === 'content')
                              .slice(0, 3)
                              .map((match, idx) => (
                                <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                                  ...{highlightText(match.context || match.text, searchQuery)}...
                                </div>
                              ))}
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
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
                    <p className="text-sm text-foreground/60" aria-live="polite">No reader stories matched.</p>
                  )}
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <h2 className="text-lg font-semibold mb-3">Community Stories</h2>
                  {communityResults.length > 0 ? (
                    <div className="space-y-6">
                      {communityResults.map(result => (
                        <motion.div key={`community-${result.id}`} className="border rounded-lg p-4 shadow-sm"
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                          <h3 className="text-xl font-semibold mb-2">
                            <Link href={result.url}>
                              {highlightText(result.title, searchQuery)}
                            </Link>
                          </h3>
                          <div className="space-y-2 mt-3">
                            {result.matches
                              .filter(m => m.field === 'content')
                              .slice(0, 3)
                              .map((match, idx) => (
                                <div key={idx} className="text-sm text-gray-700 dark:text-gray-300 bg-muted/50 p-2 rounded">
                                  ...{highlightText(match.context || match.text, searchQuery)}...
                                </div>
                              ))}
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {result.matches.length} {result.matches.length === 1 ? 'match' : 'matches'}
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
                    <p className="text-sm text-foreground/60" aria-live="polite">No community stories matched.</p>
                  )}
                </motion.section>
              </div>
            );
          })()}
        </>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No results found for "{searchQuery}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(searchQuery, page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(searchQuery, page + 1)}>Next</Button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}')})`, 'gi'));
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
              placeholder="Search by title, theme, or word..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls="advanced-search-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 && suggestions[activeIndex] ? `advanced-suggestion-${suggestions[activeIndex].id}` : undefined}
              onFocus={() => { if (suggestions.length > 0) setShowSuggest(true); }}
              onBlur={() => setTimeout(() => setShowSuggest(false), 120)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // If a suggestion is active, follow it; otherwise open first result if available
                  if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    e.preventDefault();
                    window.location.href = suggestions[activeIndex].url;
                    return;
                  }
                  if (!showSuggest && searchResults.length > 0) {
                    e.preventDefault();
                    window.location.href = searchResults[0].url;
                    return;
                  }
                }
                if (!showSuggest || suggestions.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev + 1) % suggestions.length);
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                } else if (e.key === 'Escape') {
                  setShowSuggest(false);
                }
              }}
            />
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
          <div className="text-xs text-muted-foreground">You can search by title, theme, or word.</div>
          
          <div className="flex items-center gap-2">
            <Select value={themeTag} onValueChange={setThemeTag}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Theme" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any theme</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
                <SelectItem value="madness">Madness</SelectItem>
                <SelectItem value="devotion">Devotion</SelectItem>
                <SelectItem value="psychological">Psychological</SelectItem>
                <SelectItem value="supernatural">Supernatural</SelectItem>
                <SelectItem value="gothic">Gothic</SelectItem>
                <SelectItem value="cosmic">Cosmic</SelectItem>
                <SelectItem value="body-horror">Body Horror</SelectItem>
              </SelectContent>
            </Select>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Any time" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any time</SelectItem>
                <SelectItem value="7">Past 7 days</SelectItem>
                <SelectItem value="30">Past 30 days</SelectItem>
                <SelectItem value="365">Past year</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Optional curated suggestions */}
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs text-muted-foreground mr-1">Popular:</span>
            {popularQueries.map((q) => (
              <Button key={`pop-${q}`} variant="outline" size="sm" onClick={() => { setSearchQuery(q); performSearch(q, 1); }}>
                {q}
              </Button>
            ))}
            <span className="text-xs text-muted-foreground ml-3 mr-1">Try:</span>
            {tryQueries.map((q) => (
              <Button key={`try-${q}`} variant="outline" size="sm" onClick={() => { setSearchQuery(q); performSearch(q, 1); }}>
                {q}
              </Button>
            ))}
          </div>
        </div>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mb-6 text-sm">
          <div className="mb-2 text-foreground/70">Recent searches:</div>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <Button key={r} variant="outline" size="sm" onClick={() => { setSearchQuery(r); performSearch(r, 1); }}>
                {r}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Did you mean */}
      {didYouMean && (
        <div className="mb-4 text-sm">
          Did you mean: <Link href={`/search?q=${encodeURIComponent(didYouMean)}`} className="text-primary underline">{didYouMean}</Link>?
        </div>
      )}

      {/* Search results */}
      {isSearching ? (
        <div className="space-y-10">
          <section aria-busy="true" aria-live="polite">
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 shadow-sm">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="space-y-2 mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-6">
          {searchResults.map(result => (
            <motion.div key={result.id} className="border rounded-lg p-4 shadow-sm"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
              <h3 className="text-xl font-semibold mb-1">
                <Link href={result.url}>
                  {highlightText(result.title, searchQuery)}
                </Link>
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                {result.readingTime && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {result.readingTime} read
                  </span>
                )}
                {Array.isArray(result.tags) && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {result.tags.slice(0, 4).map((t, idx) => (
                      <span key={`${result.id}-tag-${idx}`} className="px-2 py-0.5 rounded bg-muted text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-foreground/80">{highlightText(result.excerpt, searchQuery)}</p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {result.matches?.length || 0} {result.matches?.length === 1 ? 'match' : 'matches'}
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
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No matches found — maybe try another word.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Popular: {popularQueries.join(", ")}. Try: {tryQueries.join(", ")}.
          </p>
        </div>
      ) : null}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} onClick={() => performSearch(searchQuery, page - 1)}>Prev</Button>
          <span className="text-sm">Page {page} of {pages}</span>
          <Button variant="outline" disabled={page >= pages} onClick={() => performSearch(searchQuery, page + 1)}>Next</Button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}