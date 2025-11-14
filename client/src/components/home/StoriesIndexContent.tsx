import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { type posts } from "@shared/schema";
type Post = typeof posts.$inferSelect;
import { useLocation } from "wouter";
import SEO from "@/components/SEO";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Clock, Calendar, Award, Search, Eye, Heart,
  Ghost, Skull, Brain, Pill, Cpu, Dna, Umbrella, Footprints, CloudRain, Castle, Bug, Radiation,
  UserMinus2, UserPlus, Anchor, AlertTriangle, Building, Worm, Cloud, CloudFog, Flame,
  ForkKnife, Cat, Moon, Dog, Radio, MoonStar, Box, Car, FlaskConical, Trees, Bone, Hourglass
} from "lucide-react";
const LikeDislike = lazy(() => import("@/components/ui/like-dislike").then(m => ({ default: m.LikeDislike })));
import MostLikedList from "@/components/home/MostLikedList";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";


import { getReadingTime, extractEngagingExcerpt } from "@/lib/excerpt-lite";
import { THEME_CATEGORIES } from "@/lib/themes-lite";
import type { WordPressPost } from "@/lib/wordpress-api";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { determineThemeCategory as sharedDetermineThemeCategory, THEME_CATEGORIES as SHARED_THEME_CATEGORIES } from "@shared/theme-categories";
import { getStoryThemeOverride } from "@shared/story-theme-overrides";
import { getThemeDefinitionOverride, syncThemeDefinitionOverridesFromServer } from "@/shared/theme-definitions";
import { getBadgeTint } from "@/lib/theme-badges";
import ContinueReadingBanner from "@/components/ContinueReadingBanner";
import { VirtualScrollArea } from "@/components/ui/VirtualScrollArea";
import { computeTrendingScores } from "@/lib/trending";
import { useThemeCategories } from "@/hooks/use-theme-categories";



// Lightweight converter from WordPress API post to local Post shape
function wpToPost(post: WordPressPost): Post {
  const title = post?.title?.rendered?.trim() || "Untitled Story";
  const content = post?.content?.rendered || "";
  const slug = post?.slug || `post-${post?.id ?? Date.now()}`;
  const createdAt = post?.date ? new Date(post.date) : new Date();
  return {
    id: post.id ?? Math.floor(Math.random() * 100000),
    title,
    content,
    slug,
    createdAt,
    metadata: {}
  } as unknown as Post;
}

