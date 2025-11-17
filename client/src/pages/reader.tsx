import { useState, useEffect, useRef, useMemo } from "react";
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
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily, FontFamilyKey } from "@/hooks/use-font-family";
import { detectThemes, THEME_CATEGORIES, getExcerpt } from "@/lib/content-analysis";
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import ApiLoader from "@/components/api-loader";
import RouteLoader from "@/components/ui/RouteLoader";
import CreepyTextGlitch from "@/components/errors/CreepyTextGlitch";
import SimplifiedErrorPage from "@/components/errors/SimplifiedErrorPage";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";


import { SupportWritingCard } from "@/components/SupportWritingCard";
import { resolveAuthorId } from "@/lib/reader-navigation";

import SEO from "@/components/SEO";
import { fetchWordPressPosts, fetchWordPressPostBySlug } from "@/lib/wordpress-api";
import type { WordPressPost } from "@/lib/wordpress-api";
import { sanitizeHtml } from "@/lib/sanitize";
import { trackWordPressRead } from "@/lib/wp-reads";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { trackInteraction } from "@/lib/metrics";
import { fetchReactionsBatch, type ReactionTotals } from "@/api/reactions";


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

import SimpleCommentSection from "@/components/blog/SimpleCommentSection";

// Lazy-mount comment section when near viewport to reduce initial load cost
function LazyCommentSection({ postId }: { postId: number }): JSX.Element {
  const [visible, setVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              // Disconnect once visible to avoid re-observing
              try { observer?.disconnect(); } catch {}
              break;
            }
          }
        },
        { root: null, rootMargin: '800px', threshold: 0.01 }
      );
      if (anchorRef.current) observer.observe(anchorRef.current);
    } catch {}
    return () => {
      try { observer?.disconnect(); } catch {}
    };
  }, []);

  return <div ref={anchorRef}>{visible ? <SimpleCommentSection postId={postId} /> : null}</div>;
}

