import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import useReaderUIToggle from "@/hooks/use-reader-ui-toggle";
import ReaderTooltip from "@/components/reader/ReaderTooltip";
import TableOfContents from "@/components/reader/TableOfContents";
import SwipeNavigation from "@/components/reader/SwipeNavigation";
import "@/styles/reader-fixes.css"; // Import custom reader fixes
import { 
  Share2, Minus, Plus, Shuffle, RefreshCcw, ChevronLeft, ChevronRight, BookOpen,
  Skull, Brain, Pill, Cpu, Dna, Ghost, Cross, Umbrella, Footprints, CloudRain, Castle, 
  Radiation, UserMinus2, Anchor, AlertTriangle, Building, Bug, Worm, Cloud, CloudFog,
  Menu, BookText, Home, Trash, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontFamily, FontFamilyKey } from "@/hooks/use-font-family";
import { detectThemes, THEME_CATEGORIES } from "@/lib/content-analysis";
import type { ThemeCategory } from "@/shared/types";
// Import social icons directly since lazy loading was causing issues
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import ApiLoader from "@/components/api-loader";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import MistEffect from "@/components/effects/MistEffect";
import { MistControl } from "@/components/ui/mist-control";
import CreepyTextGlitch from "@/components/errors/CreepyTextGlitch";
import { useToast } from "@/hooks/use-toast";
// Import our reader-specific gentle scroll memory hook
import useReaderGentleScroll from "@/hooks/useReaderGentleScroll";
import { SupportWritingCard } from "@/components/SupportWritingCard";

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

// Import comment section directly for now to avoid lazy loading issues
import SimpleCommentSection from "@/components/blog/SimpleCommentSection";

// Import the WordPress API functions with error handling
import { fetchWordPressPosts } from "@/lib/wordpress-api";

// Native HTML sanitization function (avoiding DOMPurify dependency conflicts)
const sanitizeHtmlContent = (html: string): string => {
  try {
    // Create a temporary div to parse HTML safely
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags and other dangerous elements
    const dangerousElements = temp.querySelectorAll('script, object, embed, iframe, form, input, button');
    dangerousElements.forEach(element => element.remove());
    
    // Remove dangerous attributes from all elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      const dangerousAttrs = [
        'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
        'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeyup',
        'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove', 'onmouseout',
        'onmousein', 'ondblclick', 'oncontextmenu', 'javascript:', 'vbscript:'
      ];
      dangerousAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });
      
      // Also check href and src attributes for dangerous protocols
      const href = element.getAttribute('href');
      const src = element.getAttribute('src');
      if (href && (href.startsWith('javascript:') || href.startsWith('vbscript:'))) {
        element.removeAttribute('href');
      }
      if (src && (src.startsWith('javascript:') || src.startsWith('vbscript:'))) {
        element.removeAttribute('src');
      }
    });
    
    return temp.innerHTML;
  } catch (error) {
    console.error('[Reader] Error sanitizing HTML:', error);
    return html; // Return original if sanitization fails
  }
};

interface ReaderPageProps {
  slug?: string;
  params?: { slug?: string };
  isCommunityContent?: boolean;
}