export default function StoriesIndexContent() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'shortest'>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Defer heavy search-driven computations to improve INP
  const deferredSearch = React.useDeferredValue(search);
  const [categoryPills, setCategoryPills] = useState<Array<{ key: string; count: number; pretty: string }>>([]);
  const [trendingScores, setTrendingScores] = useState<Record<number, number>>({});
  const [reactionsUnavailable, setReactionsUnavailable] = useState<boolean>(false);
  
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [pageSize, setPageSize] = useState<number>(6);
  const cardsGridRef = React.useRef<HTMLDivElement | null>(null);
  const breakpointRef = React.useRef<'mobile' | 'tablet' | 'desktop' | null>(null);
  const fetchedReactionIdsRef = React.useRef<Set<number>>(new Set());
  // SSE sources per post to stream live updates (LRU-limited)
  const sseSourcesRef = React.useRef<Map<number, { es: EventSource; ts: number }>>(new Map());
  const MAX_SSE_CONNECTIONS = 4;
  // Track SSE/preload errors to avoid flashing the \"unavailable\" banner on transient failures
  const reactionsErrorCountRef = React.useRef<number>(0);
  // Track whether we've prefetched totals for all posts to avoid repeated work
  const preloadedAllRef = React.useRef<boolean>(false);
  // Deduplicate zero-results analytics by query
  const lastZeroResultsQueryRef = React.useRef<string>('');
  // Fuzzy search offload to worker
  const [closestTitleMatchW, setClosestTitleMatchW] = useState<Post | null>(null);
  const [searchSuggestionsW, setSearchSuggestionsW] = useState<Post[]>([]);
  const searchWorkerRef = React.useRef<Worker | null>(null);
  const sortedPostsRef = React.useRef<Post[]>([]);

  // Defer only reaction widgets; render the rest immediately to avoid layout shifts
  const [readyReactions, setReadyReactions] = useState(false);
  useEffect(() => {
    const start = () => {
      setReadyReactions(true);
    };
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout?: number }) => void)
      | undefined;
    if (typeof ric === 'function') {
      ric(() => start(), { timeout: 1200 });
    } else {
      setTimeout(start, 700);
    }
  }, []);

  // Viewport-aware container height for virtualization and sticky header spacing
  const [containerHeight, setContainerHeight] = useState<number>(() => {
    try { return window.innerHeight; } catch { return 800; }
  });
  useEffect(() => {
    const onResize = () => {
      try { setContainerHeight(window.innerHeight); } catch {}
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Derive grid columns from breakpoint (stateful to satisfy eslint exhaustive-deps)
  const [gridCols, setGridCols] = useState<number>(1);

  // Analytics: log search queries (debounced) and zero-result events
  useEffect(() => {
    const q = deferredSearch.trim();
    // Avoid logging very short queries to reduce noise and jank
    if (!q || q.length < 3) return;
    const t = setTimeout(() => {
      try {
        fetch('/api/analytics/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interactionType: 'index_search_query', details: { q }, path: '/stories' })
        }).catch(() => {});
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, [deferredSearch]);

  // Prefetch effect moved below query hook to avoid referencing variables before declaration.

  // Search highlighting helpers
  const normalizeText = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const stem = (t: string) => {
    if (t.endsWith('ing')) return t.slice(0, -3);
    if (t.endsWith('ed')) return t.slice(0, -2);
    if (t.endsWith('es')) return t.slice(0, -2);
    if (t.endsWith('s')) return t.slice(0, -1);
    return t;
  };
  const queryTokens = useMemo(() => {
    const q = normalizeText(deferredSearch.trim().toLowerCase());
    return q.split(/[^a-z0-9]+/).filter(Boolean).map(stem);
  }, [deferredSearch]);

  const renderHighlighted = (text: string) => {
    if (!deferredSearch.trim()) return text;
    const normalized = normalizeText(text.toLowerCase());
    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    const indices: Array<{ start: number; end: number }> = [];

    // Find matches of each token (first occurrence)
    for (const tok of queryTokens) {
      if (!tok) continue;
      const i = normalized.indexOf(tok);
      if (i >= 0) indices.push({ start: i, end: i + tok.length });
    }
    // Sort by start
    indices.sort((a, b) => a.start - b.start);

    for (const { start, end } of indices) {
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      parts.push(<mark key={start} className="bg-primary/15 text-foreground rounded px-0.5">{text.slice(start, end)}</mark>);
      lastIndex = end;
    }
    parts.push(text.slice(lastIndex));
    return parts;
  };

  // Plain normalization and small edit-distance for fuzzy title matching (≤ 2 typos)
  const normalizePlain = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const levenshtein = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  };

  

  

  // Sync global theme definitions from server once on mount (updates local overrides)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await syncThemeDefinitionOverridesFromServer();
        if (!mounted) return;
        // trigger a light rerender
        setVisibleCount((c) => c);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Compute page size and initial visible count based on viewport for story cards view (breakpoint-aware, no thrash)
  useEffect(() => {
    const compute = () => {
      try {
        const w = window.innerWidth;
        const cat: 'mobile' | 'tablet' | 'desktop' = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
        if (breakpointRef.current !== cat) {
          breakpointRef.current = cat;
          const initial = w >= 1024 ? 6 : (w >= 768 ? 4 : 3);
          setPageSize(initial);
          setVisibleCount((c) => (c < initial ? initial : c));
          setGridCols(cat === 'desktop' ? 3 : (cat === 'tablet' ? 2 : 1));
        }
      } catch {
        if (breakpointRef.current !== 'mobile') {
          breakpointRef.current = 'mobile';
          setPageSize(3);
          setVisibleCount((c) => (c < 3 ? 3 : c));
          setGridCols(1);
        }
      }
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  

  // Navigation function
  const navigateToReader = (slugOrId: string | number) => {
    try {
      const slugStr = String(slugOrId);
      React.startTransition(() => {
        setLocation(`/reader/${encodeURIComponent(slugStr)}`);
      });
    } catch {
      window.location.href = `/reader/${encodeURIComponent(String(slugOrId))}`;
    }
  };

  // Read cached first page from localStorage (shell-first rendering without skeletons)
  const cachedPage1 = useMemo(() => {
    try {
      const raw = localStorage.getItem('cache:index:page1');
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.posts)) {
        return { posts: (data.posts as Post[]), hasMore: !!data.hasMore, page: 1 };
      }
    } catch {}
    return null;
  }, []);

  // Paginated query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery<{ posts: Post[]; hasMore: boolean; page: number }>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const wpResponse = await fetchWordPressPosts({
        page,
        perPage: 30,
      });
      const wpPosts = wpResponse.posts || [];
      const posts = wpPosts.map((post: WordPressPost) => wpToPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length === 30,
        page,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    initialData: cachedPage1 ? { pages: [cachedPage1], pageParams: [1] } as any : undefined,
  });

  // Cache first page posts locally after fetch to improve cold-start rendering
  useEffect(() => {
    try {
      const first = (data as any)?.pages?.[0];
      if (first && Array.isArray(first.posts) && first.posts.length > 0) {
        const payload = { posts: first.posts.slice(0, 30), hasMore: first.hasMore };
        localStorage.setItem('cache:index:page1', JSON.stringify(payload));
      }
    } catch {}
  }, [data]);

  // Prefetch next page when scrolled near bottom (75%)
  useEffect(() => {
    const onScroll = () => {
      try {
        const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const vh = window.innerHeight || 800;
        const docH = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        const pct = (scrollY + vh) / Math.max(1, docH);
        if (pct >= 0.75 && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      } catch {}
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasPaginatedPosts = data?.pages && data.pages.length > 0 && data.pages[0]?.posts?.length > 0;

  // Initialize posts array with memoization
  const allPosts: Post[] = useMemo(() => {
    if (hasPaginatedPosts) {
      return data!.pages.flatMap(page => page.posts) as Post[];
    }
    return [] as Post[];
  }, [hasPaginatedPosts, data]);

  const sortedPosts = [...allPosts].sort((a: Post, b: Post) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Keep a ref of latest sortedPosts for worker mapping
  useEffect(() => {
    sortedPostsRef.current = sortedPosts;
  }, [sortedPosts]);

  // Initialize search worker once
  useEffect(() => {
    try {
      if (!searchWorkerRef.current && typeof Worker !== 'undefined') {
        const w = new Worker(new URL('../../workers/search.worker.ts', import.meta.url), { type: 'module' });
        w.onmessage = (e: MessageEvent) => {
          try {
            const data = e.data || {};
            const bestId = typeof data.bestId === 'number' ? data.bestId : null;
            const suggestionIds: number[] = Array.isArray(data.suggestionIds) ? data.suggestionIds : [];
            const byId = new Map<number, Post>(sortedPostsRef.current.map((p: Post) => [Number((p as any).id), p]));
            setClosestTitleMatchW(bestId && byId.get(bestId) ? byId.get(bestId)! : null);
            setSearchSuggestionsW(suggestionIds.map(id => byId.get(id)).filter(Boolean) as Post[]);
          } catch {
            setClosestTitleMatchW(null);
            setSearchSuggestionsW([]);
          }
        };
        searchWorkerRef.current = w;
      }
    } catch {}
    return () => {
      try { searchWorkerRef.current?.terminate(); } catch {}
      searchWorkerRef.current = null;
    };
  }, []);

  // Post queries to worker for fuzzy matching on long queries
  useEffect(() => {
    const q = deferredSearch.trim();
    const w = searchWorkerRef.current;
    if (!w || q.length < 3) {
      setClosestTitleMatchW(null);
      setSearchSuggestionsW([]);
      return;
    }
    try {
      w.postMessage({
        query: q,
        posts: sortedPosts.map(p => ({ id: Number((p as any).id), title: String(p.title || '') }))
      });
    } catch {
      setClosestTitleMatchW(null);
      setSearchSuggestionsW([]);
    }
  }, [deferredSearch, sortedPosts]);

  // Compute category pills lazily to avoid blocking the main thread during input
  useEffect(() => {
    let cancelled = false;
    const compute = () => {
      try {
        const counts = new Map<string, number>();
        for (const p of allPosts) {
          const md = (p.metadata || {}) as Record<string, any>;
          let key = String(md.themeCategory || '').trim();
          if (!key) {
            try {
              const derived = sharedDetermineThemeCategory(String(p.title || ''), String(p.content || ''));
              key = String(derived || '').trim();
            } catch {}
          }
          if (!key) continue;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        const pills = Array.from(counts.entries())
          .map(([key, count]) => {
            const pretty = key.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase());
            return { key, count, pretty };
          })
          .sort((a, b) => b.count - a.count);
        if (!cancelled) setCategoryPills(pills);
      } catch {}
    };
    const ric = (window as any)?.requestIdleCallback as any;
    if (typeof ric === 'function') {
      ric(() => compute(), { timeout: 1200 });
    } else {
      setTimeout(compute, 0);
    }
    return () => { cancelled = true; };
  }, [allPosts]);

  // Compute the closest title match (token-aware, substring + <=2 typos) for featured card search
  const closestTitleMatch = React.useMemo(() => {
    const raw = deferredSearch.trim();
    if (!raw) return null;
    // Offload heavy fuzzy matching to worker for longer queries
    if (raw.length >= 3 && closestTitleMatchW) return closestTitleMatchW;

    const tokenize = (s: string) => normalizePlain(s).split(/[^a-z0-9]+/).filter(Boolean);
    const jaccard = (a: string[], b: string[]) => {
      if (!a.length || !b.length) return 0;
      const setA = new Set(a);
      const setB = new Set(b);
      const inter = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...a, ...b]).size;
      return inter / union;
    };

    const qn = normalizePlain(raw);
    const qTokens = tokenize(raw);
    const longEnough = qn.length >= 3;

    let best: { post: Post; score: number } | null = null;

    for (const p of sortedPosts) {
      const title = String(p.title || '');
      const tn = normalizePlain(title);
      if (!tn) continue;

      const tTokens = tokenize(title);

      const containsSub = tn.includes(qn);
      const tokenContains = tTokens.some(tt => tt.includes(qn)) || qTokens.some(qt => tn.includes(qt));

      // Per-token minimum edit distance to any title token
      const perTokenMinD = qTokens.map(qt => {
        let md = Infinity;
        for (const tt of tTokens) {
          const d = levenshtein(tt, qt);
          if (d < md) md = d;
          if (md === 0) break;
        }
        return md;
      });

      const anyClose = perTokenMinD.some(d => d <= 2);

      // Accept only if we have a direct substring match OR a close token match (and query length is reasonable)
      if (!(containsSub || (longEnough && anyClose))) continue;

      const tokenScore = qTokens.length
        ? perTokenMinD.reduce((acc, d, i) => {
            const len = Math.max(2, qTokens[i]?.length || 2);
            const s = Math.max(0, 1 - d / len);
            return acc + s;
          }, 0) / qTokens.length
        : 0;

      const jac = jaccard(tTokens, qTokens);

      let score = 0;
      if (containsSub) score += 100;
      if (tokenContains) score += 60;
      score += tokenScore * 40 + jac * 20;

      // Mild length penalty so extremely long titles don't dominate weak matches
      score -= Math.max(0, tTokens.length - qTokens.length) * 2;

      if (!best || score > best.score) {
        best = { post: p, score };
      }
    }

    return best?.post || null;
  }, [deferredSearch, sortedPosts, closestTitleMatchW]);

  // Available theme categories present in posts (include derived when metadata missing)
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPosts) {
      const md = (p.metadata || {}) as Record<string, any>;
      let key = String(md.themeCategory || '').trim();
      if (!key) {
        try {
          const derived = sharedDetermineThemeCategory(String(p.title || ''), String(p.content || ''));
          key = String(derived || '').trim();
        } catch {}
      }
      if (key) set.add(key);
    }
    return Array.from(set);
  }, [allPosts]);

  // Helper: compute theme key and pretty label (with overrides) for a story
  const computeThemeMeta = (p: Post): { key: string; label: string; iconSlug: string } => {
    const md: any = (p as any)?.metadata || {};
    const title = String(p.title || '');
    const content = String(p.content || '');
    const primaryThemeRaw =
      md.themeCategory ||
      sharedDetermineThemeCategory(title, content);

    const override = getStoryThemeOverride((p as any)?.slug as any, title as any);

    const derivedKey = (() => {
      const raw = String(primaryThemeRaw || '').trim();
      if (!raw) return 'HORROR';
      for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
        if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
      }
      return raw.toUpperCase().replace(/\s+/g, '_');
    })();

    const themeKey = override?.key || derivedKey;

    const defOverride = getThemeDefinitionOverride(themeKey);

    const baseLabel =
      override?.label ||
      defOverride?.label ||
      (SHARED_THEME_CATEGORIES as any)[derivedKey]?.label ||
      primaryThemeRaw ||
      'Horror';

    const prettyLabel = (() => {
      if (override?.label) return override.label;
      const l = String(baseLabel).toLowerCase();
      if (l.includes('cosmic')) return 'Cosmic Horror';
      if (l.includes('existential')) return 'Existential Horror';
      if (l.includes('vehicular')) return 'Vehicular Horror';
      if (l.includes('psychological')) return 'Psychological Horror';
      if (l.includes('supernatural')) return 'Supernatural Horror';
      if (l.includes('technological')) return 'Technological Horror';
      if (l.includes('uncanny')) return 'Uncanny Horror';
      if (l.includes('gothic')) return 'Gothic Horror';
      if (l.includes('folk')) return 'Folk Horror';
      if (l.includes('parasite') || l.includes('parasitic') || l.includes('infestation')) return 'Parasitic Horror';
      if (l.includes('cannibal')) return 'Cannibalism Horror';
      if (l.includes('science')) return 'Science Horror';
      if (l.includes('apocalyptic')) return 'Apocalyptic Horror';
      if (l.includes('stalking')) return 'Stalker/Pursuit Horror';
      if (l.includes('doppelganger')) return 'Identity Horror';
      return baseLabel;
    })();

    let iconSlug =
      override?.icon ||
      md?.themeIcon ||
      defOverride?.icon ||
      (SHARED_THEME_CATEGORIES as any)[derivedKey]?.icon ||
      'ghost';

    if (themeKey === 'BODY_HORROR') {
      iconSlug = 'bone';
    }

    return { key: themeKey, label: prettyLabel, iconSlug };
  };

  // Map an icon slug or theme key to a Lucide icon component
  const getThemeIconFor = (themeKey: string, iconSlug: string) => {
    const slug = String(iconSlug || '').toLowerCase();
    switch (slug) {
      case 'skull': return Skull;
      case 'brain': return Brain;
      case 'pill': return Pill;
      case 'cpu': return Cpu;
      case 'dna': return Dna;
      case 'ghost': return Ghost;
      case 'umbrella': return Umbrella;
      case 'footprints': return Footprints;
      case 'cloud-rain':
      case 'cloudrain': return CloudRain;
      case 'castle': return Castle;
      case 'bug': return Bug;
      case 'radiation': return Radiation;
      case 'user-minus2':
      case 'userminus2': return UserMinus2;
      case 'user-plus':
      case 'userplus': return UserPlus;
      case 'anchor': return Anchor;
      case 'alert-triangle':
      case 'alerttriangle': return AlertTriangle;
      case 'building': return Building;
      case 'worm': return Worm;
      case 'cloud': return Cloud;
      case 'cloud-fog':
      case 'cloudfog': return CloudFog;
      case 'flame': return Flame;
      case 'eye': return Eye;
      case 'hourglass': return Hourglass;
      case 'knife':
      case 'utensils':
      case 'fork-knife':
      case 'forkknife': return ForkKnife;
      case 'cat': return Cat;
      case 'moon': return Moon;
      case 'dog': return Dog;
      case 'radio': return Radio;
      case 'moon-star':
      case 'moonstar': return MoonStar;
      case 'box': return Box;
      case 'car': return Car;
      case 'alien': return Moon;
      case 'flask': return FlaskConical;
      case 'trees':
      case 'tree': return Trees;
      case 'bone': return Bone;
    }
    // Fallback by theme key
    switch (String(themeKey || '').toUpperCase()) {
      case 'TECHNOLOGICAL': return Cpu;
      case 'PSYCHOLOGICAL': return Brain;
      case 'SUPERNATURAL': return Ghost;
      case 'UNCANNY': return Eye;
      case 'EXISTENTIAL': return Hourglass;
      case 'DOPPELGANGER': return UserPlus;
      case 'CANNIBALISM': return ForkKnife;
      case 'SLASHER': return Skull;
      case 'MONSTER': return Cat;
      case 'ZOMBIE': return Footprints;
      case 'VAMPIRE': return Moon;
      case 'WEREWOLF': return Dog;
      case 'PARANORMAL': return Radio;
      case 'DREAM_HORROR': return MoonStar;
      case 'CURSED_OBJECT': return Box;
      case 'TIME_HORROR': return Clock;
      case 'APOCALYPTIC': return Radiation;
      case 'SCIENCE_HORROR': return FlaskConical;
      case 'BODY_HORROR': return Bone;
      case 'FOLK_HORROR': return Trees;
      case 'GOTHIC': return Castle;
      case 'COSMIC': return Moon;
      case 'VEHICULAR': return Car;
      default: return Ghost;
    }
  };

  // Reaction totals map for posts (lazy-fetched for visible cards only)
  const [reactionTotals, setReactionTotals] = useState<Record<number, import("@/api/reactions").ReactionTotals>>({});
  
  useEffect(() => {
    if (!readyReactions) return;
    let mounted = true;
    const fetched = fetchedReactionIdsRef.current;
    let io: IntersectionObserver | null = null;
    let pending: number[] = [];
    let flushTimer: any = null;

    // Capture current SSE map reference to use in cleanup (avoid ref changing)
    const sources = sseSourcesRef.current;

    // SSE sources per post to stream live updates
    // sseSourcesRef is defined at component scope

    const ensureSse = (postId: number) => {
      try {
        if (!Number.isFinite(postId)) return;
        if (sources.has(postId)) {
          // Touch timestamp for LRU
          const obj = sources.get(postId);
          if (obj) obj.ts = Date.now();
          return;
        }

        // LRU cap: close oldest connection if at capacity
        if (sources.size >= MAX_SSE_CONNECTIONS) {
          let oldestKey: number | null = null;
          let oldestTs = Infinity;
          for (const [key, obj] of sources.entries()) {
            if (obj.ts < oldestTs) {
              oldestTs = obj.ts;
              oldestKey = key;
            }
          }
          if (oldestKey != null) {
            try { sources.get(oldestKey)?.es.close(); } catch {}
            sources.delete(oldestKey);
          }
        }

        const url = `/api/posts/${postId}/reactions/stream`;
        const es = new EventSource(url, { withCredentials: true } as any);
        const onMessage = (e: MessageEvent) => {
          try {
            const payload = JSON.parse(e.data || '{}');
            if (payload && typeof payload.postId === 'number') {
              setReactionTotals(prev => ({ ...prev, [payload.postId]: {
                postId: payload.postId,
                baselineLikes: Number(payload.baselineLikes || 0),
                baselineDislikes: Number(payload.baselineDislikes || 0),
                likesCount: Number(payload.likesCount || 0),
                dislikesCount: Number(payload.dislikesCount || 0),
                totals: {
                  likes: Number(payload.totals?.likes || (Number(payload.baselineLikes || 0) + Number(payload.likesCount || 0))),
                  dislikes: Number(payload.totals?.dislikes || (Number(payload.baselineDislikes || 0) + Number(payload.dislikesCount || 0))),
                }
              }}));
              fetched.add(payload.postId);
              // Reset transient error state on any successful message
              reactionsErrorCountRef.current = 0;
              if (reactionsUnavailable) setReactionsUnavailable(false);
            }
          } catch {}
        };
        es.addEventListener('initial', onMessage);
        es.addEventListener('update', onMessage);
        es.onerror = () => { 
          // Increment error count; only show banner after repeated errors
          reactionsErrorCountRef.current += 1;
          if (reactionsErrorCountRef.current >= 3) {
            setReactionsUnavailable(true);
          }
          // keep alive; browser will reconnect
        };
        sources.set(postId, { es, ts: Date.now() });
      } catch (err) {
        console.error('[Index] Failed to open SSE stream:', err);
        setReactionsUnavailable(true);
      }
    };

    // Preload a small initial batch near the top of the list to avoid empty counts above the fold
    const preloadInitial = async () => {
      try {
        const initialBatchSize = Math.max(24, Math.min(sortedPosts.length, (visibleCount || 0) + (gridCols || 1) * 6));
        const candidateIds = sortedPosts
          .slice(0, initialBatchSize)
          .map((p: Post) => Number(p.id))
          .filter((n: number) => Number.isFinite(n));
        const idsToFetch = candidateIds.filter((id: number) => !fetched.has(id));
        if (idsToFetch.length > 0) {
          const { fetchReactionsBatch } = await import("@/api/reactions");
          const totals = await fetchReactionsBatch(idsToFetch);
          if (!mounted) return;
          const map: Record<number, import("@/api/reactions").ReactionTotals> = {};
          for (const t of totals) {
            map[t.postId] = t;
            fetched.add(t.postId);
          }
          setReactionTotals((prev) => ({ ...prev, ...map }));
        }
        // Open SSE streams for visible/initial posts
        for (const id of candidateIds) {
          ensureSse(id);
        }
      } catch (err) {
        console.error('[Index] Failed to preload initial reactions:', err);
        reactionsErrorCountRef.current += 1;
        if (reactionsErrorCountRef.current >= 3) {
          setReactionsUnavailable(true);
        }
      }
    };

    const flush = async () => {
      try {
        if (!mounted) return;
        const unique = Array.from(new Set(pending));
        pending = [];
        const toFetch = unique.filter((id) => Number.isFinite(id) && !fetched.has(id));
        if (toFetch.length > 0) {
          const { fetchReactionsBatch } = await import("@/api/reactions");
          const totals = await fetchReactionsBatch(toFetch.slice(0, 60));
          if (!mounted) return;
          const update: Record<number, import("@/api/reactions").ReactionTotals> = {};
          for (const t of totals) {
            update[t.postId] = t;
            fetched.add(t.postId);
          }
          setReactionTotals((prev) => ({ ...prev, ...update }));
        }
        // Ensure SSE for all newly observed ids
        for (const id of unique) {
          ensureSse(id);
        }
      } catch (err) {
        console.error('[Index] Failed to flush reaction batch:', err);
        reactionsErrorCountRef.current += 1;
        if (reactionsErrorCountRef.current >= 3) {
          setReactionsUnavailable(true);
        }
      }
    };

    const schedule = (id: number) => {
      pending.push(id);
      if (flushTimer) return;
      flushTimer = setTimeout(() => {
        flushTimer = null;
        void flush();
      }, 200);
    };

    try {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            const idAttr = el.getAttribute("data-post-id");
            const id = idAttr ? Number(idAttr) : NaN;
            if (entry.isIntersecting && Number.isFinite(id)) {
              schedule(id);
              try { io?.unobserve(el); } catch {}
            }
          }
        },
        { root: null, rootMargin: "200px", threshold: 0.01 }
      );
      // Observe current cards
      document.querySelectorAll<HTMLElement>(".story-card-container[data-post-id]").forEach((n) => io?.observe(n));
    } catch {
      // no-op
    }

    // Observe DOM mutations to re-observe dynamically added cards (virtualization/dynamic mounts)
    let mo: MutationObserver | null = null;
    try {
      mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              if (node.matches?.(".story-card-container[data-post-id]")) {
                io?.observe(node);
              }
              node.querySelectorAll?.(".story-card-container[data-post-id]").forEach((el) => io?.observe(el as HTMLElement));
            }
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch {}

    // Start with a small initial preload + SSE
    void preloadInitial();

    // Then, in the background, preload totals for remaining posts to avoid zero displays
    const preloadRemaining = async () => {
      if (preloadedAllRef.current) return;
      try {
        const ids = sortedPosts
          .map((p: Post) => Number(p.id))
          .filter((n: number) => Number.isFinite(n))
          .filter((id: number) => !fetched.has(id));
        if (ids.length === 0) {
          preloadedAllRef.current = true;
          return;
        }
        const { fetchReactionsBatch } = await import("@/api/reactions");
        // Chunk into batches to avoid large payloads
        for (let i = 0; i < ids.length; i += 60) {
          if (!mounted) return;
          const chunk = ids.slice(i, i + 60);
          const totals = await fetchReactionsBatch(chunk);
          if (!mounted) return;
          const update: Record<number, import("@/api/reactions").ReactionTotals> = {};
          for (const t of totals) {
            update[t.postId] = t;
            fetched.add(t.postId);
          }
          setReactionTotals((prev) => ({ ...prev, ...update }));
        }
        preloadedAllRef.current = true;
      } catch {
        // ignore background failures
      }
    };

    const idle = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout?: number }) => void);
    if (typeof idle === 'function') {
      idle(() => { if (mounted) setTimeout(() => { void preloadRemaining(); }, 400); }, { timeout: 2500 });
    } else {
      setTimeout(() => { if (mounted) void preloadRemaining(); }, 1200);
    }

    // Listen for reaction updates from LikeDislike
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as import("@/api/reactions").ReactionTotals;
      if (!detail || typeof detail.postId !== "number") return;
      setReactionTotals((prev) => ({ ...prev, [detail.postId]: detail }));
      fetched.add(detail.postId);
    };
    window.addEventListener("reaction:updated", onUpdate as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("reaction:updated", onUpdate as EventListener);
      try { mo?.disconnect(); } catch {}
      try { io?.disconnect(); } catch {}
      if (flushTimer) clearTimeout(flushTimer);
      // Close SSE sources using captured reference
      try {
        for (const obj of sources.values()) {
          try { obj.es.close(); } catch {}
        }
        sources.clear();
      } catch {}
    };
  }, [sortedPosts, visibleCount, gridCols, readyReactions]);

  // Compute trending scores off the main thread when possible
  useEffect(() => {
    let cancelled = false;
    const schedule = () => {
      const compactPosts = sortedPosts.map(p => ({
        id: Number(p.id),
        createdAt: p.createdAt as any,
        views: Number((p as any)?.metadata?.pageViews ?? 0),
      }));
      computeTrendingScores(
        compactPosts as any,
        reactionTotals as any,
        14
      ).then((scores) => {
        if (!cancelled) setTrendingScores(scores || {});
      }).catch(() => {
        if (!cancelled) setTrendingScores({});
      });
    };
    const ric = (window as any)?.requestIdleCallback as any;
    if (typeof ric === 'function') {
      ric(() => schedule(), { timeout: 1500 });
    } else {
      setTimeout(schedule, 0);
    }
    return () => { cancelled = true; };
  }, [sortedPosts, reactionTotals]);

  // Filter and sort posts for display
  const filteredPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // Title-only search (exact substring match), no fuzzy or content-based matching.
    const q = deferredSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(p => String(p.title || '').toLowerCase().includes(q));
    }

    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        list.sort((a, b) => {
          const map = trendingScores;
          if (map && Object.keys(map).length > 0) {
            const aScore = map[a.id] ?? 0;
            const bScore = map[b.id] ?? 0;
            return bScore - aScore;
          }
          // Fallback to inline calculation when scores not ready
          const aTotals = reactionTotals[a.id];
          const bTotals = reactionTotals[b.id];
          const aLikes = Number(aTotals?.totals?.likes ?? 0);
          const bLikes = Number(bTotals?.totals?.likes ?? 0);
          
          const aViews = (a.metadata && (a.metadata as any).pageViews) ? Number((a.metadata as any).pageViews) : 0;
          const bViews = (b.metadata && (b.metadata as any).pageViews) ? Number((b.metadata as any).pageViews) : 0;
          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          const windowDays = 14;
          const aAgeDays = Math.max(0, (now - new Date(a.createdAt).getTime()) / dayMs);
          const bAgeDays = Math.max(0, (now - new Date(b.createdAt).getTime()) / dayMs);
          const aDecay = Math.max(0.2, 1 - (aAgeDays / windowDays));
          const bDecay = Math.max(0.2, 1 - (bAgeDays / windowDays));
          const aScore = (aLikes * 2.5 + aViews * 0.8) * aDecay;
          const bScore = (bLikes * 2.5 + bViews * 0.8) * bDecay;
          return bScore - aScore;
        });
        break;
      case 'shortest':
        list.sort((a, b) => String(a.content || '').length - String(b.content || '').length);
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return list;
  }, [sortedPosts, categoryFilter, deferredSearch, sort, reactionTotals, trendingScores]);

  const currentPosts = filteredPosts;
  const titleMatches = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return [] as Post[];
    return sortedPosts.filter(p => String(p.title || '').toLowerCase().includes(q));
  }, [deferredSearch, sortedPosts]);

  // Suggestions for zero-results (closest title matches by simple heuristics)
  const searchSuggestions = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return [] as Post[];
    // Use worker-computed suggestions for longer queries
    if (q.length >= 3 && searchSuggestionsW.length) return searchSuggestionsW;

    const tokenize = (s: string) => normalizeText(s.toLowerCase()).split(/[^a-z0-9]+/).filter(Boolean);
    const jaccard = (a: string[], b: string[]) => {
      if (!a.length || !b.length) return 0;
      const setA = new Set(a);
      const setB = new Set(b);
      const inter = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...a, ...b]).size;
      return inter / union;
    };
    const qTokens = tokenize(q);
    const score = (p: Post) => {
      const title = String(p.title || "");
      const tTok = tokenize(title);
      let minD = Infinity;
      for (const qt of qTokens) {
        for (const tt of tTok) {
          const d = levenshtein(qt, tt);
          if (d < minD) minD = d;
        }
      }
      const includesBonus = title.toLowerCase().includes(q) ? 3 : 0;
      const j = jaccard(qTokens, tTok);
      const distanceBoost = minD <= 2 ? (2 - minD) : -minD * 0.15;
      return includesBonus + (j * 2) + distanceBoost;
    };
    return [...sortedPosts]
      .map(p => ({ p, s: score(p) }))
      .filter(x => x.s > 0.5)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map(x => x.p);
  }, [deferredSearch, sortedPosts, searchSuggestionsW]);

  // Latest Stories list - always sorted newest->oldest; search does NOT change this list
  const latestPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [sortedPosts, categoryFilter]);

  // Precompute popular posts (top 6) with trending score map when available
  const popularPosts = useMemo(() => {
    const useScores = Object.keys(trendingScores).length > 0;
    const arr = [...sortedPosts]
      .map(p => ({
        p,
        score: useScores ? (trendingScores[p.id] ?? 0) : (() => {
          const totals = reactionTotals[p.id];
          const likes = Number(totals?.totals?.likes ?? 0);
          const views = p.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;
          const now = Date.now();
          const dayMs = 24 * 60 * 60 * 1000;
          const windowDays = 14;
          const ageDays = Math.max(0, (now - new Date(p.createdAt).getTime()) / dayMs);
          const decay = Math.max(0.2, 1 - (ageDays / windowDays));
          return (likes * 2.5 + views * 0.8) * decay;
        })()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(x => x.p);
    return arr;
  }, [sortedPosts, reactionTotals, trendingScores]);

  // Log zero-results interactions
  useEffect(() => {
    const q = deferredSearch.trim();
    if (q && q.length >= 3 && titleMatches.length === 0 && !closestTitleMatch) {
      // Deduplicate logs for the same query
      if (lastZeroResultsQueryRef.current !== q) {
        lastZeroResultsQueryRef.current = q;
        try {
          fetch('/api/analytics/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interactionType: 'index_zero_results', details: { q }, path: '/stories' })
          }).catch(() => {});
        } catch {}
      }
    }
  }, [titleMatches.length, deferredSearch, closestTitleMatch]);

  const featuredStory = useMemo(() => {
    const all = [...sortedPosts];
    if (!all || all.length === 0) return null;

    // If searching, pick the closest title match (exact substring or ≤2 typos)
    if (deferredSearch.trim() && closestTitleMatch) {
      return closestTitleMatch;
    }

    // Respect dropdown criteria directly for the featured pick
    if (sort === 'newest') {
      return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    }
    if (sort === 'oldest') {
      return [...all].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    }
    if (sort === 'shortest') {
      return [...all].sort((a, b) => String(a.content || '').length - String(b.content || '').length)[0];
    }

    // If explicitly sorting by popular, pick highest likes + engagement using live reaction totals
    if (sort === 'popular') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const windowDays = 14;

      const useScores = Object.keys(trendingScores).length > 0;
      const topByPopular = useScores
        ? [...all]
            .map(p => ({ p, score: trendingScores[p.id] ?? 0 }))
            .sort((a, b) => b.score - a.score)
            .map(x => x.p)
        : [...all]
            .map(p => {
              const totals = reactionTotals[p.id];
              const likes = Number(totals?.totals?.likes ?? 0);
              const views = p.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;
              const ageDays = Math.max(0, (now - new Date(p.createdAt).getTime()) / dayMs);
              const decay = Math.max(0.2, 1 - (ageDays / windowDays));
              const score = (likes * 2.5 + views * 0.8) * decay;
              return { p, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(x => x.p);

      const lastTheme = (() => {
        try { return localStorage.getItem('lastFeaturedTheme') || ''; } catch { return ''; }
      })();

      const pick = (() => {
        const getThemeKey = (p: Post) => {
          const md: any = (p as any)?.metadata || {};
          const primary = md.themeCategory || sharedDetermineThemeCategory(String(p.title || ''), String(p.content || ''));
          const raw = String(primary || '').trim();
          if (!raw) return '';
          for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
            if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
          }
          return raw.toUpperCase().replace(/\\s+/g, '_');
        };
        if (!topByPopular.length) return all[0] || null;
        const first = topByPopular[0];
        const firstKey = getThemeKey(first);
        if (lastTheme && firstKey.toUpperCase() === lastTheme.toUpperCase() && topByPopular.length > 1) {
          return topByPopular[1];
        }
        return first;
      })();

      return pick || all[0];
    }

    // Otherwise, pick by engagement/recency
    const sortedByEngagement = all.sort((a, b) => {
      const aDate = new Date(a.createdAt).getTime();
      const bDate = new Date(b.createdAt).getTime();
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const sevenDaysInMs = 7 * dayInMs;
      const aRecency = Math.max(0, Math.min(1, 1 - ((now - aDate) / sevenDaysInMs)));
      const bRecency = Math.max(0, Math.min(1, 1 - ((now - bDate) / sevenDaysInMs)));
      const aTotals = reactionTotals[a.id];
      const bTotals = reactionTotals[b.id];
      const aLikes = Number(aTotals?.totals?.likes ?? 0);
      const bLikes = Number(bTotals?.totals?.likes ?? 0);
      const aDislikes = Number(aTotals?.totals?.dislikes ?? 0);
      const bDislikes = Number(bTotals?.totals?.dislikes ?? 0);
      const aViews = a.metadata && (a.metadata as any).pageViews
        ? Number((a.metadata as any).pageViews)
        : 0;
      const bViews = b.metadata && (b.metadata as any).pageViews
        ? Number((b.metadata as any).pageViews)
        : 0;
      const aReadTime = a.metadata && typeof a.metadata === 'object' && 
        'averageReadTime' in (a.metadata as Record<string, unknown>) ?
        Number((a.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      const bReadTime = b.metadata && typeof b.metadata === 'object' && 
        'averageReadTime' in (b.metadata as Record<string, unknown>) ?
        Number((b.metadata as Record<string, unknown>).averageReadTime || 0) : 0;
      const aHasTheme = a.metadata && typeof a.metadata === 'object' && 
        'themeCategory' in (a.metadata as Record<string, unknown>) ? 5 : 0;
      const bHasTheme = b.metadata && typeof b.metadata === 'object' && 
        'themeCategory' in (b.metadata as Record<string, unknown>) ? 5 : 0;

      const aScore = (aLikes * 3) + 
                     aViews + 
                     (aReadTime * 0.5) - 
                     (aDislikes * 0.5) +
                     (aRecency * 15) + 
                     aHasTheme;

      const bScore = (bLikes * 3) + 
                     bViews + 
                     (bReadTime * 0.5) - 
                     (bDislikes * 0.5) +
                     (bRecency * 15) + 
                     bHasTheme;

      return bScore - aScore;
    });

    return sortedByEngagement[0];
  }, [sortedPosts, sort, reactionTotals, deferredSearch, closestTitleMatch, trendingScores]);

  // Persist last featured theme for diversity in subsequent sessions
  useEffect(() => {
    if (!featuredStory) return;
    try {
      const md: any = (featuredStory as any)?.metadata || {};
      const primary = md.themeCategory || sharedDetermineThemeCategory(String(featuredStory.title || ''), String(featuredStory.content || ''));
      const raw = String(primary || '').trim();
      let key = '';
      if (raw) {
        for (const [k, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
          if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) { key = k; break; }
        }
        key ||= raw.toUpperCase().replace(/\s+/g, '_');
      }
      if (key) localStorage.setItem('lastFeaturedTheme', key);
    } catch {}
  }, [featuredStory]);

  if (!hasPaginatedPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center overflow-x-hidden">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Unable to load stories</h2>
          <p className="text-muted-foreground">Please try again later</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-background flex flex-col overflow-x-hidden overflow-y-auto">
        {/* Canonical for stories index */}
        <SEO
          title="Index"
          description="Browse the index of dark, psychological, and gothic fiction at Bubble’s Cafe."
          canonical="/index"
          type="website"
        />
        {/* Continue Reading ribbon (local progress) */}
        <ContinueReadingBanner />
        <div className="w-full pb-12 pt-0 flex-1 mx-0 px-4 sm:px-6 flex flex-col">
          {/* Sticky controls header (mobile-first) */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6 py-2 sm:py-3 mt-8 sm:mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
              <div className="relative w-full lg:col-span-1">
                <Input
                  placeholder="Search stories..."
                  className="pl-3 pr-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">⏎</span>
              </div>
              {/* Removed duplicate sort dropdown above featured story; keeping the one inside the featured box */}
            </div>
          </div>

          {/* Status banner for reactions subsystem */}
          {reactionsUnavailable && (
            <div className="mb-4 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
              Live reactions are temporarily unavailable. Counts will appear once the connection is restored.
            </div>
          )}

          {/* Featured row */}
          {(featuredStory && sortedPosts.length > 0 && (!deferredSearch.trim() || titleMatches.length > 0 || !!closestTitleMatch)) && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6 content-visibility-auto">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="group p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <h2 className="text-lg font-decorative">Featured Story</h2>
                      </div>
                      <div className="flex items-center">
                        <Select
                          value={sort}
                          onValueChange={(value) =>
                            setSort(value as 'newest' | 'oldest' | 'popular' | 'shortest')
                          }
                        >
                          <SelectTrigger className="w-28 h-7 text-[11px]" aria-label="Sort stories">
                            <SelectValue placeholder="Sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="oldest">Oldest</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                            <SelectItem value="shortest">Shortest</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button className="text-left text-xl md:text-2xl font-semibold tracking-tight leading-tight hover:text-primary group-hover:text-primary line-clamp-2" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)}>
                          {renderHighlighted(String(featuredStory.title || ''))}
                        </button>
                        {(() => {
                          const { key, label, iconSlug } = computeThemeMeta(featuredStory);
                          const badgeTint = getBadgeTint(key);
                          const ThemeIconCmp: any = getThemeIconFor(key, iconSlug);
                          return (
                            <div className="-mt-1">
                              <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                {ThemeIconCmp ? <ThemeIconCmp className="h-3 w-3" /> : null}
                                {label}
                              </Badge>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          <time>{new Date(featuredStory.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                        </div>
                        <div className="flex items-center gap-1 justify-end" title={`~${String(featuredStory.content || '').split(/\\s+/).length} words`}>
                          <Clock className="h-3 w-3" />
                          <span>{getReadingTime(featuredStory.content)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[15px] sm:text-[16px] text-muted-foreground leading-6 mt-6 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                      {extractEngagingExcerpt(featuredStory.content, 220)}
                    </p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {(() => {
                          const md: any = (featuredStory as any)?.metadata || {};
                          const totals = reactionTotals[featuredStory.id] || null;
                          const likes = Number(totals?.totals?.likes ?? 0);
                          const views = md && (md as any).pageViews ? Number((md as any).pageViews) : 0;
                          const readingTimeStr = getReadingTime(featuredStory.content);
                          return (
                            <>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" /> {likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {views}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <Button size="sm" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)} className="h-9 px-4 transition-transform active:scale-95">
                        Read story
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="p-4">
                    <MostLikedList posts={sortedPosts} onNavigate={navigateToReader} totalsMap={reactionTotals} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          
          <div className="mt-2 mb-3">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-decorative uppercase">LATEST STORIES</h1>
              <div className="text-sm md:text-base text-muted-foreground">
                {latestPosts.length} stories
              </div>
            </div>
          </div>
          

          {/* Stories List */}
          {deferredSearch.trim() && titleMatches.length === 0 && !closestTitleMatch ? (
            <div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl text-center py-8 sm:py-10 md:py-12 rounded-xl border border-border/60 bg-card/80 px-3 sm:px-6 shadow-sm overflow-hidden">
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 mt-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">No matches found</h2>
                </div>

                {deferredSearch.trim() ? (
                  <>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                      We couldn’t find any stories matching “{deferredSearch.trim()}”. Try the closest matches below or explore popular stories.
                    </p>

                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {searchSuggestions.length ? searchSuggestions.map(s => (
                          <Card key={s.id} className="rounded-lg border border-border/60 bg-card/70 hover:bg-card transition">
                            <CardContent className="p-3">
                              <button
                                className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                                onClick={() => navigateToReader(s.slug || s.id)}
                                title={s.title}
                              >
                                {s.title}
                              </button>
                              {(() => {
                                const { key, label, iconSlug } = computeThemeMeta(s as Post);
                                const badgeTint = getBadgeTint(key);
                                const ThemeIconCmp: any = getThemeIconFor(key, iconSlug);
                                return (
                                  <div className="mt-1">
                                    <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                      {ThemeIconCmp ? <ThemeIconCmp className="h-3 w-3" /> : null}
                                      {label}
                                    </Badge>
                                  </div>
                                );
                              })()}

                              <p className="text-[13px] text-muted-foreground leading-5 mt-1 line-clamp-1">
                                {extractEngagingExcerpt(s.content, 100)}
                              </p>

                              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <time>{new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{getReadingTime(s.content)}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )) : (
                          <div className="col-span-1 sm:col-span-2 text-sm text-muted-foreground">
                            No close matches. Try clearing your search or exploring popular stories.
                          </div>
                        )}
                    </div>

                    

                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Button variant="outline" size="sm" onClick={() => setSearch("")} className="h-9 px-3">
                        Clear search
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          try {
                            const useScores = Object.keys(trendingScores).length > 0;
                            const topPopular = useScores
                              ? [...sortedPosts]
                                  .map(p => ({ p, score: trendingScores[p.id] ?? 0 }))
                                  .sort((a, b) => b.score - a.score)
                                  .slice(0, 5)
                                  .map(x => x.p)
                              : [...sortedPosts]
                                  .map(p => {
                                    const totals = reactionTotals[p.id];
                                    const likes = Number(totals?.totals?.likes ?? 0);
                                    const views = p.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;
                                    const now = Date.now();
                                    const dayMs = 24 * 60 * 60 * 1000;
                                    const windowDays = 14;
                                    const ageDays = Math.max(0, (now - new Date(p.createdAt).getTime()) / dayMs);
                                    const decay = Math.max(0.2, 1 - (ageDays / windowDays));
                                    const score = (likes * 2.5 + views * 0.8) * decay;
                                    return { p, score };
                                  })
                                  .sort((a, b) => b.score - a.score)
                                  .slice(0, 5)
                                  .map(x => x.p);

                            if (topPopular.length > 0) {
                              const pick = topPopular[Math.floor(Math.random() * topPopular.length)];
                              navigateToReader(pick.slug || pick.id);
                            } else {
                              setSort("popular");
                            }
                          } catch {
                            setSort("popular");
                          }
                        }}
                        className="h-9 px-3"
                      >
                        Browse popular
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Explore popular stories below.
                  </p>
                )}

                {/* Popular right now mini carousel */}
                <div className="mt-2">
                    <div className="text-left sm:text-center mb-2 text-xs font-medium text-muted-foreground">
                      Popular right now
                    </div>
                    <div className="relative">
                      <div
                        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-3 sm:scroll-px-4 [-webkit-overflow-scrolling:touch]"
                        aria-label="Popular stories"
                      >
                        {popularPosts.map(pop => (
                          <div key={pop.id} className="snap-start min-w-[260px] sm:min-w-[300px] md:min-w-[320px]">
                            <Card className="rounded-lg border border-border/50 bg-card/70 hover:bg-card transition">
                              <CardContent className="p-3">
                                <button
                                  className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                                  onClick={() => navigateToReader(pop.slug || pop.id)}
                                >
                                  {pop.title}
                                </button>
                                {(() => {
                                  const { key, label, iconSlug } = computeThemeMeta(pop);
                                  const badgeTint = getBadgeTint(key);
                                  const ThemeIconCmp: any = getThemeIconFor(key, iconSlug);
                                  return (
                                    <div className="mt-1">
                                      <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                        {ThemeIconCmp ? <ThemeIconCmp className="h-3 w-3" /> : null}
                                        {label}
                                      </Badge>
                                    </div>
                                  );
                                })()}
                                <p className="text-[13px] text-muted-foreground leading-5 mt-1 line-clamp-1">
                                  {extractEngagingExcerpt(pop.content, 100)}
                                </p>
                                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <time>{new Date(pop.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{getReadingTime(pop.content)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                {/* Category tags under carousel controls */}
                <div className="mt-8 px-2">
                    <>
                      {categoryPills.length > 0 && (
                        <>
                          <div className="text-center text-base md:text-lg font-medium text-muted-foreground mb-3 md:mb-4">All categories</div>
                          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                            <button
                              type="button"
                              className={`px-3 py-1.5 rounded-full border text-xs ${categoryFilter === 'all' ? 'bg-primary/15 border-primary/30' : 'bg-card border-border/60 hover:bg-card/80'}`}
                              onClick={() => setCategoryFilter('all')}
                              aria-pressed={categoryFilter === 'all'}
                            >
                              All
                            </button>
                            {categoryPills.map(p => (
                              <button
                                type="button"
                                key={p.key}
                                className={`px-3 py-1.5 rounded-full border text-xs ${categoryFilter.toLowerCase() === p.key.toLowerCase() ? 'bg-primary/15 border-primary/30' : 'bg-card border-border/60 hover:bg-card/80'}`}
                                onClick={() => setCategoryFilter(p.key)}
                                aria-pressed={categoryFilter.toLowerCase() === p.key.toLowerCase()}
                                title={`${p.pretty} (${p.count})`}
                              >
                                {p.pretty} <span className="ml-1 text-muted-foreground">({p.count})</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  </div>
                </div>
              </div>
          ) : (
            <>
              {latestPosts.length > 60 ? (
                // Virtualized rows for large lists (row = gridCols items)
                <VirtualScrollArea
                  items={(() => {
                    const cols = gridCols || 1;
                    const rows: Post[][] = [];
                    for (let i = 0; i < latestPosts.length; i += cols) {
                      rows.push(latestPosts.slice(i, i + cols));
                    }
                    return rows;
                  })()}
                  itemHeight={360}
                  containerHeight={Math.max(400, containerHeight - 200)}
                  overscan={3}
                  className="rounded-md border border-transparent content-visibility-auto"
                  renderItem={(row, rowIdx) => {
                    const cols = gridCols || 1;
                    return (
                      <div className={cols >= 3 ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6' : (cols === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6' : 'grid grid-cols-1 gap-5 md:gap-6')}>
                        {row.map((post, idx) => {
                          const md: any = post.metadata || {};
                          let themeCategory = "";
                          if (md && typeof md.themeCategory === 'string' && md.themeCategory.trim()) {
                            themeCategory = String(md.themeCategory);
                          } else {
                            try {
                              const derived = sharedDetermineThemeCategory(String(post.title || ''), String(post.content || ''));
                              themeCategory = String(derived || '');
                            } catch {}
                          }

                          return (
                            <article
                              key={post.id}
                              data-idx={rowIdx * cols + idx}
                              data-post-id={post.id}
                              className="group story-card-container relative"
                            >
                              <Card
                                onClick={() => navigateToReader(post.slug || post.id)}
                                className="h-full overflow-hidden rounded-xl border border-border/60 bg-card/80 transition-all duration-300 ease-out hover:bg-card hover:shadow-lg hover:ring-1 hover:ring-primary/25 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] will-change-transform cursor-pointer"
                              >
                                <CardContent className="p-4 pb-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <CardTitle className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary">
                                        {renderHighlighted(String(post.title || ''))}
                                      </CardTitle>
                                      {(() => {
                                        const { key, label, iconSlug } = computeThemeMeta(post);
                                        const badgeTint = getBadgeTint(key);
                                        const ThemeIconCmp: any = getThemeIconFor(key, iconSlug);
                                        return (
                                          <div className="mt-1">
                                            <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                              {ThemeIconCmp ? <ThemeIconCmp className="h-3 w-3" /> : null}
                                              {label}
                                            </Badge>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                                      <div className="flex items-center gap-1 justify-end">
                                        <Calendar className="h-3 w-3" />
                                        <time>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                                      </div>
                                      <div className="flex items-center gap-1 justify-end" title={`~${String(post.content || '').split(/\\s+/).length} words`}>
                                        <Clock className="h-3 w-3" />
                                        <span>{getReadingTime(post.content)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[13px] text-muted-foreground leading-6 mt-7 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                                    {extractEngagingExcerpt(post.content, 200)}
                                  </p>
                                </CardContent>
                                <CardFooter className="px-4 pb-4 pt-3 mt-auto border-t border-border/50">
                                  <div className="w-full flex items-center justify-between">
                                    {readyReactions && post && post.id && (
                                      <Suspense fallback={null}>
                                        <LikeDislike 
                                          key={`like-${post.id}`} 
                                          postId={post.id}
                                          slug={post.slug}
                                          source="wp"
                                          variant="index"
                                          initialTotals={reactionTotals[post.id] || null}
                                        />
                                      </Suspense>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={(e) => { e.stopPropagation(); navigateToReader(post.slug || post.id); }}
                                      className="h-9 px-4 transition-all"
                                    >
                                      Read story
                                      <ArrowRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </article>
                          );
                        })}
                      </div>
                    );
                  }}
                />
              ) : (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 content-visibility-auto"
                  ref={cardsGridRef as any}
                >
                  {latestPosts.slice(0, visibleCount).map((post, idx) => {
                    
                    const md: any = post.metadata || {};
                    // Prefer metadata theme; otherwise detect from title/content for WordPress API posts
                    let themeCategory = "";
                    if (md && typeof md.themeCategory === 'string' && md.themeCategory.trim()) {
                      themeCategory = String(md.themeCategory);
                    } else {
                      try {
                        const derived = sharedDetermineThemeCategory(String(post.title || ''), String(post.content || ''));
                        themeCategory = String(derived || '');
                      } catch {}
                    }
                    const themeInfo = themeCategory ? THEME_CATEGORIES[themeCategory as keyof typeof THEME_CATEGORIES] : null;
                    const displayName = themeCategory
                      ? themeCategory.charAt(0) + themeCategory.slice(1).toLowerCase().replace(/_/g, ' ')
                      : '';

                    return (
                      <article
                        key={post.id}
                        data-idx={idx}
                        data-post-id={post.id}
                        className="group story-card-container relative"
                      >
                        <Card
                          onClick={() => navigateToReader(post.slug || post.id)}
                          className="h-full overflow-hidden rounded-xl border border-border/60 bg-card/80 transition-all duration-300 ease-out hover:bg-card hover:shadow-lg hover:ring-1 hover:ring-primary/25 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] will-change-transform cursor-pointer"
                        >
                          <CardContent className="p-4 pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <CardTitle
                                  className="text-xl md:text-2xl font-semibold tracking-tight group-hover:text-primary"
                                >
                                  {renderHighlighted(String(post.title || ''))}
                                </CardTitle>
                                {(() => {
                                  const { key, label, iconSlug } = computeThemeMeta(post);
                                  const badgeTint = getBadgeTint(key);
                                  const ThemeIconCmp: any = getThemeIconFor(key, iconSlug);
                                  return (
                                    <div className="mt-1">
                                      <Badge className={`w-fit text-[12px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                        {ThemeIconCmp ? <ThemeIconCmp className="h-3 w-3" /> : null}
                                        {label}
                                      </Badge>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                                <div className="flex items-center gap-1 justify-end">
                                  <Calendar className="h-3 w-3" />
                                  <time>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                                </div>
                                <div className="flex items-center gap-1 justify-end" title={`~${String(post.content || '').split(/\s+/).length} words`}>
                                  <Clock className="h-3 w-3" />
                                  <span>{getReadingTime(post.content)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-[15px] sm:text-[16px] text-muted-foreground leading-6 mt-7 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                              {extractEngagingExcerpt(post.content, 200)}
                            </p>
                          </CardContent>
                          <CardFooter className="px-4 pb-4 pt-3 mt-auto border-t border-border/50">
                            <div className="w-full flex items-center justify-between">
                              {readyReactions && post && post.id && (
                                <Suspense fallback={null}>
                                  <LikeDislike 
                                    key={`like-${post.id}`} 
                                    postId={post.id}
                                    slug={post.slug}
                                    source="wp"
                                    variant="index"
                                    initialTotals={reactionTotals[post.id] || null}
                                  />
                                </Suspense>
                              )}
                              <Button
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); navigateToReader(post.slug || post.id); }}
                                className="h-9 px-4 transition-all"
                              >
                                Read story
                                <ArrowRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </CardFooter>
                        </Card>
                      </article>
                    );
                  })}
                </div>
              )}
              {latestPosts.length > visibleCount && latestPosts.length <= 60 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    className="h-10 px-5 rounded-lg border border-border/60 shadow-sm"
                    disabled={isFetchingNextPage}
                    onClick={async () => {
                      try {
                        const current = visibleCount;
                        const needed = current + pageSize;
                        if (needed > latestPosts.length && hasNextPage) {
                          await fetchNextPage();
                        }
                        setVisibleCount((c) => {
                          const next = c + pageSize;
                          requestAnimationFrame(() => {
                            const el = document.querySelector(`[data-idx="${c}"]`) as HTMLElement | null;
                            el?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                          });
                          return next;
                        });
                      } catch {
                        setVisibleCount((c) => c + pageSize);
                      }
                    }}
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Read more'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );
}