// Native HTML sanitization function (now powered by DOMPurify with extra hardening)
  const sanitizeHtmlContent = (html: string): string => {
    try {
      return sanitizeHtml(html);
    } catch (error) {
      console.error('[Reader] Error sanitizing HTML:', error);
      return html;
    }
  };

  // Memoized helpers to avoid recomputing derived values for identical content
  const __excerptMemo = new Map<string, string>();
  const __detectThemesMemo = new Map<string, ReturnType<typeof detectThemes>>();

  const getExcerptMemo = (html: string, maxLength: number = 160): string => {
    try {
      const key = `${maxLength}::${html}`;
      const cached = __excerptMemo.get(key);
      if (typeof cached === 'string') return cached;
      const result = getExcerpt(html, maxLength);
      __excerptMemo.set(key, result);
      if (__excerptMemo.size > 256) {
        const firstKey = __excerptMemo.keys().next().value as string | undefined;
        if (typeof firstKey === 'string') __excerptMemo.delete(firstKey);
      }
      return result;
    } catch {
      return getExcerpt(html, maxLength);
    }
  };

  const detectThemesMemo = (content: string) => {
    try {
      const cached = __detectThemesMemo.get(content);
      if (cached) return cached;
      const result = detectThemes(content);
      __detectThemesMemo.set(content, result);
      if (__detectThemesMemo.size > 256) {
        const firstKey = __detectThemesMemo.keys().next().value as string | undefined;
        if (typeof firstKey === 'string') __detectThemesMemo.delete(firstKey);
      }
      return result;
    } catch {
      return detectThemes(content);
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
  
  const { CommentDialog, isSelecting } = useInlineCommenting({
    enabled: true,
    onSubmitComment: async (text, selection, range) => {
      try {
        const postId = Number((posts?.[currentIndex] || currentPost)?.id || 0);
        if (!Number.isFinite(postId) || postId <= 0) return;
        await apiJson('POST', `/api/posts/${postId}/comments`, {
          content: text,
          selectionText: selection,
          anchorParagraphIndex: Number(range.paragraphIndex ?? -1) >= 0 ? Number(range.paragraphIndex) : undefined,
          selectionStart: Number.isFinite(range.start) ? Number(range.start) : undefined,
          selectionEnd: Number.isFinite(range.end) ? Number(range.end) : undefined,
        });
        toast({ title: 'Comment added', description: 'Your inline comment has been submitted.' });
      } catch (e: any) {
        toast({ title: 'Failed to add comment', description: e?.message || 'Please try again.', variant: 'destructive' });
      }
    },
    contentSelector: '.story-content'
  });
  
  const logReaderError = (id: string, message: any, extra?: any) => {
    try {
      const key = `reader_error_logged_${id}`;
      // Gate each error id to once per session to avoid noisy logs
      const already = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (already) return;
      try { sessionStorage.setItem(key, '1'); } catch {}
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          message: typeof message === 'string' ? message : (message && (message.message || String(message))) || 'Unknown',
          extra
        })
      }).catch(() => {});
    } catch {}
  };
  
  // Add authentication hook to check user role for admin actions
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.isAdmin === true;
  
  // Theme is now managed by the useTheme hook
  const { theme, toggleTheme } = useTheme();
  
  // Font size and family adjustments
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const { fontFamily, availableFonts, updateFontFamily } = useFontFamily();
  const { categoriesMap, categoriesList } = useThemeCategories();
  
  // Night mode functionality has been completely removed
  
  // One-click distraction-free mode - toggle UI visibility with click
  const { isUIHidden, toggleUI, showTooltip, setUIHidden } = useReaderUIToggle();

  // Debug: wrap toggle to trace invocations
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

  // Reset UI hidden state on theme changes to avoid unpredictable layout shifts
  useEffect(() => {
    try { setUIHidden(false); } catch {}
  }, [theme, setUIHidden]);

  // Reading progress state - moved to top level with other state hooks
  const [readingProgress, setReadingProgress] = useState(0);
  // Smooth, GPU-accelerated animated progress value
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressCurrentRef = useRef(0);
  const progressTargetRef = useRef(0);
  const progressRAFRef = useRef<number | null>(null);
  
  // Will initialize this after data is loaded
  const [autoSaveSlug, setAutoSaveSlug] = useState<string>("");

  // Fixed constants for better text readability (replacing auto-contrast)
  const DARK_TEXT_COLOR = 'rgba(255, 255, 255, 0.95)';
  const LIGHT_TEXT_COLOR = 'rgba(0, 0, 0, 0.95)';
  
  // State for dialog controls
  const [fontDialogOpen, setFontDialogOpen] = useState(false);
  const [contentsDialogOpen, setContentsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [randomTipOpen, setRandomTipOpen] = useState(false);
  

  /* isAnyDialogOpen is declared below, after themeEditorOpen is defined */

  // Debug instrumentation toggle: enable when DEV or localStorage('reader_debug') === '1'
  const [debugEnabled, setDebugEnabled] = useState<boolean>(() => {
    try {
      const flag = localStorage.getItem('reader_debug');
      return flag === '1' || import.meta.env?.DEV === true;
    } catch {
      return import.meta.env?.DEV === true;
    }
  });

  // Refs for bounds and style logging
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

  // Derived: any dialog open (used to stabilize layout during overlays/dropdowns)
  const isAnyDialogOpen = fontDialogOpen || contentsDialogOpen || showDeleteDialog || themeEditorOpen;
  
  
  // Dialogs are controlled via state; avoid querying DOM for close buttons
  
  // Reading progress tracking with scroll-based calculation and rAF smoothing
  useEffect(() => {
    let ticking = false;
    let scrollRafId: number | null = null;

    const animate = () => {
      const target = progressTargetRef.current;
      const current = progressCurrentRef.current;
      // Use direction-aware smoothing: slower when decreasing (scrolling up), faster when increasing
      const factor = target < current ? 0.12 : 0.24;
      const next = current + (target - current) * factor;
      progressCurrentRef.current = next;
      setAnimatedProgress(next);
      if (Math.abs(target - next) > 0.08) {
        progressRAFRef.current = requestAnimationFrame(animate);
      } else {
        progressCurrentRef.current = target;
        setAnimatedProgress(target);
        progressRAFRef.current = null;
      }
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const progress = Math.min(100, Math.max(0, scrollPercent));
      setReadingProgress(progress);
      progressTargetRef.current = progress;
      if (!progressRAFRef.current) {
        progressRAFRef.current = requestAnimationFrame(animate);
      }
    };

    // Throttle scroll events for better performance
    const throttledHandleScroll = () => {
      if (!ticking) {
        scrollRafId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          scrollRafId = null;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      if (progressRAFRef.current) {
        cancelAnimationFrame(progressRAFRef.current);
        progressRAFRef.current = null;
      }
    };
  }, []);
  
  // Horror easter egg - track rapid navigation
  const [showHorrorMessage, setShowHorrorMessage] = useState(false);
  const [horrorMessageText, setHorrorMessageText] = useState("Are you avoiding something?");
  const skipCountRef = useRef(0);
  const lastNavigationTimeRef = useRef(Date.now());

  // Persist rapid navigation counters across remounts and restore overlay if active
  useEffect(() => {
    try {
      // Restore counters
      const savedSkip = parseInt(sessionStorage.getItem('reader_skip_count') || '0', 10);
      if (Number.isFinite(savedSkip)) {
        skipCountRef.current = savedSkip;
      }
      const savedLast = parseInt(sessionStorage.getItem('reader_last_nav_time') || '0', 10);
      if (Number.isFinite(savedLast) && savedLast > 0) {
        lastNavigationTimeRef.current = savedLast;
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      // Restore active overlay if still within expiry window
      const active = sessionStorage.getItem('reader_horror_active') === '1';
      const expiry = parseInt(sessionStorage.getItem('reader_horror_expiry_ts') || '0', 10);
      const msg = sessionStorage.getItem('reader_horror_message') || '';
      const now = Date.now();
      if (active && Number.isFinite(expiry) && expiry > now) {
        setHorrorMessageText(msg || "I SEE YOU SKIPPING!!!");
        setShowHorrorMessage(true);
        const remaining = expiry - now;
        setTimeout(() => {
          setShowHorrorMessage(false);
          try {
            sessionStorage.removeItem('reader_horror_active');
            sessionStorage.removeItem('reader_horror_message');
            sessionStorage.removeItem('reader_horror_expiry_ts');
          } catch {}
        }, remaining);
      } else {
        // Clean up stale overlay keys
        sessionStorage.removeItem('reader_horror_active');
        sessionStorage.removeItem('reader_horror_message');
        sessionStorage.removeItem('reader_horror_expiry_ts');
      }
    } catch {}
    // Overlay state restored; footer rendering handled globally
  }, []);

  
  
  // Create a ref for the content container to attach swipe events and copy protection
  const contentRef = useCopyProtection(true);
  // Removed positionRestoredRef as we no longer save reading position

  // Helper: determine if the event target is interactive (links, buttons, inputs, etc.)
  // Important: do not treat the container itself (role="button") as interactive,
  // so that tapping empty space still toggles distraction-free mode.
  const isInteractiveEventTarget = (e: any): boolean => {
    try {
      const t = (e && e.target) as HTMLElement | null;
      const current = (e && e.currentTarget) as HTMLElement | null;
      if (!t) return false;
      const interactiveSelector =
        'a, button, input, textarea, select, summary, label, [role="button"], [role="link"], [contenteditable="true"]';
      const closest = t.closest ? (t.closest(interactiveSelector) as HTMLElement | null) : null;
      if (!closest) return false;
      if (current && closest === current) return false;
      return true;
    } catch {
      return false;
    }
  };

  // Debounce tap/click toggles to avoid double-trigger on mobile (pointerup + click)
  const lastToggleAtRef = useRef(0);

  // Centralized gating for content toggle
  const shouldToggleContent = (e: any): boolean => {
    try {
      // Do not toggle when any dialog/overlay is open or inline comment is active
      if (fontDialogOpen || contentsDialogOpen || showDeleteDialog || showHorrorMessage || themeEditorOpen || isSelecting) {
        return false;
      }
      // Respect prevented events
      if (e && e.defaultPrevented) return false;
      // Ignore clicks originating from interactive descendants (links, buttons, inputs, etc.)
      if (isInteractiveEventTarget(e)) return false;
      // Ignore when there is active text selection
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (sel && sel.toString().trim().length > 0) return false;
      return true;
    } catch {
      return true;
    }
  };

  // Debug: toggle via localStorage key "reader_debug" (set to "1" to enable)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'reader_debug') {
        try {
          setDebugEnabled(e.newValue === '1' || import.meta.env?.DEV === true);
        } catch {}
      }
    };
    try {
      window.addEventListener('storage', onStorage);
    } catch {}
    return () => {
      try { window.removeEventListener('storage', onStorage); } catch {}
    };
  }, []);

  // Debug: global click tracer (capture phase)
  useEffect(() => {
    if (!debugEnabled) return undefined;
    const handler = (e: Event) => {
      try {
        const t = e.target as HTMLElement | null;
        const withinContent = !!(t && contentRef.current && contentRef.current.contains(t));
        const path = (e as any).composedPath ? (e as any).composedPath().map((n: any) => n?.nodeName || n?.tagName || n?.className || 'node').slice(0, 6) : undefined;
        console.log('[Reader.debug] click', {
          target: t?.tagName,
          class: t?.className,
          id: t?.id,
          withinContent,
          isUIHidden,
          fontDialogOpen,
          contentsDialogOpen,
          themeEditorOpen,
          path
        });
      } catch {}
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [debugEnabled, isUIHidden, fontDialogOpen, contentsDialogOpen, themeEditorOpen, contentRef]);

  // Debug: log bounds and key computed styles when modals open/close and on DF mode change
  useEffect(() => {
    if (!debugEnabled) return undefined;
    const logEl = (name: string, el: HTMLElement | null | undefined) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      console.log('[Reader.debug] bounds', name, {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        opacity: cs.opacity,
        zIndex: cs.zIndex,
        pointerEvents: cs.pointerEvents,
        bg: cs.backgroundColor,
        filter: cs.filter,
        backdropFilter: (cs as any).backdropFilter
      });
    };
    logEl('controlsRow', controlsRowRef.current || undefined);
    logEl('metaRow', metaRowRef.current || undefined);
    logEl('navRow', navRowRef.current || undefined);
    logEl('pagerRow', pagerRowRef.current || undefined);
    logEl('shareRow', shareRowRef.current || undefined);
    logEl('storyContent', contentRef.current || undefined);
    try {
      const b = document.body;
      if (b) {
        const cs = window.getComputedStyle(b);
        console.log('[Reader.debug] body styles', {
          pointerEvents: cs.pointerEvents,
          paddingRightInline: b.style.paddingRight,
          overflowX: cs.overflowX,
          overflowY: cs.overflowY
        });
      }
      const dlg = document.querySelector('[role="dialog"]') as HTMLElement | null;
      if (dlg) {
        const r = dlg.getBoundingClientRect();
        const cs2 = window.getComputedStyle(dlg);
        console.log('[Reader.debug] dialog content styles', {
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          opacity: cs2.opacity,
          zIndex: cs2.zIndex,
          pointerEvents: cs2.pointerEvents,
          bg: cs2.backgroundColor,
          filter: cs2.filter,
          backdropFilter: (cs2 as any).backdropFilter
        });
      }
      const overlay = document.querySelector('[data-radix-dialog-overlay]') as HTMLElement | null;
      if (overlay) {
        const r = overlay.getBoundingClientRect();
        const cs3 = window.getComputedStyle(overlay);
        console.log('[Reader.debug] dialog overlay styles', {
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          opacity: cs3.opacity,
          zIndex: cs3.zIndex,
          pointerEvents: cs3.pointerEvents,
          bg: cs3.backgroundColor,
          filter: cs3.filter,
          backdropFilter: (cs3 as any).backdropFilter
        });
      }
      console.log('[Reader.debug] content-visibility', { isAnyDialogOpen, applied: isAnyDialogOpen ? 'visible (no CV)' : 'auto (CV enabled)' });
    } catch {}
    return undefined;
  }, [debugEnabled, fontDialogOpen, contentsDialogOpen, themeEditorOpen, isUIHidden, isAnyDialogOpen, contentRef]);
  
  // Delete Post Mutation for admin actions
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      if (import.meta.env?.DEV) {
        console.log(`[Reader] Attempting to delete post with ID: ${postId}`);
      }
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
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
  
  // Clear any cached data to ensure fresh fetch after sample story removal
  // Removed broad cache invalidation; reader now targets only its own query keys

  // Initialize currentIndex with validation
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

  const { data: postsData, isLoading, error } = useQuery<{ posts: WordPressPost[]; totalPages: number; total: number }>({
    // Stabilize the query key so the list is reused across slug changes
    queryKey: ["wordpress", "reader", "list", isCommunityContent ? "community" : "regular"],
    queryFn: async () => {
      if (import.meta.env?.DEV) {
        console.log('[Reader] Fetching WordPress posts list (trimmed)...', { routeSlug });
      }

      try {
        // Fetch a trimmed list for TOC/navigation to reduce payload size
        const result = await fetchWordPressPosts({ page: 1, perPage: 100, includeContent: false, maxRetries: 2 });
        const posts = Array.isArray(result.posts) ? result.posts : [];
        return { posts, totalPages: result.totalPages ?? 1, total: result.total ?? posts.length };
      } catch (error) {
        console.error('[Reader] Error fetching WordPress posts via proxy:', error);
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

  

  // Memoized posts array for consistent usage across hooks
  const posts = useMemo<WordPressPost[]>(() => {
    const dataPosts: WordPressPost[] | undefined = (postsData as any)?.posts;
    return Array.isArray(dataPosts) ? dataPosts : [];
  }, [postsData]);

  // Validate and update currentIndex when posts data changes; align index by slug if present
  useEffect(() => {
    const dataPosts: WordPressPost[] | undefined = (postsData as any)?.posts;
    if (Array.isArray(dataPosts) && dataPosts.length > 0) {
      // If we have a slug in the route, align the index to that post
      if (routeSlug) {
        const bySlug = dataPosts.findIndex((p: any) => String(p.slug || '') === String(routeSlug));
        if (bySlug >= 0 && bySlug !== currentIndex) {
          setCurrentIndex(bySlug);
          sessionStorage.setItem('selectedStoryIndex', String(bySlug));
        }
      }

      // Ensure currentIndex is within bounds
      if (currentIndex >= dataPosts.length) {
        setCurrentIndex(0);
        sessionStorage.setItem('selectedStoryIndex', '0');
      } else {
        sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
      }

      // Log current post details
      const currentPost = dataPosts[currentIndex];

      // Now that we have the post data, update our slug for auto-saving
      if (currentPost) {
        const newSlug = routeSlug || (currentPost.slug || `post-${currentPost.id}`);
        setAutoSaveSlug(newSlug);
      }
    }
  }, [currentIndex, postsData, routeSlug]);

  // Position restoration notification has been removed as requested

  useEffect(() => {
    if (import.meta.env?.DEV) {
      console.log('[Reader] Verifying social icons:', {
        twitter: !!FaTwitter,
        wordpress: !!FaWordpress,
        instagram: !!FaInstagram
      });
    }
    // Sync theme definition overrides from server to ensure global labels/icons are up to date
    (async () => {
      try { await syncThemeDefinitionOverridesFromServer(); } catch {}
    })();
  }, []);

  // WordPress read tracking: compute current post id/link and gate by time-on-page and scroll depth.
  const currentPostId = useMemo(() => {
    try {
      const post = posts?.[currentIndex];
      return post?.id as number | undefined;
    } catch {
      return undefined;
    }
  }, [posts, currentIndex]);

  // Reaction totals for the current post (prefetch + SSE to minimize pop-in)
  const [currentTotals, setCurrentTotals] = useState<ReactionTotals | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const sseErrorCountRef = useRef(0);

  // Defer reactions prefetch and SSE subscription until user interaction or short delay
  const [sseReady, setSseReady] = useState(false);

  useEffect(() => {
    setSseReady(false);
    const pid = Number(currentPostId);
    if (!Number.isFinite(pid)) return;

    const delay = window.setTimeout(() => { setSseReady(true); }, 3000);
    const onInteract = () => { setSseReady(true); };

    window.addEventListener('pointerdown', onInteract);
    window.addEventListener('keydown', onInteract);
    window.addEventListener('touchstart', onInteract);

    return () => {
      window.clearTimeout(delay);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, [currentPostId]);

  useEffect(() => {
    try { sseRef.current?.close(); } catch {}
    setCurrentTotals(null);

    const pid = Number(currentPostId);
    if (!sseReady || !Number.isFinite(pid)) return;

    // Prefetch totals once ready
    (async () => {
      try {
        const totals = await fetchReactionsBatch([pid]);
        const first = totals && totals[0];
        if (first && Number(first.postId) === pid) {
          setCurrentTotals(first);
        }
      } catch { /* ignore */ }
    })();

    // Subscribe to SSE for live totals
    try {
      const es = new EventSource(`/api/posts/${pid}/reactions/stream`, { withCredentials: true } as any);
      sseErrorCountRef.current = 0;
      const onMessage = (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data || '{}');
          if (payload && typeof payload.postId === 'number') {
            setCurrentTotals({
              postId: Number(payload.postId),
              baselineLikes: Number(payload.baselineLikes || 0),
              baselineDislikes: Number(payload.baselineDislikes || 0),
              likesCount: Number(payload.likesCount || 0),
              dislikesCount: Number(payload.dislikesCount || 0),
              totals: {
                likes: Number(payload.totals?.likes || (Number(payload.baselineLikes || 0) + Number(payload.likesCount || 0))),
                dislikes: Number(payload.totals?.dislikes || (Number(payload.baselineDislikes || 0) + Number(payload.dislikesCount || 0))),
              }
            });
          }
        } catch {}
      };
      es.addEventListener('initial', onMessage);
      es.addEventListener('update', onMessage);
      es.onerror = () => {
        sseErrorCountRef.current += 1;
        if (sseErrorCountRef.current === 3) {
          try { logReaderError('reader.sse.error', 'SSE connection error', { postId: pid }); } catch {}
        }
        // keep alive; browser will reconnect
      };
      sseRef.current = es;
    } catch { /* ignore */ }

    return () => {
      try { sseRef.current?.close(); } catch {}
      sseRef.current = null;
    };
  }, [currentPostId, sseReady]);

  const currentPostLink = useMemo(() => {
    try {
      const post = posts?.[currentIndex];
      return (post as any)?.link as string | undefined;
    } catch {
      return undefined;
    }
  }, [posts, currentIndex]);

  // Cookie consent for analytics
  const { isCategoryAllowed } = useCookieConsent();

  // Interaction gating
  const userInteractedRef = useRef<boolean>(false);
  const [interactionCount, setInteractionCount] = useState(0);
  useEffect(() => {
    const onInteract = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        setInteractionCount((c) => c + 1);
        window.removeEventListener('pointerdown', onInteract);
        window.removeEventListener('keydown', onInteract);
        window.removeEventListener('touchstart', onInteract);
      }
    };
    window.addEventListener('pointerdown', onInteract, { passive: true });
    window.addEventListener('keydown', onInteract);
    window.addEventListener('touchstart', onInteract, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };
  }, []);

  // Visibility-aware active time tracking
  const readActiveStartRef = useRef<number | null>(null);
  const activeAccumulatedMsRef = useRef<number>(0);
  const [visibilityTick, setVisibilityTick] = useState(0);

  // Persist reading progress to server for cross-device resume (throttled)
  const lastProgressSentRef = useRef<{ percent: number; ts: number }>({ percent: 0, ts: 0 });
  useEffect(() => {
    try {
      if (!isAuthenticated) return;
      const slug = routeSlug || autoSaveSlug || posts?.[currentIndex]?.slug;
      if (!slug) return;

      const now = Date.now();
      const rounded = Math.round(readingProgress);
      const diff = Math.abs(rounded - (lastProgressSentRef.current.percent || 0));
      const tooSoon = now - (lastProgressSentRef.current.ts || 0) < 15000; // 15s throttle

      if (diff >= 10 && !tooSoon) {
        apiJson<any>('POST', '/api/reading-progress', {
          postSlug: String(slug),
          percentCompleted: rounded
        }).then((_res) => {
          // Successful; record timestamp and last percent sent
          lastProgressSentRef.current = { percent: rounded, ts: Date.now() };
        }).catch(() => { /* non-fatal */ });
      }
    } catch { /* non-fatal */ }
  }, [readingProgress, routeSlug, autoSaveSlug, posts, currentIndex, isAuthenticated]);

  // Reset active timers when post changes
  useEffect(() => {
    activeAccumulatedMsRef.current = 0;
    readActiveStartRef.current = (typeof document !== 'undefined' && document.visibilityState === 'visible') ? Date.now() : null;
  }, [currentPostId]);

  // Accumulate active time only when document is visible
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'hidden') {
        if (readActiveStartRef.current != null) {
          activeAccumulatedMsRef.current += Date.now() - readActiveStartRef.current;
          readActiveStartRef.current = null;
        }
      } else {
        if (readActiveStartRef.current == null) {
          readActiveStartRef.current = Date.now();
        }
      }
      setVisibilityTick((t) => t + 1);
    };
    document.addEventListener('visibilitychange', handler);
    // Initialize
    handler();
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  // Fire a WordPress.com stats pixel once per session when:
  // - user has scrolled at least 30%
  // - at least 2 seconds of active (visible) time on the current post
  // - user has interacted (click/keydown/touch)
  // - analytics consent is allowed
  // - tab is visible at the moment of firing
  useEffect(() => {
    try {
      if (!currentPostId) return;

      const sessionKey = `wp_read_tracked_${currentPostId}`;
      const dayKey = (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `wp_read_tracked_day_${currentPostId}_${y}${m}${day}`;
      })();

      const alreadySession = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;
      const alreadyDay = typeof localStorage !== 'undefined' ? localStorage.getItem(dayKey) : null;
      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      const analyticsAllowed = (() => { try { return isCategoryAllowed('analytics'); } catch { return true; } })();

      const elapsedActiveMs =
        activeAccumulatedMsRef.current +
        (readActiveStartRef.current != null ? (Date.now() - readActiveStartRef.current) : 0);

      if (
        readingProgress >= 30 &&
        elapsedActiveMs >= 2000 &&
        !alreadySession &&
        !alreadyDay &&
        analyticsAllowed &&
        userInteractedRef.current &&
        isVisible
      ) {
        trackWordPressRead(currentPostId, currentPostLink);
      }
    } catch {
      // no-op
    }
    // Re-evaluate on progress changes, post changes, interaction and visibility transitions
  }, [readingProgress, currentPostId, currentPostLink, interactionCount, visibilityTick, isCategoryAllowed]);

  // Finish-read tracking (local analytics): 90% scroll and ≥ 60s active time
  useEffect(() => {
    try {
      if (!currentPostId) return;
      const isVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
      const analyticsAllowed = (() => { try { return isCategoryAllowed('analytics'); } catch { return true; } })();
      if (!analyticsAllowed || !userInteractedRef.current || !isVisible) return;

      const elapsedActiveMs =
        activeAccumulatedMsRef.current +
        (readActiveStartRef.current != null ? (Date.now() - readActiveStartRef.current) : 0);

      const finishKey = `finish_read_tracked_${currentPostId}`;
      const already = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(finishKey) : null;

      if (readingProgress >= 90 && elapsedActiveMs >= 60000 && !already) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(finishKey, '1');
          }
        } catch {}
        // Record local engagement metric
        const post = posts?.[currentIndex] as any;
        trackInteraction('finish_read', {
          postId: currentPostId,
          slug: post?.slug,
          progress: readingProgress,
          timeMs: elapsedActiveMs
        });
      }
    } catch {
      // no-op
    }
  }, [readingProgress, currentPostId, interactionCount, visibilityTick, isCategoryAllowed, currentIndex, posts]);

  

  // Apply font styles using CSS variables for smooth transitions
  useEffect(() => {
    try {
      if (import.meta.env?.DEV) {
        console.log('[Reader] Updating font styles with CSS variables:', { fontFamily, fontSize, theme });
      }
      // Set CSS variables on the document root for smooth transitions
      const root = document.documentElement;
      root.style.setProperty('--reader-font-family', availableFonts[fontFamily].family);
      root.style.setProperty('--reader-font-size', `${fontSize}px`);
      root.style.setProperty('--reader-text-color', theme === 'dark' ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR);
    } catch (error) {
      console.error('[Reader] Error applying font styles:', error);
    }
  }, [fontFamily, fontSize, availableFonts, theme]);
  
  // This duplicate has been removed - reading progress tracking is handled above

  
  // Removed duplicate deleted posts detection useEffect block

  // Stabilize index and set up canonical URL synchronization before any early returns
  const validCurrentIndex = useMemo(
    () => Math.max(0, Math.min(currentIndex, posts.length - 1)),
    [currentIndex, posts.length]
  );

  // Avoid auto-redirect from /reader; let the page render predictably without route changes

  // Determine current slug and fetch full post content by slug (prefer full content for the active story)
  const currentSlugToUse = routeSlug || (posts[validCurrentIndex]?.slug as any);
  const { data: currentPostFull, isFetching: isFetchingPost } = useQuery<WordPressPost | null>({
    queryKey: ['wordpress', 'reader', 'post', currentSlugToUse || ''],
    queryFn: async () => {
      if (!currentSlugToUse) return null as any;
      try {
        return await fetchWordPressPostBySlug(String(currentSlugToUse));
      } catch (err) {
        try { logReaderError('reader.post.fetchError', 'Failed to fetch post by slug', { slug: String(currentSlugToUse) }); } catch {}
        return null as any;
      }
    },
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(currentSlugToUse),
  });

  // Let's make sure we have posts data and current post before rendering
  // Keep previous story content visible while fetching; only return null if no cached data yet
  const hasCachedPosts = Array.isArray((postsData as any)?.posts) && ((postsData as any)?.posts?.length > 0);
  if (isLoading && !hasCachedPosts) {
    // Show a lightweight route-level loader on first open
    return <RouteLoader label="Loading story" minHeight="60vh" />;
  }

  if (error) {
    return (
      <SimplifiedErrorPage
        statusCode={404}
        title="Story Not Found"
        message={error instanceof Error ? error.message : 'The requested story could not be found.'}
        actionText="Browse Stories"
        actionLink="/reader"
      />
    );
  }

  if (!routeSlug && posts.length === 0) {
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
  // Get current post: prefer fully-fetched content
  const currentPost = (currentPostFull as any) || posts[validCurrentIndex];

  

  

  // SEO values for this story
  const stripHtml = (s: string): string => (s ? s.replace(/<\/?[^>]+(>|$)/g, '').trim() : '');
  const titleText = stripHtml(getRenderedText(currentPost.title) || 'Story');
  const titleRaw = getRenderedText(currentPost.title) || 'Story';
  const titleHtml = sanitizeHtmlContent(titleRaw);
  const rawContent = getRenderedText(currentPost.content) || '';
  const contentHtml = sanitizeHtmlContent(rawContent);
  const isContentReady = contentHtml.trim().length > 0;
  const descriptionText = getExcerptMemo(rawContent, 160);
  const canonicalPath = routeSlug ? `/reader/${encodeURIComponent(routeSlug)}` : '/reader';
  const published = currentPost.date || new Date().toISOString();
  const plainText = stripHtml(rawContent);
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));
  const keywords = detectThemesMemo(rawContent);
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
  const detectedThemes = detectThemesMemo(getRenderedText(currentPost.content) || '');

  // Horror easter egg function
  const checkRapidNavigation = () => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTimeRef.current;
    
    // Check if rapid navigation (less than 1.5 seconds between skips)
    if (timeSinceLastNavigation < 1500) {
      skipCountRef.current += 1;
      // Persist updated skip count
      try {
        sessionStorage.setItem('reader_skip_count', String(skipCountRef.current));
      } catch {}
      
      // After 3 rapid skips, show the horror Easter egg
      if (skipCountRef.current >= 3 && !showHorrorMessage) {
        if (import.meta.env?.DEV) {
          console.log('[Reader] Horror Easter egg triggered after rapid navigation');
        }
        
        // Highly threatening message for maximum creepiness with subtle psychological impact
        const message = "I SEE YOU SKIPPING!!!";
        setHorrorMessageText(message);
        setShowHorrorMessage(true);

        // Persist overlay state with expiry so it survives route remounts
        try {
          sessionStorage.setItem('reader_horror_active', '1');
          sessionStorage.setItem('reader_horror_message', message);
          sessionStorage.setItem('reader_horror_expiry_ts', String(now + 9000));
        } catch {}
        
        // Show toast with extremely creepy text using maximum intensity
        // The CreepyTextGlitch component has been enhanced for a rapid, unnerving effect
        toast({
          title: "NOTICE",
          description: <CreepyTextGlitch text={message} intensityFactor={8} />,
          variant: "destructive",
          duration: 9000,
        });
        
        // Reset after showing - match the extended toast duration
        setTimeout(() => {
          setShowHorrorMessage(false);
          skipCountRef.current = 0;
          try {
            sessionStorage.setItem('reader_skip_count', '0');
            sessionStorage.removeItem('reader_horror_active');
            sessionStorage.removeItem('reader_horror_message');
            sessionStorage.removeItem('reader_horror_expiry_ts');
          } catch {}
        }, 9000); // Extended to match the 9000ms toast duration
      }
    } else {
      // If navigation is slow, gradually reduce the skip count
      skipCountRef.current = Math.max(0, skipCountRef.current - 1);
      try {
        sessionStorage.setItem('reader_skip_count', String(skipCountRef.current));
      } catch {}
    }
    
    // Update last navigation time (persisted)
    lastNavigationTimeRef.current = now;
    try {
      sessionStorage.setItem('reader_last_nav_time', String(now));
    } catch {}
  };

  // These navigation function declarations need to be hoisted to avoid errors with hooks
  // Do not use early returns that might mess with React's hooks execution order
  const goToRandomStory = () => {
    // Only execute logic if we have more than one story
    if (posts && posts.length > 1) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * posts.length);
      } while (randomIndex === currentIndex);
      
      checkRapidNavigation();
      try {
        const nextSlug = String(posts[randomIndex]?.slug ?? posts[randomIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };
  
  // Function to navigate to previous story
  const goToPreviousStory = () => {
    // Only execute logic if we have posts and we're not at the first one
    if (posts && posts.length > 1 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      checkRapidNavigation();
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };
  
  // Function to navigate to next story
  const goToNextStory = () => {
    // Only execute logic if we have posts and we're not at the last one
    if (posts && posts.length > 1 && currentIndex < posts.length - 1) {
      const newIndex = currentIndex + 1;
      checkRapidNavigation();
      try {
        const nextSlug = String(posts[newIndex]?.slug ?? posts[newIndex]?.id);
        if (nextSlug) {
          setLocation(`/reader/${encodeURIComponent(nextSlug)}`);
        }
      } catch {}
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };
  
  // Check if we're at first or last story
  const isFirstStory = currentIndex === 0;
  const isLastStory = currentIndex === posts.length - 1;

  // We've moved the swipe navigation logic to a dedicated component
  // This avoids hook execution order issues by keeping related logic in a single component

  // The theme and toggleTheme functions are already declared at the top of the component
  
  return (
    <div className="relative bg-background reader-page overflow-x-hidden overflow-y-visible pt-0 pb-0 flex flex-col"
      data-reader-page="true" 
      data-distraction-free={isUIHidden ? "true" : "false"}
      data-debug={debugEnabled ? "1" : "0"}>
      
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
      <style dangerouslySetInnerHTML={{__html: `
        /* Distraction-free fade: dim UI chrome while preserving layout */
        .ui-fade-element {
          transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity;
        }
        .ui-hidden {
          opacity: 0.2; /* stronger dimming */
          pointer-events: auto;
        }
        /* Lift dimness on hover or focus for discoverability */
        .reader-page[data-distraction-free="true"] .ui-fade-element:hover,
        .reader-page[data-distraction-free="true"] .ui-fade-element:focus-within {
          opacity: 1;
        }
        .story-content {
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        
        /* Distraction-free mode: keep navbar visible but subtle */
        .reader-page[data-distraction-free="true"] header.main-header {
          opacity: 0.25; /* much dimmer header */
          visibility: visible;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: auto;
          transform: none;
          will-change: opacity;
        }
        .reader-page[data-distraction-free="true"] header.main-header:hover {
          opacity: 1; /* brighten on hover */
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
        
        /* Only show pointer cursor on story content */
        .reader-page .story-content {
          cursor: pointer;
        }
        
        /* Set default cursor for everything */
        .reader-page {
          cursor: default;
          scrollbar-gutter: stable;
        }
        
        /* Set pointer cursor only for interactive elements */
        .reader-page button,
        .reader-page a,
        .reader-page [role="button"],
        .reader-page input[type="button"],
        .reader-page input[type="submit"] {
          cursor: pointer;
        }
        
        /* Keep the story content cursor as pointer to indicate clickable for distraction-free mode */
        .reader-page .story-content {
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
      `}} />
      {debugEnabled ? (
        <style dangerouslySetInnerHTML={{__html: `
          /* Reader debug outlines for hit-testing and bounds */
          .reader-page[data-debug="1"] .debug-outline { outline: 1px dashed rgba(255,0,0,.6); outline-offset: 0; }
          .reader-page[data-debug="1"] .debug-outline-controls { outline-color: #d97706; } /* amber */
          .reader-page[data-debug="1"] .debug-outline-meta { outline-color: #10b981; } /* emerald */
          .reader-page[data-debug="1"] .debug-outline-nav { outline-color: #3b82f6; } /* blue */
          .reader-page[data-debug="1"] .debug-outline-pager { outline-color: #a855f7; } /* purple */
          .reader-page[data-debug="1"] .debug-outline-share { outline-color: #ef4444; } /* red */
          .reader-page[data-debug="1"] .debug-outline-content { outline-color: #22d3ee; } /* cyan */
        `}} />
      ) : null}
      
      {/* Reader content styles moved to reader-typography.css */}

      {/* Horror overlay rendered via portal to ensure visibility without scrolling; modal and text unchanged */}
      <ReaderHorrorOverlayPortal
        visible={showHorrorMessage}
        message={horrorMessageText}
        onClose={() => {
          setShowHorrorMessage(false);
          try {
            sessionStorage.removeItem('reader_horror_active');
            sessionStorage.removeItem('reader_horror_message');
            sessionStorage.removeItem('reader_horror_expiry_ts');
            sessionStorage.setItem('reader_skip_count', '0');
          } catch {}
        }}
      />
      
      
      
      {/* Floating pagination has been removed */}
      
      {/* Navigation buttons removed as requested */}
      {/* Full width immersive reading experience */}

      <div className={`pt-0 pb-0 bg-background mt-0 w-full overflow-visible ${isUIHidden ? 'distraction-free-active' : ''}`}>
        

        {/* Font controls/TOC spacing below header and progress bar */}
        <div ref={controlsRowRef} className={`flex justify-between items-center px-2 md:px-8 lg:px-12 z-10 mt-0.5 py-0.5 m-0 w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-controls`} style={{ minHeight: '40px' }}>
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
            <Dialog open={fontDialogOpen} onOpenChange={(open) => { if (debugEnabled) { try { console.log('[Reader.debug] FontDialog openChange:', open); } catch {} } setFontDialogOpen(open); try { setUIHidden(false); } catch {} }}>
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
                            setFontDialogOpen(false); // Close the dialog after changing font
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

          {/* Text-to-speech functionality removed */}

          {/* Contents Dialog with controlled open state - non-fullscreen with close button */}
          <Dialog open={contentsDialogOpen} onOpenChange={(open) => { if (debugEnabled) { try { console.log('[Reader.debug] TOC Dialog openChange:', open); } catch {} } setContentsDialogOpen(open); try { setUIHidden(false); } catch {} }}>
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
            {/* Wrap the TableOfContents component to ensure DialogContent has proper aria attributes */}
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
          aria-hidden="true"
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
            className="prose dark:prose-invert px-6 md:px-6 pt-0 w-full max-w-none"
          >
            {/* Navigation buttons above story content removed; now placed under time-to-read */}

            {/* Full-bleed separator above story title (thin, end-to-end) */}
            <div
              aria-hidden="true"
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
                    {/* Show delete button for admins or post authors */}
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
              dangerouslySetInnerHTML={{ __html: titleHtml }}
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
                <div ref={metaRowRef} className={`flex flex-nowrap items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground backdrop-blur-sm bg-background/30 px-3 sm:px-4 py-1 rounded-full shadow-sm border border-border/60 ui-fade-element overflow-x-auto whitespace-nowrap ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-meta`} style={{ minHeight: '32px' }}>
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
                    {currentPost.date ? format(new Date(currentPost.date), 'MMM d, yyyy') : 'No date'}
                  </span>
                  
                  <span className="text-muted-foreground">•</span>
                  
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
                  <Dialog open={themeEditorOpen} onOpenChange={(open) => { if (debugEnabled) { try { console.log('[Reader.debug] ThemeEditor dialog openChange:', open); } catch {} } setThemeEditorOpen(open); }}>
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
                                /(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/,
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

                {/* Original navigation controls moved here under time-to-read */}
                <div ref={navRowRef} className={`flex justify-center items-center gap-4 py-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-nav`}>
                  {/* Previous - match Next size and feel */}
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

                  {/* Random - icon only, circular */}
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

                  {/* Next - keep as baseline and match sizing */}
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
                className="story-content cursor-pointer text-justify"
                ref={contentRef}
                onPointerUp={(e) => {
                  // Primary handler for tap-to-toggle on mobile
                  if (!shouldToggleContent(e)) return;
                  const now = Date.now();
                  if (now - (lastToggleAtRef.current || 0) < 250) return; // debounce duplicate events
                  lastToggleAtRef.current = now;
                  toggleUIWithDebug('contentTap');
                }}
                onClick={(e) => {
                  // Fallback click handler (desktop/mouse)
                  if (!shouldToggleContent(e)) return;
                  const now = Date.now();
                  if (now - (lastToggleAtRef.current || 0) < 250) return; // debounce duplicate events
                  lastToggleAtRef.current = now;
                  toggleUIWithDebug('contentClick');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // Do not toggle when any dialog/overlay is open or inline comment is active
                    if (!shouldToggleContent(e)) return;
                    // Only toggle when container itself is focused (not an interactive child)
                    if (e.currentTarget !== e.target) return;
                    e.preventDefault();
                    toggleUIWithDebug('contentKey');
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Toggle user interface visibility"
                aria-pressed={isUIHidden}
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
            <div ref={pagerRowRef} className={`flex items-center justify-center gap-2 mb-6 mt-4 w-full text-center ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-pager`} style={{ minHeight: '64px' }}>
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
                  <LikeDislike postId={currentPost.id} slug={currentPost.slug} source="wp" variant="reader" initialTotals={currentTotals} />
                </div>

                <div ref={shareRowRef} className={`flex flex-col items-center gap-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''} debug-outline debug-outline-share`}>
                  <p className="text-sm text-muted-foreground font-medium">✨ Loved the story? Share it or follow for more! ✨</p>
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
                      {/* Twitter */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          window.open('https://twitter.com/Bubbleteameimei', '_blank', 'noopener,noreferrer');
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaTwitter className="h-4 w-4" />
                        <span className="sr-only">Follow on Twitter</span>
                      </Button>
                      
                      {/* WordPress */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          window.open('https://bubbleteameimei.wordpress.com/', '_blank', 'noopener,noreferrer');
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaWordpress className="h-4 w-4" />
                        <span className="sr-only">Follow on WordPress</span>
                      </Button>
                      
                      {/* Instagram */}
                      <Button
                        asChild
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <a href="https://www.instagram.com/Bubbleteameimei/" target="_blank" rel="noreferrer">
                          <FaInstagram className="h-4 w-4" />
                          <span className="sr-only">Follow on Instagram</span>
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comment section (lazy-mounted near viewport) */}
            <div className="mt-8">
              <LazyCommentSection postId={currentPost.id} />
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