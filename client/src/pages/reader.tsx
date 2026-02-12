import React, { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import useReaderUIToggle from "@/hooks/use-reader-ui-toggle";
import { useCopyProtection } from "@/hooks/useCopyProtection";
import useInlineCommenting from "@/hooks/useInlineCommenting";
import ReaderTooltip from "@/components/reader/ReaderTooltip";
import TableOfContents from "@/components/reader/TableOfContents";

import ReaderHorrorOverlayPortal from "@/components/reader/ReaderHorrorOverlayPortal";
import "@/styles/reader-fixes.css";
import "@/styles/reader-typography.css";
import { 
  Share2, Minus, Plus, Shuffle, ChevronLeft, ChevronRight,
  Skull, Brain, Pill, Cpu, Dna, Ghost, Cross, Umbrella, Footprints, CloudRain, Castle, 
  Radiation, UserMinus2, Anchor, AlertTriangle, Building, Bug, Worm, Cloud, CloudFog, BookText, Trash, X, Pencil, Clock,
  Eye, Hourglass, Cat, Moon, Dog, Radio, MoonStar, Box, Car, UserPlus, FlaskConical, Trees, ForkKnife, Bone, Type
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import type { FontFamilyKey } from "@/hooks/use-font-family";
import { detectThemes, THEME_CATEGORIES, getExcerpt } from "@/lib/content-analysis";
import { fetchWordPressPosts, type WordPressPost } from "@/lib/wordpress-api";
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { useAuth } from "@/hooks/use-auth";
import RouteLoader from "@/components/ui/RouteLoader";
import CreepyTextGlitch from "@/components/errors/CreepyTextGlitch";
import SimplifiedErrorPage from "@/components/errors/SimplifiedErrorPage";
import { useToast } from "@/hooks/use-toast";
import { apiJson, getJson } from "@/lib/api";
import SimpleCommentSection from "@/components/blog/SimpleCommentSection";

import { SupportWritingCard } from "@/components/SupportWritingCard";
import { resolveAuthorId } from "@/lib/reader-navigation";

import SEO from "@/components/SEO";
import type { Post } from "@shared/schema";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEME_CATEGORIES as SHARED_THEME_CATEGORIES, determineThemeCategory } from "@shared/theme-categories";
import { getStoryThemeOverride } from "@shared/story-theme-overrides";
import { getThemeDefinitionOverride, syncThemeDefinitionOverridesFromServer } from "@/shared/theme-definitions";
import { Icon } from "@iconify/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getBadgeTint } from "@/lib/theme-badges";
import { useThemeCategories } from "@/hooks/use-theme-categories";

import { useReaderScrollProgress } from "@/hooks/reader/use-reader-scroll-progress";
import { useReaderFonts } from "@/hooks/reader/use-reader-fonts";
import { useReaderHorrorOverlay } from "@/hooks/reader/use-reader-horror-overlay";
import { useReaderDebugInstrumentation } from "@/hooks/reader/use-reader-debug";
import { useReaderProgressPersistence } from "@/hooks/reader/use-reader-progress-persistence";
import { useReaderAnalytics } from "@/hooks/reader/use-reader-analytics";

const ReaderSocialIcons = lazy(() => import("@/components/reader/ReaderSocialIcons"));

// Native HTML sanitization function (now powered by DOMPurify with extra hardening)
const sanitizeHtmlContent = (html: string): string => {
  try {
    return sanitizeHtml(html);
  } catch (error) {
    console.error("[Reader] Error sanitizing HTML:", error);
    return html;
  }
};

// Normalize WordPress fields (string or { rendered: string }) to a string
const getRenderedText = (value: any): string => {
  try {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object' && typeof value.rendered === 'string') {
      return value.rendered;
    }
    return '';
  } catch {
    return '';
  }
};

interface ReaderPageProps {
  slug?: string;
  params?: { slug?: string };
  isCommunityContent?: boolean;
}

