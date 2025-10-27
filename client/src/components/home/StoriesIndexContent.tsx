import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { type posts } from "@shared/schema";
type Post = typeof posts.$inferSelect;
import { useLocation } from "wouter";
import SEO from "@/components/SEO";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, ArrowLeft, Clock, Calendar, Book,
  Award, Search, Ghost, Skull, Brain, Pill, Cpu, Dna, Footprints, CloudRain, Castle, Bug, Radiation, Umbrella, UserMinus2, Anchor, AlertTriangle, Building, Worm, Cloud, CloudFog, Flame,
  Eye, Hourglass, Cat, Moon, Dog, Radio, MoonStar, Box, Car, UserPlus, FlaskConical, Trees, ForkKnife
} from "lucide-react";
const LikeDislike = lazy(() => import("@/components/ui/like-dislike").then(m => ({ default: m.LikeDislike })));
import MostLikedList from "@/components/home/MostLikedList";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

import { getReadingTime, extractEngagingExcerpt } from "@/lib/excerpt-lite";
import { THEME_CATEGORIES } from "@/lib/themes-lite";
import type { WordPressPost } from "@/lib/wordpress-api";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { determineThemeCategory as sharedDetermineThemeCategory, THEME_CATEGORIES as SHARED_THEME_CATEGORIES } from "@shared/theme-categories";
import { getStoryThemeOverride } from "@shared/story-theme-overrides";



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
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [pageSize, setPageSize] = useState<number>(6);
  const cardsGridRef = React.useRef<HTMLDivElement | null>(null);
  const breakpointRef = React.useRef<'mobile' | 'tablet' | 'desktop' | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const update = () => {
      try {
        setCanPrev(Boolean((carouselApi as any).canScrollPrev?.() ?? carouselApi.canScrollPrev()));
        setCanNext(Boolean((carouselApi as any).canScrollNext?.() ?? carouselApi.canScrollNext()));
      } catch {}
    };
    update();
    (carouselApi as any).on?.("select", update);
    (carouselApi as any).on?.("reInit", update);
    return () => {
      try {
        (carouselApi as any).off?.("select", update);
        (carouselApi as any).off?.("reInit", update);
      } catch {}
    };
  }, [carouselApi]);

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
        }
      } catch {
        if (breakpointRef.current !== 'mobile') {
          breakpointRef.current = 'mobile';
          setPageSize(3);
          setVisibleCount((c) => (c < 3 ? 3 : c));
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
      setLocation(`/reader/${encodeURIComponent(slugStr)}`);
    } catch {
      window.location.href = `/reader/${encodeURIComponent(String(slugOrId))}`;
    }
  };

  // Paginated query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSuspenseInfiniteQuery<{ posts: Post[]; hasMore: boolean; page: number }>({
    queryKey: ["wordpress", "posts"],
    queryFn: async ({ pageParam = 1 }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const wpResponse = await fetchWordPressPosts({
        page,
        perPage: 100,
      });
      const wpPosts = wpResponse.posts || [];
      const posts = wpPosts.map((post: WordPressPost) => wpToPost(post)) as Post[];
      return {
        posts,
        hasMore: wpPosts.length === 100,
        page,
      };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialPageParam: 1,
  });

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

  // Available theme categories present in posts
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPosts) {
      const md = (p.metadata || {}) as Record<string, any>;
      if (typeof md.themeCategory === 'string' && md.themeCategory.trim()) {
        set.add(md.themeCategory);
      }
    }
    return Array.from(set);
  }, [allPosts]);

  // Reaction totals map for posts (batch fetched)
  const [reactionTotals, setReactionTotals] = useState<Record<number, import("@/api/reactions").ReactionTotals>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = allPosts.map((p: Post) => Number(p.id)).filter((n: number) => Number.isFinite(n));
        if (ids.length === 0) return;
        const { fetchReactionsBatch } = await import("@/api/reactions");
        const totals = await fetchReactionsBatch(ids.slice(0, 150));
        if (!mounted) return;
        const map: Record<number, import("@/api/reactions").ReactionTotals> = {};
        for (const t of totals) map[t.postId] = t;
        setReactionTotals(map);
      } catch {
        // Ignore failures; UI continues with local fallback logic
      }
    })();

    // Listen for reaction updates from LikeDislike
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as import("@/api/reactions").ReactionTotals;
      if (!detail || typeof detail.postId !== 'number') return;
      setReactionTotals((prev: Record<number, import("@/api/reactions").ReactionTotals>) => ({ ...prev, [detail.postId]: detail }));
    };
    window.addEventListener('reaction:updated', onUpdate as EventListener);
    return () => { mounted = false; window.removeEventListener('reaction:updated', onUpdate as EventListener); };
  }, [allPosts]);

  // Filter and sort posts for display
  const filteredPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // Stronger fuzzy search with synonyms and keyword boosts
    const q = search.trim().toLowerCase();
    const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const jaccard = (a: string[], b: string[]) => {
      if (!a.length || !b.length) return 0;
      const setA = new Set(a);
      const setB = new Set(b);
      const inter = [...setA].filter(x => setB.has(x)).length;
      const union = new Set([...a, ...b]).size;
      return inter / union;
    };
    const editDistance = (a: string, b: string) => {
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

    const synonyms: Record<string, string[]> = {
      ghost: ['spirit','phantom','specter','wraith'],
      curse: ['hex','jinx','spell'],
      witch: ['hag','sorceress'],
      demon: ['fiend','devil'],
      monster: ['creature','beast'],
      blood: ['bleed','bloody'],
      scream: ['yell','shriek'],
      dark: ['night','gloom','black'],
      shadow: ['shade','silhouette'],
      grave: ['tomb','burial'],
      dead: ['deceased','lifeless'],
      fear: ['terror','dread'],
      knife: ['blade','dagger'],
      eyes: ['gaze','stare'],
      footsteps: ['steps','treads'],
      whisper: ['murmur','hiss'],
      door: ['gate','entry'],
      basement: ['cellar'],
      closet: ['wardrobe','cupboard'],
      window: ['pane','glass'],
      bone: ['skeleton'],
      cold: ['chill','freezing'],
      haunted: ['possessed','cursed'],
      night: ['darkness']
    };

    const boostedKeywords = [
      'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
      'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
    ];

    const expandWithSynonyms = (tokens: string[]) => {
      const set = new Set(tokens);
      for (const t of tokens) {
        const syns = synonyms[t];
        if (syns) for (const s of syns) set.add(s);
      }
      return Array.from(set);
    };

    const similarityScore = (post: Post, query: string) => {
      if (!query) return 0;
      const qTokens = tokenize(query);
      const qExpanded = expandWithSynonyms(qTokens);

      const title = String(post.title || "");
      const content = String(post.content || "");
      const titleTokens = tokenize(title);
      const contentTokens = tokenize(content).slice(0, 500); // cap for perf

      // Title overlap (expanded) + direct includes
      const jTitle = jaccard(qExpanded, titleTokens);
      let directTitle = 0;
      for (const qt of qExpanded) {
        if (title.toLowerCase().includes(qt)) directTitle += 0.5;
      }

      // Content token overlap (lighter weight)
      const jContent = jaccard(qExpanded, contentTokens) * 0.55;

      // Typo tolerance: nearest word in title (expanded)
      let typoBonus = 0;
      for (const qt of qExpanded) {
        let best = Infinity;
        for (const tt of titleTokens) {
          const d = editDistance(qt, tt);
          if (d < best) best = d;
        }
        if (best <= 2) typoBonus += 0.4;
      }

      // Keyword boosts if title/content contain boosted keywords (only if query includes boosted keyword)
      const queryContainsBoosted = qTokens.some(t => boostedKeywords.includes(t));
      let keywordBoost = 0;
      for (const kw of boostedKeywords) {
        if (queryContainsBoosted && titleTokens.includes(kw)) keywordBoost += 0.25;
        if (queryContainsBoosted && contentTokens.includes(kw)) keywordBoost += 0.1;
      }

      // Recency and engagement mild bonuses
      const createdAt = new Date(post.createdAt).getTime();
      const ageDays = Math.max(0, (Date.now() - createdAt) / (24 * 60 * 60 * 1000));
      const recency = Math.max(0, 1 - (ageDays / 30)) * 0.18;

      const likes = typeof post.likesCount === 'number' ? post.likesCount : 0;
      const views = post.metadata && (post.metadata as any).pageViews ? Number((post.metadata as any).pageViews) : 0;
      const engagement = Math.min(1, (likes * 0.01) + (views * 0.0005)) * 0.18;

      return (jTitle * 2.2) + directTitle + jContent + typoBonus + keywordBoost + recency + engagement;
    };

    if (q) {
      // Score and sort by similarity; filter minimal matches (stricter to avoid random picks)
      list = list
        .map(p => ({ p, score: similarityScore(p, q) }))
        .filter(x => x.score > 0.32)
        .sort((a, b) => b.score - a.score)
        .map(x => x.p);
    }

    switch (sort) {
      case 'oldest':
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        list.sort((a, b) => {
          const aTotals = reactionTotals[a.id];
          const bTotals = reactionTotals[b.id];

          // Deterministic baseline fallback for likes if totals not yet loaded
          const baselineLikesFor = (p: Post): number => {
            const seedFrom = String((p as any).slug || p.id);
            let h = 0;
            for (let i = 0; i < seedFrom.length; i++) {
              h = (h << 5) - h + seedFrom.charCodeAt(i);
              h |= 0;
            }
            const seededRandom = (n: number) => {
              const x = Math.sin(n) * 10000;
              return x - Math.floor(x);
            };
            const seed = Math.abs(h) * 12345;
            return Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
          };

          const aLikes = Number(aTotals?.totals?.likes ?? (baselineLikesFor(a) + (a.likesCount || 0)));
          const bLikes = Number(bTotals?.totals?.likes ?? (baselineLikesFor(b) + (b.likesCount || 0)));
          const aViews = (a.metadata && (a.metadata as any).pageViews) ? Number((a.metadata as any).pageViews) : 0;
          const bViews = (b.metadata && (b.metadata as any).pageViews) ? Number((b.metadata as any).pageViews) : 0;

          // Mild recency boost (last 30 days)
          const aAgeDays = Math.max(0, (Date.now() - new Date(a.createdAt).getTime()) / (24 * 60 * 60 * 1000));
          const bAgeDays = Math.max(0, (Date.now() - new Date(b.createdAt).getTime()) / (24 * 60 * 60 * 1000));
          const aRecency = Math.max(0, 1 - (aAgeDays / 30)) * 15; // scale comparable to views
          const bRecency = Math.max(0, 1 - (bAgeDays / 30)) * 15;

          const aScore = (aLikes * 3) + aViews + aRecency;
          const bScore = (bLikes * 3) + bViews + bRecency;

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
  }, [sortedPosts, categoryFilter, search, sort, reactionTotals]);

  const currentPosts = filteredPosts;

  // Latest Stories list - always sorted newest->oldest regardless of dropdown, but respects search/category
  const latestPosts = useMemo(() => {
    let list = [...sortedPosts];
    if (categoryFilter !== 'all') {
      list = list.filter(p => {
        const md = (p.metadata || {}) as Record<string, any>;
        return String(md.themeCategory || '').toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    const q = search.trim().toLowerCase();
    if (q) {
      // Reuse similarity scoring from above (inline duplication to avoid refactor)
      const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const jaccard = (a: string[], b: string[]) => {
        if (!a.length || !b.length) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const inter = [...setA].filter(x => setB.has(x)).length;
        const union = new Set([...a, ...b]).size;
        return inter / union;
      };
      const editDistance = (a: string, b: string) => {
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
      const synonyms: Record<string, string[]> = {
        ghost: ['spirit','phantom','specter','wraith'],
        curse: ['hex','jinx','spell'],
        witch: ['hag','sorceress'],
        demon: ['fiend','devil'],
        monster: ['creature','beast'],
        blood: ['bleed','bloody'],
        scream: ['yell','shriek'],
        dark: ['night','gloom','black'],
        shadow: ['shade','silhouette'],
        grave: ['tomb','burial'],
        dead: ['deceased','lifeless'],
        fear: ['terror','dread'],
        knife: ['blade','dagger'],
        eyes: ['gaze','stare'],
        footsteps: ['steps','treads'],
        whisper: ['murmur','hiss'],
        door: ['gate','entry'],
        basement: ['cellar'],
        closet: ['wardrobe','cupboard'],
        window: ['pane','glass'],
        bone: ['skeleton'],
        cold: ['chill','freezing'],
        haunted: ['possessed','cursed'],
        night: ['darkness']
      };
      const boostedKeywords = [
        'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
        'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
      ];
      const expandWithSynonyms = (tokens: string[]) => {
        const set = new Set(tokens);
        for (const t of tokens) {
          const syns = synonyms[t];
          if (syns) for (const s of syns) set.add(s);
        }
        return Array.from(set);
      };
      const similarityScore = (post: Post, query: string) => {
        const qTokens = tokenize(query);
        const qExpanded = expandWithSynonyms(qTokens);
        const title = String(post.title || "");
        const content = String(post.content || "");
        const titleTokens = tokenize(title);
        const contentTokens = tokenize(content).slice(0, 500);
        const jTitle = jaccard(qExpanded, titleTokens);
        let directTitle = 0;
        for (const qt of qExpanded) {
          if (title.toLowerCase().includes(qt)) directTitle += 0.5;
        }
        const jContent = jaccard(qExpanded, contentTokens) * 0.55;
        let typoBonus = 0;
        for (const qt of qExpanded) {
          let best = Infinity;
          for (const tt of titleTokens) {
            const d = editDistance(qt, tt);
            if (d < best) best = d;
          }
          if (best <= 2) typoBonus += 0.4;
        }
        // Only boost if query itself contains boosted keywords
        const queryContainsBoosted = qTokens.some(t => boostedKeywords.includes(t));
        let keywordBoost = 0;
        for (const kw of boostedKeywords) {
          if (queryContainsBoosted && titleTokens.includes(kw)) keywordBoost += 0.25;
          if (queryContainsBoosted && contentTokens.includes(kw)) keywordBoost += 0.1;
        }
        return (jTitle * 2.2) + directTitle + jContent + typoBonus + keywordBoost;
      };

      list = list
        .map(p => ({ p, score: similarityScore(p, q) }))
        .filter(x => x.score > 0.32)
        .map(x => x.p);
    }

    // Always newest -> oldest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [sortedPosts, categoryFilter, search]);

  const featuredStory = useMemo(() => {
    const all = [...currentPosts];
    if (!all || all.length === 0) return null;

    const q = search.trim().toLowerCase();
    // If searching, pick best match as featured (smooth, accurate) with synonyms/boosts
    if (q) {
      const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      const jaccard = (a: string[], b: string[]) => {
        if (!a.length || !b.length) return 0;
        const setA = new Set(a);
        const setB = new Set(b);
        const inter = [...setA].filter(x => setB.has(x)).length;
        const union = new Set([...a, ...b]).size;
        return inter / union;
      };
      const editDistance = (a: string, b: string) => {
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
      const synonyms: Record<string, string[]> = {
        ghost: ['spirit','phantom','specter','wraith'],
        curse: ['hex','jinx','spell'],
        witch: ['hag','sorceress'],
        demon: ['fiend','devil'],
        monster: ['creature','beast'],
        blood: ['bleed','bloody'],
        scream: ['yell','shriek'],
        dark: ['night','gloom','black'],
        shadow: ['shade','silhouette'],
        grave: ['tomb','burial'],
        dead: ['deceased','lifeless'],
        fear: ['terror','dread'],
        knife: ['blade','dagger'],
        eyes: ['gaze','stare'],
        footsteps: ['steps','treads'],
        whisper: ['murmur','hiss'],
        door: ['gate','entry'],
        basement: ['cellar'],
        closet: ['wardrobe','cupboard'],
        window: ['pane','glass'],
        bone: ['skeleton'],
        cold: ['chill','freezing'],
        haunted: ['possessed','cursed'],
        night: ['darkness']
      };
      const boostedKeywords = [
        'blood','scream','shadow','dark','fear','dead','grave','curse','witch','ghost','monster',
        'door','basement','closet','window','footsteps','whisper','knife','bone','eyes','cold','haunted','night'
      ];
      const expandWithSynonyms = (tokens: string[]) => {
        const set = new Set(tokens);
        for (const t of tokens) {
          const syns = synonyms[t];
          if (syns) for (const s of syns) set.add(s);
        }
        return Array.from(set);
      };

      const qTokens = tokenize(q);
      const qExpanded = expandWithSynonyms(qTokens);
      const score = (p: Post) => {
        const title = String(p.title || "");
        const content = String(p.content || "");
        const tTok = tokenize(title);
        const cTok = tokenize(content).slice(0, 400);
        const jTitle = jaccard(qExpanded, tTok) * 2.2;
        let directTitle = 0;
        for (const qt of qExpanded) if (title.toLowerCase().includes(qt)) directTitle += 0.5;
        const jContent = jaccard(qExpanded, cTok) * 0.55;
        let typoBonus = 0;
        for (const qt of qExpanded) {
          let best = Infinity;
          for (const tt of tTok) {
            const d = editDistance(qt, tt);
            if (d < best) best = d;
          }
          if (best <= 2) typoBonus += 0.4;
        }
        // Only boost if query itself contains boosted keywords
        const queryContainsBoosted = qTokens.some(t => boostedKeywords.includes(t));
        let keywordBoost = 0;
        for (const kw of boostedKeywords) {
          if (queryContainsBoosted && tTok.includes(kw)) keywordBoost += 0.25;
          if (queryContainsBoosted && cTok.includes(kw)) keywordBoost += 0.1;
        }
        return jTitle + directTitle + jContent + typoBonus + keywordBoost;
      };

      const scoredBySearch = all
        .map(p => ({ p, s: score(p) }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);

      // Only feature a story if the query has a close match (typo tolerance <= 2)
      const hasCloseMatch = (() => {
        const qTokens = tokenize(q);
        for (const p of all) {
          const tTok = tokenize(String(p.title || ''));
          for (const qt of qTokens) {
            for (const tt of tTok) {
              const d = editDistance(qt, tt);
              if (d <= 2) return true;
            }
          }
        }
        return false;
      })();

      if (!hasCloseMatch) return null;

      return scoredBySearch[0] || null;
    }

    // If explicitly sorting by popular, pick highest likes + engagement using live reaction totals
    if (sort === 'popular') {
      const topByPopular = [...all].sort((a, b) => {
        const aTotals = reactionTotals[a.id];
        const bTotals = reactionTotals[b.id];

        const baselineLikesFor = (p: Post): number => {
          const seedFrom = String((p as any).slug || p.id);
          let h = 0;
          for (let i = 0; i < seedFrom.length; i++) {
            h = (h << 5) - h + seedFrom.charCodeAt(i);
            h |= 0;
          }
          const seededRandom = (n: number) => {
            const x = Math.sin(n) * 10000;
            return x - Math.floor(x);
          };
          const seed = Math.abs(h) * 12345;
          return Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
        };

        const aLikes = Number(aTotals?.totals?.likes ?? (baselineLikesFor(a) + (a.likesCount || 0)));
        const bLikes = Number(bTotals?.totals?.likes ?? (baselineLikesFor(b) + (b.likesCount || 0)));
        const aViews = a.metadata && (a.metadata as any).pageViews
          ? Number((a.metadata as any).pageViews)
          : 0;
        const bViews = b.metadata && (b.metadata as any).pageViews
          ? Number((b.metadata as any).pageViews)
          : 0;

        const aAgeDays = Math.max(0, (Date.now() - new Date(a.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        const bAgeDays = Math.max(0, (Date.now() - new Date(b.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        const aRecency = Math.max(0, 1 - (aAgeDays / 30)) * 15;
        const bRecency = Math.max(0, 1 - (bAgeDays / 30)) * 15;

        const aScore = (aLikes * 3) + aViews + aRecency;
        const bScore = (bLikes * 3) + bViews + bRecency;

        return bScore - aScore;
      });
      return topByPopular[0] || all[0];
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
      const aLikes = typeof a.likesCount === 'number' ? a.likesCount : 0;
      const bLikes = typeof b.likesCount === 'number' ? b.likesCount : 0;
      const aDislikes = typeof a.dislikesCount === 'number' ? a.dislikesCount : 0;
      const bDislikes = typeof b.dislikesCount === 'number' ? b.dislikesCount : 0;
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
  }, [currentPosts, search, sort, reactionTotals]);

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
          title="Stories"
          description="Browse dark, psychological, and gothic fiction stories at Bubble’s Cafe."
          canonical="/stories"
          type="website"
        />
        <div className="w-full pb-12 pt-0 flex-1 mx-0 px-4 sm:px-6 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4 px-4 sm:px-6 mt-8 sm:mt-12">
            {/* Story index controls: search only; sort moved into the featured story card */}
            <div className="flex items-center gap-2 w-full sm:w-full">
              <div className="relative w-full">
                <Input
                  placeholder="Search stories..."
                  className="pl-3 pr-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">⏎</span>
              </div>
            </div>
          </div>

          {/* Featured row */}
          {(featuredStory && currentPosts.length > 0) && (
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="overflow-hidden rounded-xl border border-border/60 bg-card/80 shadow-sm">
                  <CardContent className="p-4">
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
                    <button className="text-left text-lg font-castoro hover:text-primary line-clamp-2" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)}>
                      {featuredStory.title}
                    </button>
                    <p className="text-sm text-muted-foreground leading-6 mt-2 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                      {extractEngagingExcerpt(featuredStory.content, 220)}
                    </p>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <time>{new Date(featuredStory.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{getReadingTime(featuredStory.content)}</span>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => navigateToReader(featuredStory.slug || featuredStory.id)} className="h-9 px-4 transition-transform active:scale-95">
                        Read story
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="text-lg md:text-2xl font-semibold text-foreground">
                {latestPosts.length} stories
              </div>
            </div>
          </div>
          {/* Optional category filter if categories exist */}
          {availableCategories.length > 0 && (
            <div className="mb-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g,' ').toLowerCase().replace(/^./, c => c.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stories List */}
          {latestPosts.length === 0 ? (
            <div className="mx-auto max-w-full sm:max-w-2xl md:max-w-3xl text-center py-8 sm:py-10 md:py-12 rounded-xl border border-border/60 bg-card/80 px-3 sm:px-6 shadow-sm overflow-hidden">
              <div className="w-full">
                <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 mt-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">No matches found</h2>
                </div>

                {search.trim() ? (
                  <>
                    <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                      We couldn’t find any stories matching “{search.trim()}”. Try the closest matches below or explore popular stories.
                    </p>

                    <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                      {(() => {
                        const q = search.trim().toLowerCase();
                        const tokenize = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
                        const jaccard = (a: string[], b: string[]) => {
                          if (!a.length || !b.length) return 0;
                          const setA = new Set(a);
                          const setB = new Set(b);
                          const inter = [...setA].filter(x => setB.has(x)).length;
                          const union = new Set([...a, ...b]).size;
                          return inter / union;
                        };
                        const editDistance = (a: string, b: string) => {
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
                        const qTokens = tokenize(q);
                        const score = (p: Post) => {
                          const title = String(p.title || "");
                          const tTok = tokenize(title);
                          let minD = Infinity;
                          for (const qt of qTokens) {
                            for (const tt of tTok) {
                              const d = editDistance(qt, tt);
                              if (d < minD) minD = d;
                            }
                          }
                          const includesBonus = title.toLowerCase().includes(q) ? 3 : 0;
                          const j = jaccard(qTokens, tTok);
                          const distanceBoost = minD <= 2 ? (2 - minD) : -minD * 0.15;
                          return includesBonus + (j * 2) + distanceBoost;
                        };
                        const suggestions = [...sortedPosts]
                          .map(p => ({ p, s: score(p) }))
                          .filter(x => x.s > 0.5)
                          .sort((a, b) => b.s - a.s)
                          .slice(0, 3)
                          .map(x => x.p);

                        return suggestions.length ? suggestions.map(s => (
                          <Card key={s.id} className="rounded-lg border border-border/60 bg-card/70 hover:bg-card transition">
                            <CardContent className="p-3">
                              <button
                                className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                                onClick={() => navigateToReader(s.slug || s.id)}
                                title={s.title}
                              >
                                {s.title}
                              </button>
                              <p className="text-[12px] text-muted-foreground leading-5 mt-1 line-clamp-1">
                                {extractEngagingExcerpt(s.content, 100)}
                              </p>

                              {(() => {
                                const md: any = (s as any)?.metadata || {};
                                const primaryThemeRaw =
                                  md.themeCategory ||
                                  sharedDetermineThemeCategory(String(s.title || ''), String(s.content || ''));

                                const override = getStoryThemeOverride(s.slug as any, s.title as any);

                                const derivedKey = (() => {
                                  const raw = String(primaryThemeRaw || '').trim();
                                  if (!raw) return 'HORROR';
                                  for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
                                    if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
                                  }
                                  return raw.toUpperCase().replace(/\s+/g, '_');
                                })();

                                const themeKey = override?.key || derivedKey;

                                const baseLabel =
                                  override?.label ||
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
                                  return baseLabel;
                                })();

                                const badgeTint = (() => {
                                  switch (themeKey) {
                                    case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
                                    case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
                                    case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
                                    case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
                                    case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
                                    case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
                                    case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
                                    case 'CANNIBALISM': return 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
                                    case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
                                    case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
                                    case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
                                    case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
                                    case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
                                    case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
                                    case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
                                    case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
                                    default: return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
                                  }
                                })();

                                return (
                                  <div className="mt-1">
                                    <Badge className={`w-fit text-[11px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                      {prettyLabel}
                                    </Badge>
                                  </div>
                                );
                              })()}

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
                        );
                      })()}
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Button variant="outline" size="sm" onClick={() => setSearch("")} className="h-9 px-3">
                        Clear search
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          try {
                            // Build a top-5 list by like count (using live totals when available, fallback otherwise)
                            const topPopular = [...sortedPosts]
                              .sort((a, b) => {
                                const aTotals = reactionTotals[a.id];
                                const bTotals = reactionTotals[b.id];

                                const baselineLikesFor = (p: Post): number => {
                                  const seedFrom = String((p as any).slug || p.id);
                                  let h = 0;
                                  for (let i = 0; i < seedFrom.length; i++) {
                                    h = (h << 5) - h + seedFrom.charCodeAt(i);
                                    h |= 0;
                                  }
                                  const seededRandom = (n: number) => {
                                    const x = Math.sin(n) * 10000;
                                    return x - Math.floor(x);
                                  };
                                  const seed = Math.abs(h) * 12345;
                                  return Math.floor(seededRandom(seed) * (200 - 80 + 1)) + 80;
                                };

                                const aLikes = Number(aTotals?.totals?.likes ?? (baselineLikesFor(a) + (a.likesCount || 0)));
                                const bLikes = Number(bTotals?.totals?.likes ?? (baselineLikesFor(b) + (b.likesCount || 0)));

                                return bLikes - aLikes;
                              })
                              .slice(0, 5);

                            if (topPopular.length > 0) {
                              const pick = topPopular[Math.floor(Math.random() * topPopular.length)];
                              navigateToReader(pick.slug || pick.id);
                            } else {
                              // Fallback: if something goes wrong, just sort to popular view
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
                  <Carousel opts={{ align: "start", containScroll: "trimSnaps" }} setApi={setCarouselApi}>
                    <CarouselContent>
                      {(() => {
                        const popular = [...sortedPosts]
                          .map(p => {
                            const totals = reactionTotals[p.id];
                            const likesTotal = totals?.totals?.likes ?? (((p as any).baselineLikes || 0) + (p.likesCount || 0));
                            const views = p.metadata && (p.metadata as any).pageViews ? Number((p.metadata as any).pageViews) : 0;
                            return { p, score: (Number(likesTotal) * 2) + views };
                          })
                          .sort((a, b) => b.score - a.score)
                          .slice(0, 6)
                          .map(x => x.p);
                        return popular.map(pop => (
                          <CarouselItem key={pop.id} className="basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <Card className="rounded-lg border border-border/50 bg-card/70 hover:bg-card transition">
                              <CardContent className="p-3">
                                <button
                                  className="text-left text-sm font-medium line-clamp-2 hover:text-primary"
                                  onClick={() => navigateToReader(pop.slug || pop.id)}
                                >
                                  {pop.title}
                                </button>
                                <p className="text-[12px] text-muted-foreground leading-5 mt-1 line-clamp-1">
                                  {extractEngagingExcerpt(pop.content, 100)}
                                </p>

                                {(() => {
                                  const md: any = (pop as any)?.metadata || {};
                                  const primaryThemeRaw =
                                    md.themeCategory ||
                                    sharedDetermineThemeCategory(String(pop.title || ''), String(pop.content || ''));

                                  const override = getStoryThemeOverride(pop.slug as any, pop.title as any);

                                  const derivedKey = (() => {
                                    const raw = String(primaryThemeRaw || '').trim();
                                    if (!raw) return 'HORROR';
                                    for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
                                      if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
                                    }
                                    return raw.toUpperCase().replace(/\s+/g, '_');
                                  })();

                                  const themeKey = override?.key || derivedKey;

                                  const baseLabel =
                                    override?.label ||
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
                                    return baseLabel;
                                  })();

                                  const badgeTint = (() => {
                                    switch (themeKey) {
                                      case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
                                      case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
                                      case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
                                      case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
                                      case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
                                      case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
                                      case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
                                      case 'CANNIBALISM': return 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
                                      case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
                                      case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
                                      case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
                                      case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
                                      case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
                                      case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
                                      case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
                                      case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
                                      default: return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
                                    }
                                  })();

                                  return (
                                    <div className="mt-1">
                                      <Badge className={`w-fit text-[11px] font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                        {prettyLabel}
                                      </Badge>
                                    </div>
                                  );
                                })()}

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
                          </CarouselItem>
                        ));
                      })()}
                    </CarouselContent>
                  </Carousel>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => { try { carouselApi?.scrollPrev(); } catch {} }}
                      disabled={!canPrev}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => { try { carouselApi?.scrollNext(); } catch {} }}
                      disabled={!canNext}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
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
                      className="group story-card-container relative"
                    >
                      <Card
                        onClick={() => navigateToReader(post.slug || post.id)}
                        className="h-full overflow-hidden rounded-xl border border-border/60 bg-card/80 transition-all duration-300 ease-out hover:bg-card hover:shadow-lg hover:ring-1 hover:ring-primary/25 cursor-pointer"
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle
                              className="text-lg font-semibold tracking-tight group-hover:text-primary"
                            >
                              {post.title}
                            </CardTitle>
                            <div className="text-[11px] sm:text-xs text-muted-foreground space-y-1 whitespace-nowrap">
                              <div className="flex items-center gap-1 justify-end">
                                <Calendar className="h-3 w-3" />
                                <time>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                <span>{getReadingTime(post.content)}</span>
                              </div>
                            </div>
                          </div>
                          {themeCategory && (() => {
                            const override = getStoryThemeOverride(post.slug as any, post.title as any);

                            const derivedKey = (() => {
                              const raw = themeCategory;
                              if (!raw) return '';
                              for (const [key, info] of Object.entries(SHARED_THEME_CATEGORIES as Record<string, any>)) {
                                if (String((info as any)?.label || '').toLowerCase() === raw.toLowerCase()) return key;
                              }
                              return raw.toUpperCase().replace(/\s+/g, '_');
                            })();

                            const themeKeyForTint = override?.key || derivedKey;

                            const chosenIconSlug =
                              override?.icon ||
                              (md && (md as any).themeIcon) ||
                              (SHARED_THEME_CATEGORIES as any)[derivedKey]?.icon ||
                              'ghost';

                            const ThemeIconCmp = (() => {
                              const slug = String(chosenIconSlug).toLowerCase();
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
                                case 'knife': return ForkKnife;
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
                                case 'trees':
                                case 'tree': return Trees;
                              }
                              // Fallback by theme key for diversity when slug is unknown
                              switch (themeKeyForTint) {
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
                                case 'FOLK_HORROR': return Trees;
                                case 'GOTHIC': return Castle;
                                case 'COSMIC': return Moon;
                                case 'VEHICULAR': return Car;
                                default: return Ghost;
                              }
                            })();

                            const baseLabel =
                              override?.label ||
                              (SHARED_THEME_CATEGORIES as any)[derivedKey]?.label ||
                              themeCategory;

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
                              return baseLabel;
                            })();

                            const badgeTint = (() => {
                              switch (themeKeyForTint) {
                                case 'DEATH': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
                                case 'BODY_HORROR': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700';
                                case 'SUPERNATURAL': return 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700';
                                case 'PSYCHOLOGICAL': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
                                case 'EXISTENTIAL': return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700';
                                case 'HORROR': return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700';
                                case 'STALKING': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700';
                                case 'CANNIBALISM': return 'bg-red-200 text-red-900 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
                                case 'PSYCHOPATH': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-700';
                                case 'DOPPELGANGER': return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700';
                                case 'VEHICULAR': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
                                case 'PARASITE': return 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700';
                                case 'TECHNOLOGICAL': return 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700';
                                case 'COSMIC': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
                                case 'UNCANNY': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700';
                                case 'GOTHIC': return 'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-900/30 dark:text-stone-300 dark:border-stone-700';
                                default: return 'bg-primary/10 text-foreground border-primary/20 dark:bg-primary/10 dark:text-foreground dark:border-primary/20';
                              }
                            })();

                            return (
                              <div className="mt-2">
                                <Badge className={`w-fit text-[12px] sm:text-sm font-medium tracking-wide px-2 py-0.5 flex items-center gap-1 border ${badgeTint}`}>
                                  <ThemeIconCmp className="h-3 w-3" />
                                  {prettyLabel}
                                </Badge>
                              </div>
                            );
                          })()}
                        </CardHeader>
                        <CardContent className="px-4 pt-0 pb-3">
                          <p className="text-sm text-muted-foreground leading-6 line-clamp-3 font-sans" style={{ fontFamily: "'Roboto', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
                            {extractEngagingExcerpt(post.content, 200)}
                          </p>
                        </CardContent>
                        <CardFooter className="px-4 pb-4 pt-3 mt-auto border-t border-border/50">
                          <div className="w-full flex items-center justify-between">
                            {post && post.id && (
                              <Suspense fallback={<div className="text-xs text-muted-foreground">…</div>}>
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
              {latestPosts.length > visibleCount && (
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