export default function ReaderPage({ slug, params, isCommunityContent = false }: ReaderPageProps) {
  // Log params for debugging
  console.log('[ReaderPage] Initializing with params:', { routeSlug: params?.slug || slug, params, slug });
  // Extract slug from route params if provided
  const routeSlug = params?.slug || slug;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Add authentication hook to check user role for admin actions
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.isAdmin === true;
  
  // Theme is now managed by the useTheme hook
  const { theme, toggleTheme } = useTheme();
  
  // Font size and family adjustments
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const { fontFamily, availableFonts, updateFontFamily } = useFontFamily();
  
  // Night mode functionality has been completely removed
  
  // One-click distraction-free mode - toggle UI visibility with click
  const { isUIHidden, toggleUI, showTooltip } = useReaderUIToggle();

  // Reading progress state - moved to top level with other state hooks
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Will initialize this after data is loaded
  const [autoSaveSlug, setAutoSaveSlug] = useState<string>("");
  
  // Fixed constants for better text readability (replacing auto-contrast)
  const DARK_TEXT_COLOR = 'rgba(255, 255, 255, 0.95)';
  const LIGHT_TEXT_COLOR = 'rgba(0, 0, 0, 0.95)';
  
  // State for dialog controls
  const [fontDialogOpen, setFontDialogOpen] = useState(false);
  const [contentsDialogOpen, setContentsDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // State for MistControl
  const [mistIntensity, setMistIntensity] = useState<'subtle' | 'medium' | 'intense'>('subtle');
  
  // Detect if this is a refresh using Performance API
  const isRefreshRef = useRef<boolean>(
    typeof window !== 'undefined' &&
    window.performance && 
    ((window.performance.navigation?.type === 1) || // Old API
     (performance.getEntriesByType('navigation').some(
       nav => (nav as PerformanceNavigationTiming).type === 'reload'
     )))
  );
  
  // Helper function to close dialogs safely
  const safeCloseDialog = () => {
    const closeButton = document.querySelector('[aria-label="Close"]');
    if (closeButton instanceof HTMLElement) {
      closeButton.click();
    }
  };
  
  // Reading progress tracking with scroll-based calculation
  useEffect(() => {
    let ticking = false;
    let animationFrameId: number | null = null;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      const progress = Math.min(100, Math.max(0, scrollPercent));
      setReadingProgress(progress);
      console.log('[Reader] Progress updated:', { scrollTop, docHeight, progress });
    };

    // Throttle scroll events for better performance
    const throttledHandleScroll = () => {
      if (!ticking) {
        animationFrameId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
          animationFrameId = null;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);
  
  // Horror easter egg - track rapid navigation
  const [showHorrorMessage, setShowHorrorMessage] = useState(false);
  const [horrorMessageText, setHorrorMessageText] = useState("Are you avoiding something?");
  const skipCountRef = useRef(0);
  const lastNavigationTimeRef = useRef(Date.now());
  
  // Create a ref for the content container to attach swipe events
  const contentRef = useRef<HTMLDivElement>(null);
  // Removed positionRestoredRef as we no longer save reading position
  
  // Delete Post Mutation for admin actions
  const deleteMutation = useMutation({
    mutationFn: async (postId: number) => {
      console.log(`[Reader] Attempting to delete post with ID: ${postId}`);
      
      const csrfToken = document.cookie.replace(/(?:(?:^|.*;\s*)XSRF-TOKEN\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      console.log('[Reader] Using CSRF token for deletion');
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });
      
      // Read response data
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`[Reader] Delete failed with status: ${response.status}`, data);
        if (response.status === 401) {
          throw new Error('Please log in to delete this story');
        } else {
          throw new Error(data.message || 'Failed to delete post');
        }
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure cache is properly cleared
      console.log('[Reader] Invalidating all related query caches');
      
      // Invalidate community posts list
      queryClient.invalidateQueries({ queryKey: ['/api/posts/community'] });
      
      // Invalidate all posts endpoint
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      // Invalidate specific post endpoints
      if (currentPost?.id) {
        console.log(`[Reader] Invalidating specific post cache for ID: ${currentPost.id}`);
        queryClient.invalidateQueries({ 
          queryKey: ['/api/posts', currentPost.id.toString()]
        });
      }
      
      // Also invalidate the specific post query based on the slug
      if (routeSlug) {
        console.log('[Reader] Invalidating specific post cache for slug:', routeSlug);
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
        description: isAdmin && user?.id !== currentPost?.authorId
          ? 'Community story has been deleted by admin.'
          : 'Your story has been deleted successfully.',
      });
      
      // Force navigation back to the community page after deletion
      console.log('[Reader] Navigating back to community page');
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

  console.log('[Reader] Component mounted with slug:', routeSlug); // Debug log
  
  // Clear any cached data to ensure fresh fetch after sample story removal
  useEffect(() => {
    console.log('[Reader] Clearing query cache to ensure fresh data');
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.removeQueries({ queryKey: ["posts"] });
  }, [queryClient]);

  // Initialize currentIndex with validation
  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const savedIndex = sessionStorage.getItem('selectedStoryIndex');
      console.log('[Reader] Retrieved saved index:', savedIndex);

      if (!savedIndex) {
        console.log('[Reader] No saved index found, defaulting to 0');
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

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ["posts", "reader", routeSlug, isCommunityContent ? "community" : "regular"],
    queryFn: async () => {
      console.log('[Reader] Fetching posts...', { routeSlug, isCommunityContent });
      try {
        if (routeSlug) {
          // If slug is provided, fetch specific post
          // Use the community endpoint if this is community content
          const endpoint = isCommunityContent ? `/api/posts/community/${routeSlug}` : `/api/posts/${routeSlug}`;
          const response = await fetch(endpoint);
          if (!response.ok) throw new Error(`Failed to fetch ${isCommunityContent ? 'community' : ''} post`);
          const post = await response.json();
          
          // Convert post to a format compatible with both WordPress and internal posts
          const normalizedPost = {
            ...post,
            // Ensure title and content are in the expected format
            title: {
              rendered: post.title?.rendered || post.title || ''
            },
            content: {
              rendered: post.content?.rendered || post.content || ''
            },
            date: post.date || post.createdAt || new Date().toISOString()
          };
          
          return { posts: [normalizedPost], totalPages: 1, total: 1 };
        } else {
          // Fetch all posts from internal API (your WordPress stories are already synced here)
          console.log('[Reader] Fetching posts...', { isCommunityContent });
          
          // Always use the core posts endpoint for maximum reliability with cache busting
          const response = await fetch(`/api/posts?limit=100&_t=${Date.now()}`);
          if (!response.ok) {
            throw new Error('Failed to fetch posts from database');
          }
          
          const data = await response.json();
          console.log('[Reader] Successfully fetched posts:', {
            totalPosts: data.posts?.length,
            hasMore: data.hasMore,
            firstPost: data.posts?.[0]?.title
          });
          
          if (!data.posts || data.posts.length === 0) {
            throw new Error('No stories available');
          }
          
          // Normalize posts to ensure consistent format
          const normalizedPosts = data.posts.map((post: any) => ({
            ...post,
            title: {
              rendered: post.title?.rendered || post.title || ''
            },
            content: {
              rendered: post.content?.rendered || post.content || ''
            },
            date: post.date || post.created_at || new Date().toISOString()
          }));
          
          return { posts: normalizedPosts, totalPages: 1, total: normalizedPosts.length };
        }
      } catch (error) {
        console.error('[Reader] Error fetching posts:', error);
        // Add fallback error handling here
        console.error('[Reader] Error or no posts available:', { error, currentIndex });
        
        // Try to fetch any posts to show something
        try {
          // Try to fetch community posts if that's what we're looking for
          const endpoint = isCommunityContent ? '/api/posts/community?limit=50' : '/api/posts?limit=50';
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            if (data.posts && data.posts.length > 0) {
              const normalizedPosts = data.posts.map((post: any) => ({
                ...post,
                title: {
                  rendered: post.title?.rendered || post.title || 'Story'
                },
                content: {
                  rendered: post.content?.rendered || post.content || 'Content not available.'
                },
                date: post.date || post.createdAt || new Date().toISOString()
              }));
              return { posts: normalizedPosts, totalPages: 1, total: normalizedPosts.length };
            }
          }
        } catch (fallbackError) {
          console.error('[Reader] Fallback also failed:', fallbackError);
        }
        
        throw error;
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Initialize the reader-specific gentle scroll memory
  // This will only work on the reader page and community-story page
  const { positionRestored, isRefresh } = useReaderGentleScroll({
    enabled: !isLoading && postsData?.posts && postsData.posts.length > 0,
    slug: routeSlug || '',
    showToast: true,
    autoSave: true,
    autoSaveInterval: 2000
  });

  // Validate and update currentIndex when posts data changes
  useEffect(() => {
    if (postsData?.posts && postsData.posts.length > 0) {
      console.log('[Reader] Validating current index:', {
        currentIndex,
        totalPosts: postsData.posts.length,
        savedIndex: sessionStorage.getItem('selectedStoryIndex')
      });

      // Ensure currentIndex is within bounds
      if (currentIndex >= postsData.posts.length) {
        console.log('[Reader] Current index out of bounds, resetting to 0');
        setCurrentIndex(0);
        sessionStorage.setItem('selectedStoryIndex', '0');
      } else {
        console.log('[Reader] Current index is valid:', currentIndex);
        sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
      }

      // Log current post details
      const currentPost = postsData.posts[currentIndex];
      console.log('[Reader] Selected post:', currentPost ? {
        id: currentPost.id,
        title: currentPost.title?.rendered || currentPost.title || 'Story',
        date: currentPost.date
      } : 'No post found');
      
      // Now that we have the post data, update our slug for auto-saving
      if (currentPost) {
        const newSlug = routeSlug || (currentPost.slug || `post-${currentPost.id}`);
        console.log('[Reader] Setting auto-save slug:', newSlug);
        setAutoSaveSlug(newSlug);
        
        // Check if we've reloaded but the post has been deleted
        if (routeSlug && currentPost.id && currentIndex === 0) {
          // Verify the post exists by making a direct check using the improved endpoint
          // that handles both slugs and IDs
          fetch(`/api/posts/${currentPost.id}`)
            .then(response => {
              if (response.status === 404) {
                console.log('[Reader] Post may have been deleted, redirecting to community page');
                // Post might have been deleted, redirect to community page
                // No delay to prevent showing deleted content
                setLocation('/community');
                toast({
                  title: 'Post Not Available',
                  description: 'This post is no longer available, redirecting to community page.'
                });
              }
            })
            .catch(err => {
              console.error('[Reader] Error checking post existence:', err);
            });
        }
      }
    }
  }, [currentIndex, postsData?.posts, routeSlug, queryClient, setLocation, toast]);

  // Position restoration notification has been removed as requested

  useEffect(() => {
    console.log('[Reader] Verifying social icons:', {
      twitter: !!FaTwitter,
      wordpress: !!FaWordpress,
      instagram: !!FaInstagram
    });
  }, []);

  // Create a function to generate the styles
  const generateStoryContentStyles = () => {
    // Use our fixed constants for better text readability
    const textColor = theme === 'dark' 
      ? `color: ${DARK_TEXT_COLOR};` 
      : `color: ${LIGHT_TEXT_COLOR};`;
    
    // Return the main styles with better text contrast for readability
    return `
  .story-content {
    font-family: ${availableFonts[fontFamily].family};
    width: 100%;
    margin: 0 auto;
    padding: 0 0.5rem;
    ${textColor}
    transition: color 0.3s ease, background-color 0.3s ease;
  }
  .story-content p, .story-content .story-paragraph {
    line-height: 1.7;
    margin-bottom: 1.7em;
    font-family: ${availableFonts[fontFamily].family};
  }
  @media (max-width: 768px) {
    .story-content p, .story-content .story-paragraph {
      margin-bottom: 1.5em;
      line-height: 1.75;
    }
  }`;
  };

  // Apply styles effect with debouncing and proper cleanup
  useEffect(() => {
    let timeoutId: number | null = null;
    
    const applyStyles = () => {
      try {
        console.log('[Reader] Injecting content styles with font family:', fontFamily);
        
        // Remove any existing style tag first
        const existingTag = document.getElementById('reader-dynamic-styles');
        if (existingTag) {
          existingTag.remove();
        }
        
        // Create new style tag
        const styleTag = document.createElement('style');
        styleTag.id = 'reader-dynamic-styles';
        
        // Get fresh styles every time by calling the function
        const currentStyles = generateStoryContentStyles();
        styleTag.textContent = currentStyles || '';
        
        document.head.appendChild(styleTag);
      } catch (error) {
        console.error('[Reader] Error injecting styles:', error);
        // Add fallback inline styles to the content container if style injection fails
        const contentContainer = document.querySelector('.story-content');
        if (contentContainer) {
          contentContainer.setAttribute('style', `font-family: ${availableFonts[fontFamily].family}; font-size: ${fontSize}px;`);
        }
      }
    };

    // Debounce style updates to prevent rapid re-renders
    timeoutId = window.setTimeout(applyStyles, 100);
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Clean up styles when component unmounts
      const existingTag = document.getElementById('reader-dynamic-styles');
      if (existingTag) {
        existingTag.remove();
      }
    };
  }, [fontFamily, fontSize, availableFonts, theme]);
  
  // This duplicate has been removed - reading progress tracking is handled above

  
  // Add a useEffect hook to handle deleted posts detection on component mount
  useEffect(() => {
    // Only run this check if we're looking at a specific post by slug
    if (routeSlug && !isLoading && postsData?.posts?.length === 1) {
      const post = postsData.posts[0];
      // Make a direct API request to verify the post still exists
      fetch(`/api/posts/${post.id}`)
        .then(response => {
          if (response.status === 404) {
            console.log('[Reader] Post appears to have been deleted');
            toast({
              title: 'Post Not Available', 
              description: 'This post is no longer available.'
            });
            setLocation('/community');
          }
        })
        .catch(err => {
          console.error('[Reader] Error verifying post exists:', err);
        });
    }
  }, [routeSlug, isLoading, postsData?.posts, setLocation, toast]);

  // Navigation with horror easter egg
  const navigateToPost = (index: number) => {
    if (!postsData?.posts) return;
    
    const totalPosts = postsData.posts.length;
    if (index < 0 || index >= totalPosts) return;
    
    // Check if user is rapidly skipping through content (horror easter egg)
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTimeRef.current;
    
    if (timeSinceLastNavigation < 2000) { // Less than 2 seconds
      skipCountRef.current++;
      
      if (skipCountRef.current >= 5) {
        const horrorMessages = [
          "The stories are watching you skip them...",
          "Why won't you stay and read?",
          "Each skipped story dies a little inside.",
          "They're calling your name from the pages you ignore.",
          "The words you don't read become whispers in the dark.",
          "Are you afraid of what the stories might tell you?",
          "The abandoned tales grow restless...",
          "Stop. Read. Listen. Before it's too late.",
          "The cursor blinks... waiting... always waiting...",
          "You can't escape the words you've left behind."
        ];
        
        const randomMessage = horrorMessages[Math.floor(Math.random() * horrorMessages.length)];
        setHorrorMessageText(randomMessage);
        setShowHorrorMessage(true);
        
        setTimeout(() => setShowHorrorMessage(false), 5000);
        skipCountRef.current = 0; // Reset counter after showing message
      }
    } else {
      skipCountRef.current = 0; // Reset if user slows down
    }
    
    lastNavigationTimeRef.current = now;
    
    setCurrentIndex(index);
    sessionStorage.setItem('selectedStoryIndex', index.toString());
    
    // Smooth scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPost = () => {
    if (!postsData?.posts) return;
    const nextIndex = (currentIndex + 1) % postsData.posts.length;
    navigateToPost(nextIndex);
  };

  const prevPost = () => {
    if (!postsData?.posts) return;
    const prevIndex = currentIndex === 0 ? postsData.posts.length - 1 : currentIndex - 1;
    navigateToPost(prevIndex);
  };

  const randomPost = () => {
    if (!postsData?.posts) return;
    const totalPosts = postsData.posts.length;
    if (totalPosts <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * totalPosts);
    } while (randomIndex === currentIndex);
    
    navigateToPost(randomIndex);
  };

  const refreshPosts = () => {
    console.log('[Reader] Manual refresh requested');
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    // Force a hard refresh of all WordPress content
    queryClient.removeQueries({ queryKey: ["wordpress"] });
    
    toast({
      title: 'Refreshing Stories',
      description: 'Checking for new content...'
    });
  };

  // Calculate current post with safety checks
  const currentPost = postsData?.posts?.[currentIndex] || null;
  
  // Apply theme detection to current post
  const detectedThemes = currentPost ? detectThemes(currentPost.content?.rendered || currentPost.content || '') : [];

  // Extract first few sentences for the excerpt
  const getExcerpt = (content: string, maxLength: number = 250): string => {
    if (!content) return '';
    
    // Remove HTML tags
    const textContent = content.replace(/<[^>]*>/g, '');
    
    if (textContent.length <= maxLength) {
      return textContent;
    }
    
    // Try to break at sentence boundary
    const truncated = textContent.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxLength * 0.6) {
      return textContent.substring(0, lastSentenceEnd + 1);
    }
    
    // Otherwise break at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    return textContent.substring(0, lastSpace) + '...';
  };

  // Share functionality
  const handleShare = async () => {
    if (!currentPost) return;
    
    const shareUrl = `${window.location.origin}/reader/${currentPost.slug || currentPost.id}`;
    const shareTitle = currentPost.title?.rendered || currentPost.title || 'Check out this story';
    const shareText = getExcerpt(currentPost.content?.rendered || currentPost.content || '', 100);
    
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackShare(shareUrl, shareTitle);
      }
    } else {
      fallbackShare(shareUrl, shareTitle);
    }
  };

  const fallbackShare = (url: string, title: string) => {
    navigator.clipboard?.writeText(url);
    toast({
      title: 'Link Copied',
      description: 'Story link copied to clipboard!'
    });
  };

  // Handle UI click - toggle UI visibility
  const handleUIClick = (e: React.MouseEvent) => {
    // Only toggle if we clicked on a non-interactive element
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .no-ui-toggle');
    
    if (!isInteractive) {
      toggleUI();
    }
  };

  // Loading state with themed styling
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ApiLoader isLoading={true} />
      </div>
    );
  }

  // Error state with fallback
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Unable to Load Stories</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={refreshPosts} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // No posts state
  if (!postsData?.posts || postsData.posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Stories Available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
          <Button onClick={refreshPosts} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const totalPosts = postsData.posts.length;

  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen relative transition-all duration-300 ease-in-out"
        onClick={handleUIClick}
        ref={contentRef}
        style={{ 
          fontSize: `${fontSize}px`,
          fontFamily: availableFonts[fontFamily].family,
        }}
      >
        {/* Mist Effect - Always visible but can be controlled */}
        <MistEffect />

        {/* Fixed Progress Bar */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${isUIHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>

        {/* Horror Message Easter Egg */}
        <AnimatePresence>
          {showHorrorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-red-950 border border-red-800 p-8 rounded-lg max-w-md mx-4">
                <CreepyTextGlitch 
                  text={horrorMessageText}
                  className="text-red-100 text-center text-lg font-medium"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Navigation - Top Controls */}
        <motion.div 
          className={`fixed top-4 left-4 right-4 z-40 transition-all duration-300 ${isUIHidden ? 'opacity-0 pointer-events-none translate-y-[-100%]' : 'opacity-100 translate-y-0'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isUIHidden ? 0 : 1, y: isUIHidden ? -20 : 0 }}
        >
          <div className="flex items-center justify-between gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 border shadow-lg">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/')}
                title="Home"
                className="no-ui-toggle"
              >
                <Home className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation('/community')}
                title="Community"
                className="no-ui-toggle"
              >
                <BookText className="h-4 w-4" />
              </Button>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={refreshPosts}
                title="Refresh Stories"
                className="no-ui-toggle"
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground px-2">
                {currentIndex + 1} / {totalPosts}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Font Controls Dialog */}
              <Dialog open={fontDialogOpen} onOpenChange={setFontDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    title="Font Settings"
                    className="no-ui-toggle"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent aria-labelledby="font-dialog-title" aria-describedby="font-dialog-description">
                  <DialogHeader>
                    <DialogTitle id="font-dialog-title">Reading Settings</DialogTitle>
                    <DialogDescription id="font-dialog-description">
                      Adjust font size and family for better reading experience
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Font Size</label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={decreaseFontSize}
                          disabled={fontSize <= 12}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[3rem] text-center text-sm">{fontSize}px</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={increaseFontSize}
                          disabled={fontSize >= 28}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Font Family</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(availableFonts).map(([key, font]) => (
                          <Button
                            key={key}
                            variant={fontFamily === key ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFontFamily(key as FontFamilyKey)}
                            className="text-left justify-start"
                            style={{ fontFamily: font.family }}
                          >
                            {font.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Table of Contents Dialog */}
              <Dialog open={contentsDialogOpen} onOpenChange={setContentsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    title="Table of Contents"
                    className="no-ui-toggle"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" aria-labelledby="toc-dialog-title" aria-describedby="toc-dialog-description">
                  <DialogHeader>
                    <DialogTitle id="toc-dialog-title">Story Navigation</DialogTitle>
                    <DialogDescription id="toc-dialog-description">
                      Jump to any story in the collection
                    </DialogDescription>
                  </DialogHeader>
                  
                  <TableOfContents 
                    currentPostId={currentPost?.id || 0}
                    onClose={() => setContentsDialogOpen(false)}
                    posts={postsData.posts}
                    onSelect={(post) => {
                      const index = postsData.posts.findIndex(p => p.id === post.id);
                      if (index >= 0) {
                        navigateToPost(index);
                      }
                      setContentsDialogOpen(false);
                    }}
                  />

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <ThemeToggleButton />
              
              <MistControl 
                intensity={mistIntensity}
                onChange={setMistIntensity}
              />
            </div>
          </div>
        </motion.div>

        {/* Story Navigation - Bottom Controls */}
        <motion.div 
          className={`fixed bottom-4 left-4 right-4 z-40 transition-all duration-300 ${isUIHidden ? 'opacity-0 pointer-events-none translate-y-[100%]' : 'opacity-100 translate-y-0'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isUIHidden ? 0 : 1, y: isUIHidden ? 20 : 0 }}
        >
          <div className="flex items-center justify-between gap-2 bg-background/90 backdrop-blur-sm rounded-lg p-2 border shadow-lg">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={prevPost}
                title="Previous Story"
                className="no-ui-toggle"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={randomPost}
                title="Random Story"
                className="no-ui-toggle"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={nextPost}
                title="Next Story"
                className="no-ui-toggle"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {currentPost && (
                <>
                  <BookmarkButton 
                    postId={currentPost.id} 
                    className="no-ui-toggle"
                  />
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleShare}
                    title="Share Story"
                    className="no-ui-toggle"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  
                  {/* Delete button for admin or post author */}
                  {isAuthenticated && currentPost && (isAdmin || user?.id === currentPost.authorId) && (
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete Story"
                          className="no-ui-toggle text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
                        <DialogHeader>
                          <DialogTitle id="delete-dialog-title">Delete Story</DialogTitle>
                          <DialogDescription id="delete-dialog-description">
                            Are you sure you want to delete "{currentPost.title?.rendered || currentPost.title || 'this story'}"? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(currentPost.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Reader Tooltip */}
        <ReaderTooltip 
          show={showTooltip && !isUIHidden}
        />

        {/* Swipe Navigation */}
        <SwipeNavigation 
          onNext={nextPost}
          onPrevious={prevPost}
        >
          <div ref={contentRef} className="w-full h-full" />
        </SwipeNavigation>

        {/* Main Content */}
        <main className="relative">
          {currentPost && (
            <article className="max-w-4xl mx-auto px-4 py-8 pt-20 pb-24">
              {/* Story Header */}
              <header className="mb-8 space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {detectedThemes.slice(0, 3).map((theme, index) => {
                    const themeConfig = THEME_CATEGORIES[theme as ThemeCategory];
                    if (!themeConfig) return null;
                    
                    const IconComponent = themeConfig.icon;
                    return (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <IconComponent className="h-3 w-3" />
                        {themeConfig.name}
                      </Badge>
                    );
                  })}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {currentPost.title?.rendered || currentPost.title || 'Untitled Story'}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {currentPost.date && (
                    <time dateTime={currentPost.date}>
                      {format(new Date(currentPost.date), 'MMMM d, yyyy')}
                    </time>
                  )}
                  {currentPost.readingTimeMinutes && (
                    <span>{currentPost.readingTimeMinutes} min read</span>
                  )}
                </div>
              </header>

              {/* Story Content */}
              <div 
                className="story-content prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeHtmlContent(currentPost.content?.rendered || currentPost.content || '') 
                }}
              />

              {/* Story Footer */}
              <footer className="mt-12 pt-8 border-t space-y-6">
                {/* Like/Dislike Controls */}
                {currentPost.id && (
                  <div className="flex items-center gap-4">
                    <LikeDislike 
                      postId={currentPost.id}
                    />
                  </div>
                )}

                {/* Social Share Buttons */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Share:</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/reader/${currentPost.slug || currentPost.id}`;
                        const text = `Check out this story: ${currentPost.title?.rendered || currentPost.title}`;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <FaTwitter className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const url = `${window.location.origin}/reader/${currentPost.slug || currentPost.id}`;
                        window.open(`https://www.instagram.com/`, '_blank');
                      }}
                      className="text-pink-500 hover:text-pink-600"
                    >
                      <FaInstagram className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Support Writing Card */}
                <SupportWritingCard />

                {/* Navigation to Next/Previous Story */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    variant="outline"
                    onClick={prevPost}
                    disabled={!postsData?.posts || postsData.posts.length <= 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous Story
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={nextPost}
                    disabled={!postsData?.posts || postsData.posts.length <= 1}
                  >
                    Next Story
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </footer>

              {/* Comments Section */}
              {currentPost.id && (
                <section className="mt-12 pt-8 border-t">
                  <h3 className="text-xl font-semibold mb-6">Comments</h3>
                  <SimpleCommentSection 
                    postId={currentPost.id}
                  />
                </section>
              )}
            </article>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}