export default function ReaderPage({ slug, params, isCommunityContent = false }: ReaderPageProps) {
  // Log params for debugging (dev only)
  if (import.meta.env?.DEV) {
    console.log('[ReaderPage] Initializing with params:', { routeSlug: params?.slug || slug, params, slug });
  }

  // Extract slug from route params if provided
  const routeSlug = params?.slug || slug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { CommentDialog } = useInlineCommenting({
    enabled: true,
    onSubmitComment: async (text, selection, range) => {
      try {
        const postId = Number((posts?.[currentIndex] || currentPost)?.id || 0);
        if (!Number.isFinite(postId) || postId <= 0) return;
        await apiJson('POST', `/api/posts/${postId}/comments`, {
          content: text,
          selectionText: selection,
          anchorParagraphIndex:
            Number(range.paragraphIndex ?? -1) >= 0 ? Number(range.paragraphIndex) : undefined,
          selectionStart: Number.isFinite(range.start) ? Number(range.start) : undefined,
          selectionEnd: Number.isFinite(range.end) ? Number(range.end) : undefined,
        });
        toast({ title: 'Comment added', description: 'Your inline comment has been submitted.' });
      } catch (e: any) {
        toast({ title: 'Failed to add comment', description: e?.message || 'Please try again.', variant: 'destructive' });
      }
    },
    contentSelector: '.story-content',
  });

  const logReaderError = (id: string, message: any, extra?: any) => {
    try {
      const key = `reader_error_logged_${id}`;
      // Gate each error id to once per session to avoid noisy logs
      const already = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (already) return;
      try {
        sessionStorage.setItem(key, '1');
      } catch {}
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          message:
            typeof message === 'string'
              ? message
              : (message && (message.message || String(message))) || 'Unknown',
          extra,
        }),
      }).catch(() => {});
    } catch {}
  };

  // Authentication hook to check user role for admin actions
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.isAdmin === true;

  // Reader-specific fonts and theme handling (CSS variables applied in hook).
  const {
    theme,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    fontFamily,
    availableFonts,
    updateFontFamily,
  } = useReaderFonts();

  const { categoriesMap, categoriesList } = useThemeCategories();

  // One-click distraction-free mode - toggle UI visibility with click
  const { isUIHidden, toggleUI, showTooltip, setUIHidden } = useReaderUIToggle();

  // State for dialog controls
  const [fontDialogOpen, setFontDialogOpen] = useState(false);
  const [contentsDialogOpen, setContentsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [randomTipOpen, setRandomTipOpen] = useState(false);

  // Debug instrumentation references (controls/meta/nav/pager/share rows and content container)
  const controlsRowRef = useRef<HTMLDivElement | null>(null);
  const metaRowRef = useRef<HTMLDivElement | null>(null);
  const navRowRef = useRef<HTMLDivElement | null>(null);
  const pagerRowRef = useRef<HTMLDivElement | null>(null);
  const shareRowRef = useRef<HTMLDivElement | null>(null);

  // Inline admin theme editor state
  const [themeEditorOpen, setThemeEditorOpen] = useState(false);
  const [selectedThemeCat, setSelectedThemeCat] = useState<string>('');
  const [selectedThemeIcon, setSelectedThemeIcon] = useState<string>('');
  const [savingTheme, setSavingTheme] = useState(false);
  const [overrideThemeCategory, setOverrideThemeCategory] = useState<string | null>(null);
  const [overrideThemeIcon, setOverrideThemeIcon] = useState<string | null>(null);

  // Derived: any dialog open (used to stabilise layout during overlays/dropdowns)
  const isAnyDialogOpen = fontDialogOpen || contentsDialogOpen || showDeleteDialog || themeEditorOpen;

  // Create a ref for the content container to attach copy protection
  const contentRef = useCopyProtection(false);

  // Reader horror overlay / rapid navigation easter egg
  const {
    showHorrorMessage,
    horrorMessageText,
    triggerRapidNavigation,
    handleOverlayClose,
  } = useReaderHorrorOverlay();

  // Reading progress (scroll-based) with rAF smoothing, centralised in a hook
  const { readingProgress } = useReaderScrollProgress();

  // Will initialise this after data is loaded (kept for behaviour parity with existing persistence)
  const [autoSaveSlug, setAutoSaveSlug] = useState<string>("");

  // Debug instrumentation (DEV or localStorage('reader_debug') === '1')
  const debugEnabled = useReaderDebugInstrumentation({
    contentRef,
    controlsRowRef,
    metaRowRef,
    navRowRef,
    pagerRowRef,
    shareRowRef,
    isUIHidden,
    fontDialogOpen,
    contentsDialogOpen,
    themeEditorOpen,
    isAnyDialogOpen,
  });

  // Dialogs are controlled via state; avoid querying DOM for close buttons

  // Reset UI hidden state on theme changes to avoid unpredictable layout shifts
  useEffect(() => {
    try { setUIHidden(false); } catch {}
  }, [theme, setUIHidden]);

  // Toggle UI with debug logging wrapper
  const toggleUIWithDebug = (reason: string) => {
    try {
      if (debugEnabled) {
        console.log('[Reader.debug] toggleUI invoked', { reason, isUIHiddenBefore: isUIHidden });
      }
    } catch {}
    toggleUI();
    try {
      if (debugEnabled) {
        console.log('[Reader.debug] toggleUI scheduled state flip');
      }
    } catch {}
  };

  // Delete Post Mutation for admin actions
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (import.meta.env?.DEV) {
        console.log(`[Reader] Attempting to delete post with ID: ${postId}`);
      }
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/, "$1");
      if (import.meta.env?.DEV) {
        console.log('[Reader] Using CSRF token for deletion');
      }
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });

      // Handle 204 No Content without parsing
      if (response.status === 204) {
        return { ok: true };
      }

      // Parse JSON only if content-type indicates JSON
      let data: any = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        console.error(`[Reader] Delete failed with status: ${response.status}`, data);
        if (response.status === 401) {
          throw new Error('Please log in to delete this story');
        } else {
          throw new Error((data && data.message) ? data.message : `Failed to delete post (status ${response.status})`);
        }
      }
      
      return data ?? { ok: true };
    },
    onSuccess: () => {
      // Invalidate related queries to ensure cache is properly cleared
      if (import.meta.env?.DEV) {
        console.log('[Reader] Invalidating related query caches');
      }
      
      // Invalidate community posts list only when applicable
      if (isCommunityContent) {
        queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      }
      
      // Invalidate specific post endpoints
      if (currentPost?.id) {
        if (import.meta.env?.DEV) {
          console.log(`[Reader] Invalidating specific post cache for ID: ${currentPost.id}`);
        }
        queryClient.invalidateQueries({ 
          queryKey: ['/api/posts', currentPost.id.toString()]
        });
      }
      
      // Also invalidate the specific post query based on the slug
      if (routeSlug) {
        if (import.meta.env?.DEV) {
          console.log('[Reader] Invalidating specific post cache for slug:', routeSlug);
        }
        queryClient.invalidateQueries({ 
          queryKey: ["wordpress", "posts", "reader", routeSlug] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['/api/posts', routeSlug] 
        });
      }
      
      setShowDeleteDialog(false);
      
      toast({
        title: 'Story Deleted',
        description: isAdmin && user?.id !== (currentPost as any)?.authorId
          ? 'Community story has been deleted by admin.'
          : 'Your story has been deleted successfully.',
      });
      
      // Force navigation back to the community page after deletion
      if (import.meta.env?.DEV) {
        console.log('[Reader] Navigating back to community page');
      }
      // Immediate navigation to prevent page from trying to load deleted content
      setLocation('/community');
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive'
      });
      setShowDeleteDialog(false);
    }
  });

  if (import.meta.env?.DEV) {
    console.log('[Reader] Component mounted with slug:', routeSlug);
  }
  
  // Initialise currentIndex with validation
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const savedIndex = sessionStorage.getItem('selectedStoryIndex');
      if (import.meta.env?.DEV) {
        console.log('[Reader] Retrieved saved index:', savedIndex);
      }

      if (!savedIndex) {
        if (import.meta.env?.DEV) {
          console.log('[Reader] No saved index found, defaulting to 0');
        }
        return 0;
      }

      const parsedIndex = parseInt(savedIndex, 10);
      if (isNaN(parsedIndex) || parsedIndex < 0) {
        console.log('[Reader] Invalid saved index, defaulting to 0');
        return 0;
      }

      return parsedIndex;
    } catch (error) {
      console.error('[Reader] Error reading from sessionStorage:', error);
      return 0;
    }
  });

  const { data: postsData, isLoading: isLoadingSupabase, error: supabaseError } = useQuery<{ posts: Post[]; hasMore?: boolean }>({
    // Stabilise the query key so the list is reused across slug changes
    queryKey: ["posts", "reader", isCommunityContent ? "community" : "regular"],
    queryFn: async () => {
      if (import.meta.env?.DEV) {
        console.log('[Reader] Fetching posts list (Supabase-backed)...', { routeSlug, isCommunityContent });
      }

      try {
        const endpoint = isCommunityContent
          ? '/api/posts/community?page=1&limit=100'
          : '/api/posts/compact?page=1&limit=100';
        const result = await getJson<{ posts: Post[]; hasMore?: boolean }>(endpoint);
        const posts = Array.isArray(result.posts) ? result.posts : [];
        return { posts, hasMore: result.hasMore };
      } catch (error) {
        console.error('[Reader] Error fetching posts list:', error);
        try { logReaderError('reader.list.fetchError', error); } catch {}
        throw error;
      }
    },
    // Keep previous content visible while background fetching occurs
    // Reduce jank: avoid auto refetch on mount/focus to prevent flicker and network bursts
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  // Determine if we have any Supabase-backed posts available
  const hasSupabasePosts = useMemo(() => {
    const dataPosts: Post[] | undefined = (postsData as any)?.posts;
    return Array.isArray(dataPosts) && dataPosts.length > 0;
  }, [postsData]);

  // Always enable WordPress fetch for non-community stories once initial Supabase load completes.
  // This ensures older WordPress-only stories remain available even when Supabase has only a
  // partial subset of posts (e.g., a couple of synced stories).
  const enableWordPressFallback = !isCommunityContent && !isLoadingSupabase;

  const {
    data: wpPostsData,
    isLoading: isLoadingWordpress,
    error: wordpressError,
  } = useQuery<{ posts: Post[]; hasMore?: boolean }>(
    {
      queryKey: ["posts", "reader", "wordpress"],
      enabled: enableWordPressFallback,
      queryFn: async () => {
        if (import.meta.env?.DEV) {
          console.log('[Reader] Falling back to WordPress posts...', { routeSlug });
        }
        try {
          const result = await fetchWordPressPosts({
            page: 1,
            // Limit WordPress fallback to a smaller page for faster initial loads while
            // still providing a rich fallback list when Supabase is unavailable.
            perPage: 40,
            includeContent: true,
            maxRetries: 1,
          });
          const wpPosts = Array.isArray(result.posts) ? result.posts : [];

          const posts: Post[] = wpPosts.map((post: WordPressPost) => {
            const title = getRenderedText(post.title) || post.title?.rendered || 'Untitled Story';
            const content = getRenderedText(post.content) || post.content?.rendered || '';
            const slug = post.slug || `post-${post.id ?? Date.now()}`;
            const createdAt = post.date || new Date().toISOString();
            const metadata: any = {
              ...(post.meta || {}),
              wordpressId: typeof post.id === 'number' ? post.id : undefined,
              wordpressLink: typeof post.link === 'string' ? post.link : undefined,
              source: 'wordpress_api',
            };

            const wordCount = content
              .replace(/<[^>]*>/g, ' ')
              .split(/\s+/)
              .filter(Boolean).length;

            return {
              id: typeof post.id === 'number' ? post.id : Math.floor(Math.random() * 1_000_000),
              title,
              content,
              slug,
              excerpt: post.excerpt?.rendered ?? null,
              authorId: undefined,
              isSecret: false,
              isAdminPost: false,
              matureContent: false,
              themeCategory: null,
              readingTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
              likesCount: 0,
              dislikesCount: 0,
              baselineLikes: 0,
              baselineDislikes: 0,
              metadata,
              createdAt,
            } as unknown as Post;
          });

          return { posts, hasMore: result.totalPages > 1 };
        } catch (error) {
          console.error('[Reader] WordPress fallback failed:', error);
          try { logReaderError('reader.list.wpFallbackError', error); } catch {}
          throw error;
        }
      },
      staleTime: 5 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  // Memoised posts array for consistent usage across hooks.
  // For community stories we rely solely on Supabase; for regular stories we
  // merge Supabase and WordPress posts so that legacy WordPress-only stories
  // remain navigable even when Supabase has only a subset of posts.
  const posts = useMemo<Post[]>(() => {
    const dataPosts: Post[] | undefined = (postsData as any)?.posts;
    const supabasePosts = Array.isArray(dataPosts) ? dataPosts : [];

    if (isCommunityContent) {
      return supabasePosts;
    }

    const wpDataPosts: Post[] | undefined = (wpPostsData as any)?.posts;
    const wordpressPosts = Array.isArray(wpDataPosts) ? wpDataPosts : [];

    if (!supabasePosts.length && !wordpressPosts.length) {
      return [];
    }

    const merged: Post[] = [...supabasePosts];
    const seenSlugs = new Set(
      supabasePosts
        .map((p: any) => String(p?.slug || '').toLowerCase())
        .filter((s) => !!s),
    );

    for (const wp of wordpressPosts) {
      const slug = String((wp as any)?.slug || '').toLowerCase();
      if (slug && !seenSlugs.has(slug)) {
        merged.push(wp);
      }
    }

    // Sort by createdAt/date desc so newest stories appear first
    merged.sort((a: any, b: any) => {
      const da = new Date(a?.createdAt || a?.date || 0).getTime();
      const db = new Date(b?.createdAt || b?.date || 0).getTime();
      return db - da;
    });

    return merged;
  }, [postsData, wpPostsData, isCommunityContent]);

  // Validate and update currentIndex when posts data changes; align index by slug if present
  useEffect(() => {
    if (!Array.isArray(posts) || posts.length === 0) {
      return;
    }

    // If we have a slug in the route, align the index to that post in the merged list
    if (routeSlug) {
      const bySlug = posts.findIndex((p: any) => String(p.slug || '') === String(routeSlug));
      if (bySlug >= 0 && bySlug !== currentIndex) {
        setCurrentIndex(bySlug);
        try {
          sessionStorage.setItem('selectedStoryIndex', String(bySlug));
        } catch {}
      }
    }

    // Ensure currentIndex is within bounds of the merged posts list
    if (currentIndex >= posts.length) {
      setCurrentIndex(0);
      try {
        sessionStorage.setItem('selectedStoryIndex', '0');
      } catch {}
    } else {
      try {
        sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
      } catch {}
    }

    const current = posts[currentIndex];
    if (current) {
      const newSlug = routeSlug || (current.slug || `post-${current.id}`);
      setAutoSaveSlug(newSlug);
    }
  }, [currentIndex, posts, routeSlug]);

  useEffect(() => {
    // Sync theme definition overrides from server to ensure global labels/icons are up to date
    (async () => {
      try {
        await syncThemeDefinitionOverridesFromServer();
      } catch {}
    })();
  }, []);

  // Read tracking: compute current post id/link and gate by time-on-page and scroll depth.
  const currentPostId = useMemo(() => {
    try {
      const post = posts?.[currentIndex] as any;
      if (!post) return undefined;
      const meta = post.metadata || {};
      const wordpressId = typeof meta.wordpressId === 'number' ? meta.wordpressId : undefined;
      return (wordpressId && wordpressId > 0 ? wordpressId : post.id) as number | undefined;
    } catch {
      return undefined;
    }
  }, [posts, currentIndex]);

  const currentPostLink = useMemo(() => {
    try {
      const post = posts?.[currentIndex] as any;
      const meta = post?.metadata || {};
      return (meta.wordpressLink || meta.link) as string | undefined;
    } catch {
      return undefined;
    }
  }, [posts, currentIndex]);

  // Reader analytics effects (WordPress pixel + finish_read interaction + active time)
  useReaderAnalytics({
    currentPostId,
    currentPostLink,
    readingProgress,
    posts,
    currentIndex,
  });

  // Persist reading progress locally and (if authenticated) to the server.
  useReaderProgressPersistence({
    readingProgress,
    routeSlug,
    autoSaveSlug,
    posts,
    currentIndex,
    isAuthenticated,
  });

  // Stabilise index and set up canonical URL synchronisation before any early returns
  const validCurrentIndex = useMemo(
    () => Math.max(0, Math.min(currentIndex, posts.length - 1)),
    [currentIndex, posts.length]
  );

  // Determine current slug and fetch full post content by slug (prefer full content for the active story)
  const currentSlugToUse = routeSlug || (posts[validCurrentIndex]?.slug as any);
  const { data: currentPostFull, isFetching: isFetchingPost } = useQuery<Post | null>({
    queryKey: ['posts', 'reader', 'post', currentSlugToUse || ''],
    queryFn: async () => {
      if (!currentSlugToUse) return null as any;
      try {
        return await getJson<Post>(`/api/posts/slug/${encodeURIComponent(String(currentSlugToUse))}`);
      } catch (err) {
        try { logReaderError('reader.post.fetchError', 'Failed to fetch post by slug', { slug: String(currentSlugToUse) }); } catch {}
        return null as any;
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(currentSlugToUse),
  });

  // Let's make sure we have posts data and current post before rendering
  // Keep previous story content visible while fetching; only return a loader if no data yet
  const hasAnyPosts = Array.isArray(posts) && posts.length > 0;
  const initialLoading = (isLoadingSupabase || isLoadingWordpress) && !hasAnyPosts;

  if (initialLoading) {
    // Show a lightweight route-level loader on first open
    return <RouteLoader label="Loading story" minHeight="60vh" />;
  }

  const listError = (supabaseError as Error | null) || (wordpressError as Error | null);

  if (!routeSlug && !hasAnyPosts && listError) {
    return (
      <SimplifiedErrorPage
        statusCode={500}
        title="Stories Unavailable"
        message={listError instanceof Error ? listError.message : 'Stories are temporarily unavailable.'}
        actionText="Back to Home"
        actionLink="/"
      />
    );
  }

  if (!routeSlug && !hasAnyPosts && !initialLoading && !listError) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="No Stories Yet"
        message="No stories are available to read yet. Please check back soon."
        actionText="Back to Home"
        actionLink="/"
      />
    );
  }

  // Get current post: prefer fully-fetched content
  const currentPost = (currentPostFull as any) || posts[validCurrentIndex];

  if (!currentPost && routeSlug) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="Story Not Found"
        message="The requested story could not be found."
        actionText="Browse Stories"
        actionLink="/index"
      />
    );
  }

  // SEO values for this story
  const stripHtml = (s: string): string => (s ? s.replace(/<\/?[^>]+(>|$)/g, '').trim() : '');
  const titleText = stripHtml(getRenderedText(currentPost.title) || 'Story');
  const rawContent = getRenderedText(currentPost.content) || '';
  const contentHtml = sanitizeHtmlContent(rawContent);
  const isContentReady = contentHtml.trim().length > 0;
  const descriptionText = getExcerpt(rawContent, 160);
  const canonicalPath = routeSlug ? `/reader/${encodeURIComponent(routeSlug)}` : '/reader';
  const published = (currentPost as any).createdAt || (currentPost as any).date || new Date().toISOString();
  const plainText = stripHtml(rawContent);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const keywords = detectThemes(rawContent);
  const ogImageFromContent = (() => {
    try {
      const html = getRenderedText(currentPost.content) || '';
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match) {
        const url = match[1];
        if (/^https?:\/\//i.test(url) || url.startsWith('/')) return url;
      }
      return undefined;
    } catch {
      return undefined;
    }
  })();

  // Story theme icon override (check metadata for themeIcon)
  const postThemeIcon = (currentPost as any)?.metadata?.themeIcon;

  // If post doesn't exist, show error
  if (!currentPost) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="Story Not Found"
        message="The requested story could not be found."
        actionText="Browse Stories"
        actionLink="/reader"
      />
    );
  }

  // Apply theme detection to current post
  const detectedThemes = detectThemes(getRenderedText(currentPost.content) || '');

  // Navigation helpers that integrate the horror overlay trigger.
  const goToRandomStory = () => {
    if (posts && posts.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * posts.length);
      } while (randomIndex === currentIndex);

      triggerRapidNavigation();
      setCurrentIndex(randomIndex);
      try {
        const nextSlug = String(posts[randomIndex]?.slug ?? posts[randomIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      // Do not force scroll position; let the browser preserve current position.
    }
  };
  
  const goToPreviousStory = () => {
    if (posts && posts.length > 1 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      triggerRapidNavigation();
      setCurrentIndex(newIndex);
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      // Do not force scroll position; let the browser preserve current position.
    }
  };
  
  const goToNextStory = () => {
    if (posts && posts.length > 1 && currentIndex < posts.length - 1) {
      const newIndex = currentIndex + 1;
      triggerRapidNavigation();
      setCurrentIndex(newIndex);
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      // Do not force scroll position; let the browser preserve current position.
    }
  };
  
  const isFirstStory = currentIndex === 0;
  const isLastStory = currentIndex === posts.length - 1;

  return (
    <div
      className="relative bg-background reader-page overflow-x-hidden overflow-y-visible pt-0 pb-0 flex flex-col"
      data-reader-page="true" 
      data-distraction-free={isUIHidden ? "true" : "false"}
      data-debug={debugEnabled ? "1" : "0"}
    >
      <SEO 
        title={titleText}
        description={descriptionText}
        canonical={canonicalPath}
        image={ogImageFromContent}
        type="article"
        published={published}
        modified={published}
        keywords={keywords}
        readingTime={readingMinutes}
        wordCount={wordCount}
      />

      {/* Reader tooltip for distraction-free mode instructions */}
      <ReaderTooltip show={showTooltip} />

      {/* CSS for distraction-free mode transitions */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Distraction-free fade: dim UI chrome while preserving layout */
        .ui-fade-element {
          transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }
        .ui-hidden {
          opacity: 0.35;
          pointer-events: auto;
        }
        .story-content {
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        
        /* Distraction-free mode: keep navbar visible but subtle */
        .reader-page[data-distraction-free="true"] header.main-header {
          opacity: 0.55;
          visibility: visible;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
          transform: none;
          will-change: opacity;
        }
        
        /* Tiny indicator for mobile when in distraction-free mode */
        .reader-page[data-distraction-free="true"]::after {
          content: "↑ Tap to exit";
          position: fixed;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: hsl(var(--background));
          color: hsl(var(--muted-foreground));
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
          opacity: 0.6;
          pointer-events: none;
          z-index: 30;
          border: 1px solid hsl(var(--border));
          box-shadow: 0 1px 1px rgba(0,0,0,0.05);
        }
        
        /* Ensure better mobile compatibility */
        @media (max-width: 640px) {
          .reader-page[data-distraction-free="true"]::after {
            font-size: 0.6rem;
            padding: 1px 5px;
            top: 3px;
          }
        }
        
        /* Set default cursor for everything */
        .reader-page {
          cursor: default;
        }
        
        /* Set pointer cursor only for interactive elements */
        .reader-page button,
        .reader-page a,
        .reader-page [role="button"],
        .reader-page input[type="button"],
        .reader-page input[type="submit"] {
          cursor: pointer;
        }
        
        /* Make interactive elements inside story content use pointer cursor */
        .reader-page .story-content button,
        .reader-page .story-content a,
        .reader-page .story-content [role="button"] {
          cursor: pointer;
        }
        
        .main-header {
          transition: opacity 0.4s ease, visibility 0.4s ease;
          will-change: opacity, visibility;
        }
      `,
        }}
      />
      {debugEnabled ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          /* Reader debug outlines for hit-testing and bounds */
          .reader-page[data-debug="1"] .debug-outline { outline: 1px dashed rgba(255,0,0,.6); outline-offset: 0; }
          .reader-page[data-debug="1"] .debug-outline-controls { outline-color: #d97706; } /* amber */
          .reader-page[data-debug="1"] .debug-outline-meta { outline-color: #10b981; } /* emerald */
          .reader-page[data-debug="1"] .debug-outline-nav { outline-color: #3b82f6; } /* blue */
          .reader-page[data-debug="1"] .debug-outline-pager { outline-color: #a855f7; } /* purple */
          .reader-page[data-debug="1"] .debug-outline-share { outline-color: #ef4444; } /* red */
          .reader-page[data-debug="1"] .debug-outline-content { outline-color: #22d3ee; } /* cyan */
        `,
          }}
        />
      ) : null}

      {/* Horror overlay rendered via portal to ensure visibility without scrolling; modal and text unchanged */}
      <ReaderHorrorOverlayPortal
        visible={showHorrorMessage}
        message={horrorMessageText}
        onClose={handleOverlayClose}
      />

      <div className={`pt-0 pb-0 bg-background mt-0 w-full overflow-visible ${isUIHidden ? 'distraction-free-active' : ''}`}>
        {/* Font controls/TOC spacing below header and progress bar */}
        <div
          ref={controlsRowRef}
          className={`flex justify-between items-center px-2 md:px-8 lg:px-12 z-10 mt-0.5 py-0.5 m-0 w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-controls`}
          style={{ minHeight: '40px' }}
        >
          {/* Font controls using the standard Button component */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 12}
                    className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 transition-all duration-300 hover:scale-105"
                    aria-label="Decrease font size"
                    title="Decrease font size"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    A-
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" sideOffset={6}>
                  Decrease text size
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 40}
                    className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 transition-all duration-300 hover:scale-105"
                    aria-label="Increase font size"
                    title="Increase font size"
                  >
                    A+
                    <Plus className="h-4 w-4 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="center" sideOffset={6}>
                  Increase text size
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Font Dialog with controlled open state */}
            <Dialog
              open={fontDialogOpen}
              onOpenChange={(open) => {
                if (debugEnabled) {
                  try {
                    console.log('[Reader.debug] FontDialog openChange:', open);
                  } catch {}
                }
                setFontDialogOpen(open);
                try { setUIHidden(false); } catch {}
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 ml-2"
                >
                  <span className="text-xs uppercase">FONT</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-full">
                <DialogHeader>
                  <DialogTitle>Font Settings</DialogTitle>
                  <DialogDescription>
                    Change the font style for your reading experience.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Font Style</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(availableFonts).map(([key, info]) => (
                        <Button
                          key={key}
                          variant={fontFamily === key ? "default" : "outline"}
                          className="justify-start h-auto py-3"
                          onClick={() => {
                            updateFontFamily(key as FontFamilyKey);
                            setFontDialogOpen(false);
                          }}
                        >
                          <div className="flex flex-col items-start">
                            <span style={{ fontFamily: info.family }}>{info.name}</span>
                            <span className="text-xs text-muted-foreground">{info.type}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Integrated BookmarkButton in top controls */}
          <BookmarkButton 
            postId={currentPost.id} 
            variant="reader"
            showText={false}
            className="h-8 w-8 rounded-full bg-background hover:bg-background/80 mx-2 cursor-pointer"
          />

          {/* Contents Dialog with controlled open state - non-fullscreen with close button */}
          <Dialog
            open={contentsDialogOpen}
            onOpenChange={(open) => {
              if (debugEnabled) {
                try {
                  console.log('[Reader.debug] TOC Dialog openChange:', open);
                } catch {}
              }
              setContentsDialogOpen(open);
              try { setUIHidden(false); } catch {}
            }}
          >
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 bg-primary hover:bg-primary/90 text-white flex items-center gap-1.5 rounded-md w-fit"
                noOutline
                aria-label="Table of Contents"
                title="Table of Contents"
              >
                <BookText className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline text-xs font-semibold tracking-wide">TOC</span>
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-md" 
              aria-labelledby="toc-dialog-title" 
              aria-describedby="toc-dialog-description"
            >
              <div className="flex items-center">
                <DialogTitle id="toc-dialog-title">Table of Contents</DialogTitle>
              </div>
              <DialogDescription id="toc-dialog-description">Browse all available stories</DialogDescription>
              <TableOfContents 
                currentPostId={currentPost.id}
                posts={posts.map((p: any) => ({
                  id: p.id,
                  title: getRenderedText(p.title) || 'Untitled',
                  slug: (p.slug || `post-${p.id}`) as string,
                  date: (p.date || p.createdAt || new Date().toISOString()) as string
                }))}
                onSelect={(selected) => {
                  try {
                    // Prefer match by slug when available
                    const foundIndex = posts.findIndex((p: any) =>
                      (selected.slug && p.slug === selected.slug) || p.id === selected.id
                    );
                    if (foundIndex >= 0) {
                      setCurrentIndex(foundIndex);
                      // Keep URL in sync with selected story to fix TOC routing
                      setLocation(`/reader/${encodeURIComponent(String(posts[foundIndex].slug || posts[foundIndex].id))}`);
                      // Scroll to top for a clean transition
                      window.scrollTo({ top: 0, behavior: 'auto' });
                    }
                  } catch (err) {
                    console.error('[Reader] TOC onSelect error:', err);
                    try { logReaderError('reader.toc.onSelect', err); } catch {}
                  } finally {
                    setContentsDialogOpen(false);
                  }
                }}
                onClose={() => setContentsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Full-bleed separator under controls row (thin, end-to-end) */}
        <div
          className="border-b border-border/20"
          style={{ 
            width: '100%', 
            marginLeft: '0', 
            marginRight: '0', 
            position: 'relative', 
            left: 0, 
            transform: 'none',
            marginTop: '4px'
          }}
        />
      
        <article
          key={currentPost.id}
          className="prose dark:prose-invert px-4 md:px-6 pt-0 w-full max-w-3xl mx-auto"
        >
          {/* Full-bleed separator above story title (thin, end-to-end) */}
          <div
            className="border-b border-border/20"
            style={{ 
              width: '100%', 
              marginLeft: '0', 
              marginRight: '0', 
              position: 'relative', 
              left: 0, 
              transform: 'none' 
            }}
          />

          <div className="flex flex-col items-center mb-2 mt-0">
            <div className="relative flex flex-col items-center">
              {isCommunityContent && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-primary/10 text-foreground border-primary/20"
                  >
                    Community Story
                  </Badge>
                  {(isAdmin || (isCommunityContent && user?.id === (currentPost as any)?.authorId)) && isCommunityContent && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Delete</span>
                    </Button>
                  )}
                </div>
              )}
              <h1
                className="text-4xl md:text-5xl font-bold text-center mb-1 tracking-tight leading-tight"
                style={{ minHeight: '48px' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(getRenderedText(currentPost.title) || 'Story') }}
              />
            </div>
            
            {/* Story Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center text-xl">
                    <Trash className="h-5 w-5 mr-2 text-red-500" />
                    {isAdmin && user?.id !== (currentPost as any)?.authorId ? 
                      "Delete Community Story" : 
                      "Delete Your Story"}
                  </DialogTitle>
                  <DialogDescription className="pt-2 text-sm">
                    {isAdmin && user?.id !== (currentPost as any)?.authorId ? 
                      "As an admin, you are about to delete a user-submitted community story. This action cannot be undone." : 
                      "You are about to delete your community story. This action cannot be undone."}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-between border p-3 rounded-md bg-muted/50 mt-2">
                  <div className="font-medium truncate pr-2">
                    {getRenderedText(currentPost.title) || 'Story'}
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Community
                  </Badge>
                </div>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteMutation.mutate(currentPost.id)}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Story'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="flex flex-col items-center gap-1">
              <div
                ref={metaRowRef}
                className={`flex flex-nowrap items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground backdrop-blur-sm bg-background/30 px-3 sm:px-4 py-1 rounded-full shadow-sm border border-border/60 ui-fade-element overflow-x-auto whitespace-nowrap ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-meta`}
                style={{ minHeight: '32px' }}
              >
                {/* Story theme category with icon (index as source of truth) */}
                {(() => {
                  const md: any = (currentPost as any)?.metadata || {};

                  // Determine primary theme: override -> metadata -> shared detection from title/content
                  const primaryThemeRaw =
                    overrideThemeCategory ||
                    md.themeCategory ||
                    determineThemeCategory(
                      titleText || 'Story',
                      plainText || ''
                    );

                  // Story-specific override mapping by slug/title
                  const override = getStoryThemeOverride((currentPost as any)?.slug as any, titleText as any);

                  // Resolve shared theme key from label or raw category when no override
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

                  // Icon slug priority: story override -> editor override -> metadata -> global override -> shared definition -> ghost
                  const chosenIconSlug =
                    override?.icon ||
                    overrideThemeIcon ||
                    md.themeIcon ||
                    defOverride?.icon ||
                    categoriesMap[derivedKey]?.icon ||
                    (SHARED_THEME_CATEGORIES as any)[derivedKey]?.icon ||
                    'ghost';

                  // Lucide icon mapping with broader coverage and theme-key fallbacks
                  const ThemeIcon = (() => {
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
                    }
                    // Fallback by theme key for diversity when slug is unknown
                    switch (themeKey) {
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

                  // Human-friendly label with specific "Horror" suffixes; prefer override label
                  const baseLabel =
                    override?.label ||
                    defOverride?.label ||
                    categoriesMap[derivedKey]?.label ||
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
                    return baseLabel;
                  })();

                  // Tinted badge styles per theme
                  const badgeTint = getBadgeTint(themeKey);

                  return (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border whitespace-nowrap ${badgeTint}`}>
                      {String(chosenIconSlug).includes(':')
                        ? (<Icon icon={String(chosenIconSlug)} className="h-4 w-4" />)
                        : (<ThemeIcon className="h-4 w-4" />)
                      }
                      <span className="text-xs font-medium whitespace-nowrap">{prettyLabel}</span>
                    </div>
                  );
                })()}
                
                <span className="text-muted-foreground">•</span>
                
                {/* Date indicator */}
                <span className="text-xs px-2 py-1 bg-muted/80 border border-border/50 rounded-md whitespace-nowrap">
                  {(() => {
                    const rawDate = (currentPost as any)?.date || (currentPost as any)?.createdAt || (currentPost as any)?.created_at;
                    if (!rawDate) return 'No date';
                    const d = new Date(rawDate);
                    if (Number.isNaN(d.getTime())) return 'No date';
                    return format(d, 'MMM d, yyyy');
                  })()}
                </span>
                
                {/* Estimated reading time */}
                <span className="text-xs px-2 py-1 bg-accent/50 rounded-md whitespace-nowrap">
                  {readingMinutes} min read
                </span>

                {/* Admin: inline edit theme */}
                {isAdmin && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        try {
                          const currentCat =
                            (currentPost as any)?.themeCategory ||
                            (currentPost as any)?.metadata?.themeCategory ||
                            '';
                          const auto = determineThemeCategory(
                            titleText || 'Story',
                            plainText || ''
                          );
                          const initCat = String(currentCat || auto || 'HORROR');
                          setSelectedThemeCat(initCat);
                          const metaIcon = (currentPost as any)?.metadata?.themeIcon as string | undefined;
                          const defIcon =
                            SHARED_THEME_CATEGORIES[
                              initCat as keyof typeof SHARED_THEME_CATEGORIES
                            ]?.icon || 'ghost';
                          setSelectedThemeIcon(String(metaIcon || defIcon));
                          setThemeEditorOpen(true);
                        } catch {
                          setSelectedThemeCat('HORROR');
                          setSelectedThemeIcon('ghost');
                          setThemeEditorOpen(true);
                        }
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Edit theme</span>
                    </Button>
                  </>
                )}
              </div>

              {/* Admin Theme Editor Dialog */}
              {isAdmin && (
                <Dialog
                  open={themeEditorOpen}
                  onOpenChange={(open) => {
                    if (debugEnabled) {
                      try {
                        console.log('[Reader.debug] ThemeEditor dialog openChange:', open);
                      } catch {}
                    }
                    setThemeEditorOpen(open);
                  }}
                >
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Story Theme</DialogTitle>
                      <DialogDescription>
                        Choose the theme category and icon shown on this story.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <span id="theme-category-label" className="text-sm font-medium">Theme category</span>
                        <Select
                          value={selectedThemeCat}
                          onValueChange={(v) => {
                            setSelectedThemeCat(v);
                            // Update default icon when category changes
                            const def =
                              SHARED_THEME_CATEGORIES[
                                v as keyof typeof SHARED_THEME_CATEGORIES
                              ]?.icon || 'ghost';
                            setSelectedThemeIcon(def);
                          }}
                        >
                          <SelectTrigger className="w-full" aria-labelledby="theme-category-label">
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {(categoriesList.length
                              ? categoriesList.map((item) => {
                                  const key = String(item.key);
                                  const label = String(item.label);
                                  const base = label;
                                  const l = String(base).toLowerCase();
                                  const refined = (() => {
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
                                    return base;
                                  })();
                                  return (
                                    <SelectItem key={key} value={key}>
                                      {refined}
                                    </SelectItem>
                                  );
                                })
                              : Object.entries(SHARED_THEME_CATEGORIES as Record<string, { label: string; icon: string }>).map(([key, info]) => {
                                  const base = info.label;
                                  const l = String(base).toLowerCase();
                                  const refined = (() => {
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
                                    return base;
                                  })();
                                  return (
                                    <SelectItem key={key} value={key}>
                                      {refined}
                                    </SelectItem>
                                  );
                                })
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme-icon" className="text-sm font-medium">Icon (slug)</Label>
                        <Input
                          id="theme-icon"
                          value={selectedThemeIcon}
                          onChange={(e) => setSelectedThemeIcon(e.target.value)}
                          placeholder="e.g., ghost, skull, brain"
                        />
                        <p className="text-xs text-muted-foreground">
                          Common options: ghost, skull, brain, bug, cpu, footprints, cloud-rain, castle
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          try {
                            const auto = determineThemeCategory(
                              titleText || 'Story',
                              plainText || ''
                            );
                            const autoCat = String(auto || 'HORROR');
                            setSelectedThemeCat(autoCat);
                            const defIcon =
                              SHARED_THEME_CATEGORIES[
                                autoCat as keyof typeof SHARED_THEME_CATEGORIES
                              ]?.icon || 'ghost';
                            setSelectedThemeIcon(defIcon);
                          } catch {
                            setSelectedThemeCat('HORROR');
                            setSelectedThemeIcon('ghost');
                          }
                        }}
                      >
                        Auto-detect
                      </Button>
                      <Button
                        onClick={async () => {
                          try {
                            setSavingTheme(true);
                            const csrfToken = document.cookie.replace(
                              /(?:(?:^|.*;\s*)XSRF-TOKEN\s*=\s*([^;]*).*$)|^.*$/,
                              "$1"
                            );
                            const res = await fetch(`/api/posts/${currentPost.id}/theme`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': csrfToken
                              },
                              credentials: 'include',
                              body: JSON.stringify({
                                themeCategory: selectedThemeCat,
                                themeIcon: selectedThemeIcon,
                                // snake_case for older compatibility
                                theme_category: selectedThemeCat,
                                icon: selectedThemeIcon
                              })
                            });
                            if (!res.ok) {
                              const data = await res.json().catch(() => null);
                              throw new Error(data?.error || 'Failed to update theme');
                            }
                            setOverrideThemeCategory(selectedThemeCat);
                            setOverrideThemeIcon(selectedThemeIcon);
                            setThemeEditorOpen(false);
                            toast({
                              title: 'Theme updated',
                              description: 'Theme and icon were updated for this story.'
                            });
                          } catch (err: any) {
                            toast({
                              title: 'Update failed',
                              description: err?.message || 'Could not update theme. Make sure this story exists in the database.',
                              variant: 'destructive'
                            });
                          } finally {
                            setSavingTheme(false);
                          }
                        }}
                        disabled={savingTheme}
                      >
                        {savingTheme ? 'Saving…' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {/* Navigation controls under time-to-read */}
              <div
                ref={navRowRef}
                className={`flex justify-center items-center gap-4 py-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-nav`}
              >
                {/* Previous */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousStory}
                  disabled={posts.length <= 1 || isFirstStory}
                  className="h-10 w-28 rounded-md bg-background/90 border border-border/50 text-foreground hover:bg-muted/40 hover:text-foreground active:bg-muted/60 active:scale-[0.99] transition-colors transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span className="font-medium">Previous</span>
                </Button>

                {/* Random */}
                <TooltipProvider>
                  <Tooltip open={randomTipOpen} onOpenChange={setRandomTipOpen}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setRandomTipOpen(true);
                          window.setTimeout(() => setRandomTipOpen(false), 800);
                          goToRandomStory();
                        }}
                        disabled={posts.length <= 1}
                        aria-label="Random story"
                        title="Random"
                        className="h-10 w-10 rounded-full bg-background/90 border border-border/50 text-foreground hover:bg-muted/40 hover:text-foreground active:bg-muted/60 active:scale-[0.99] transition-colors transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">Random</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Next */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextStory}
                  disabled={posts.length <= 1 || isLastStory}
                  className="h-10 w-28 rounded-md bg-background/90 border border-border/50 text-foreground hover:bg-muted/40 hover:text-foreground active:bg-muted/60 active:scale-[0.99] transition-colors transition-transform duration-150 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <span className="font-medium">Next</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="story-container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
            <div 
              className="story-content text-justify"
              ref={contentRef}
              {...(isContentReady ? { dangerouslySetInnerHTML: { __html: contentHtml } } : {})}
            >
              {!isContentReady ? (
                isFetchingPost ? (
                  <div aria-busy="true" aria-live="polite" className="text-sm text-muted-foreground py-2">
                    Loading story…
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-2">Content unavailable.</div>
                )
              ) : null}
            </div>
            {/* Inline comment dialog (selection-based) */}
            <CommentDialog />
          </div>
          
          {/* Simple pagination at bottom of story content - extremely compact */}
          <div
            ref={pagerRowRef}
            className={`flex items-center justify-center gap-2 mb-6 mt-4 w-full text-center ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-pager`}
            style={{ minHeight: '64px' }}
          >
            <div className="relative overflow-visible flex items-center justify-center gap-1 bg-background/90 backdrop-blur-md border border-transparent rounded-full h-16 px-1.5 shadow-sm">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{ border: '1px solid', borderColor: 'hsl(var(--border) / 0.4)', transform: 'translateY(-1px)' }}
              />
              <div className="flex items-center gap-1 translate-y-2">
                {/* Previous story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousStory}
                  className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                    isFirstStory 
                      ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                      : 'text-foreground hover:bg-primary/60 hover:text-foreground dark:text-foreground dark:hover:bg-primary/35'
                  } focus-visible:ring-2 focus-visible:ring-primary/70 hover:ring-2 hover:ring-primary/70 active:bg-primary/60`}
                  aria-label="Previous story"
                  disabled={posts.length <= 1 || isFirstStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Previous Story
                  </span>
                </Button>
                
                {/* Story counter */}
                <div className="px-1 h-5 flex items-center -translate-y-2.5 text-[10px] leading-none text-muted-foreground font-medium">
                  {currentIndex + 1} of {posts.length}
                </div>
                
                {/* Next story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextStory}
                  className={`h-5 w-5 rounded-full group relative transition-all duration-200 ${
                    isLastStory 
                      ? 'opacity-30 cursor-not-allowed text-muted-foreground' 
                      : 'text-foreground hover:bg-primary/60 hover:text-foreground dark:text-foreground dark:hover:bg-primary/35'
                  } focus-visible:ring-2 focus-visible:ring-primary/70 hover:ring-2 hover:ring-primary/70 active:bg-primary/60`}
                  aria-label="Next story"
                  disabled={posts.length <= 1 || isLastStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Next Story
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3">
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Centered Like/Dislike buttons */}
              <div className="flex justify-center w-full">
                <LikeDislike
                  postId={currentPost.id}
                  slug={currentPost.slug}
                  source="wp"
                  variant="reader"
                />
              </div>

              <div
                ref={shareRowRef}
                className={`flex flex-col items-center gap-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-share`}
              >
                <p className="text-sm text-muted-foreground font-medium">
                  ✨ Loved the story? Share it or follow for more! ✨
                </p>
                <div className="flex items-center gap-3">
                  {/* Native Share Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: getRenderedText(currentPost.title) || 'Story',
                          url: window.location.href
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        toast({
                          title: "Link Copied",
                          description: "Story link copied to clipboard!"
                        });
                      }
                    }}
                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>

                  {/* Social Icons */}
                  <div className="flex gap-3">
                    <Suspense fallback={null}>
                      <ReaderSocialIcons />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment section */}
          <div className="mt-8">
            <SimpleCommentSection postId={currentPost.id} />
          </div>

          {/* Social sharing and support section */}
          <div className="social-support-section mt-4 pt-2">
            {/* Support writing card with auto-wired authorId */}
            <SupportWritingCard authorId={resolveAuthorId(currentPost)} />
          </div>
        </article>
      </div>
    </div>
  );
}