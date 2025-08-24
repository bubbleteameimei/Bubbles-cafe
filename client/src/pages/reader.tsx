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

  // Apply font styles using CSS variables for smooth transitions
  useEffect(() => {
    try {
      console.log('[Reader] Updating font styles with CSS variables:', { fontFamily, fontSize });
      
      // Set CSS variables on the document root for smooth transitions
      const root = document.documentElement;
      root.style.setProperty('--reader-font-family', availableFonts[fontFamily].family);
      root.style.setProperty('--reader-font-size', `${fontSize}px`);
      
      // Apply to story content elements directly for immediate effect
      const storyElements = document.querySelectorAll('.story-content, .story-content p, .story-content .story-paragraph');
      storyElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.fontFamily = availableFonts[fontFamily].family;
          element.style.fontSize = `${fontSize}px`;
        }
      });
    } catch (error) {
      console.error('[Reader] Error applying font styles:', error);
    }
  }, [fontFamily, fontSize, availableFonts]);
  
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

  // Let's make sure we have posts data and current post before rendering
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ApiLoader isLoading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Error Loading Stories</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // Extract posts from data structure
  const posts = postsData?.posts || [];
  
  // Ensure currentIndex is valid
  const validCurrentIndex = Math.max(0, Math.min(currentIndex, posts.length - 1));
  
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Stories Available</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  // Get current post
  const currentPost = posts[validCurrentIndex];
  
  // Story theme icon override (check metadata for themeIcon)
  const postThemeIcon = (currentPost?.metadata as any)?.themeIcon;

  // If post doesn't exist, show error
  if (!currentPost) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Story Not Found</h2>
          <p className="text-muted-foreground">The requested story could not be found.</p>
        </div>
      </div>
    );
  }

  // Apply theme detection to current post
  const detectedThemes = detectThemes(currentPost.content?.rendered || currentPost.content || '');

  // Horror easter egg function
  const checkRapidNavigation = () => {
    const now = Date.now();
    const timeSinceLastNavigation = now - lastNavigationTimeRef.current;
    
    // Check if rapid navigation (less than 1.5 seconds between skips)
    if (timeSinceLastNavigation < 1500) {
      skipCountRef.current += 1;
      
      // After 3 rapid skips, show the horror Easter egg
      if (skipCountRef.current >= 3 && !showHorrorMessage) {
        console.log('[Reader] Horror Easter egg triggered after rapid navigation');
        
        // Highly threatening message for maximum creepiness with subtle psychological impact
        const message = "I SEE YOU SKIPPING!!!";
        setHorrorMessageText(message);
        setShowHorrorMessage(true);
        
        // Show toast with extremely creepy text using maximum intensity
        // The CreepyTextGlitch component has been enhanced for a rapid, unnerving effect
        toast({
          title: "NOTICE",
          description: <CreepyTextGlitch text={message} intensityFactor={8} />, // Maximum intensity
          variant: "destructive",
          duration: 9000, // Extended duration for more psychological impact
        });
        
        // Reset after showing - match the extended toast duration
        setTimeout(() => {
          setShowHorrorMessage(false);
          skipCountRef.current = 0;
        }, 9000); // Extended to match the 9000ms toast duration
      }
    } else {
      // If navigation is slow, gradually reduce the skip count
      skipCountRef.current = Math.max(0, skipCountRef.current - 1);
    }
    
    // Update last navigation time
    lastNavigationTimeRef.current = now;
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
      setCurrentIndex(randomIndex);
      window.scrollTo({ top: 0, behavior: 'auto' }); // Changed to auto for faster scrolling
    }
  };
  
  // Function to navigate to previous story
  const goToPreviousStory = () => {
    // Only execute logic if we have posts and we're not at the first one
    if (posts && posts.length > 1 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      checkRapidNavigation();
      setCurrentIndex(newIndex);
      window.scrollTo({ top: 0, behavior: 'auto' }); // Changed to auto for faster scrolling
    }
  };
  
  // Function to navigate to next story
  const goToNextStory = () => {
    // Only execute logic if we have posts and we're not at the last one
    if (posts && posts.length > 1 && currentIndex < posts.length - 1) {
      const newIndex = currentIndex + 1;
      checkRapidNavigation();
      setCurrentIndex(newIndex);
      window.scrollTo({ top: 0, behavior: 'auto' }); // Changed to auto for faster scrolling
    }
  };
  
  // Check if we're at first or last story
  const isFirstStory = currentIndex === 0;
  const isLastStory = currentIndex === posts.length - 1;

  // We've moved the swipe navigation logic to a dedicated component
  // This avoids hook execution order issues by keeping related logic in a single component

  // The theme and toggleTheme functions are already declared at the top of the component
  
  return (
    <div className="relative min-h-screen bg-background reader-page overflow-visible pt-16 sm:pt-16 md:pt-18 lg:pt-20 pb-8 flex flex-col"
      /* Added enhanced background-related styling directly here */
      data-reader-page="true" 
      data-distraction-free={isUIHidden ? "true" : "false"}>
      
      {/* Reader page has no background image, just clean default background */}
      
      {/* Reading Progress Bar - Always visible at the very top */}
      <div 
        style={{ 
          position: 'fixed',
          top: '0px',
          left: '0px',
          right: '0px',
          width: '100%',
          height: '3px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
        <div 
          style={{ 
            height: '100%',
            width: `${readingProgress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            transition: 'width 0.1s ease-out',
            boxShadow: readingProgress > 5 ? '0 0 10px rgba(59, 130, 246, 0.7)' : 'none'
          }}
        />
      </div>
      
      {/* Reader tooltip for distraction-free mode instructions */}
      <ReaderTooltip show={showTooltip} />
      {/* CSS for distraction-free mode transitions */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Transitions for UI elements */
        /* Keep the UI elements accessible but subtle in distraction-free mode */
        .ui-fade-element {
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: opacity, visibility;
        }
        .ui-hidden {
          opacity: 0.15; /* Barely visible but still accessible */
          pointer-events: auto; /* Keep interactive */
        }
        /* Show on hover for better UX */
        .ui-hidden:hover {
          opacity: 0.9;
          transition: opacity 0.2s ease;
        }
        .story-content {
          transition: width 0.8s ease-in-out;
        }
        .distraction-free-active .story-content {
          width: 100%;
        }
        
        /* Only target the navigation header and not the controls in distraction-free mode */
        .reader-page[data-distraction-free="true"] header.main-header {
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none; /* Prevent interaction with hidden header */
          transform: translateY(-100%);
          will-change: opacity, transform, visibility;
        }
        
        /* Tiny indicator for mobile when in distraction-free mode */
        .reader-page[data-distraction-free="true"]::after {
          content: "↑ Tap to exit";
          position: fixed;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--background);
          color: var(--muted-foreground);
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 4px;
          opacity: 0.6;
          pointer-events: none;
          z-index: 30;
          border: 1px solid var(--border);
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

      {/* Horror message modal */}
      {showHorrorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md"
          // Removed onClick handler to prevent closing by clicking outside
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className="relative bg-background/95 p-6 rounded-lg shadow-xl w-[90%] max-w-full text-center border border-[#ff0000]/80"
          >
            <div className="absolute inset-0 rounded-lg bg-[#ff0000]/10 animate-pulse" />
            <div className="relative z-10">
              <div className="mb-6">
                <CreepyTextGlitch 
                  text={horrorMessageText} 
                  className="text-4xl font-bold"
                  intensityFactor={8} // Maximum intensity for an extremely disturbing effect
                />
              </div>
              {/* The button is wrapped in a div with no animations to keep it stable */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="border-[#ff0000]/60 bg-background hover:bg-background/90 text-foreground w-full py-6"
                  onClick={() => setShowHorrorMessage(false)}
                >
                  <span className="mx-auto text-lg font-medium">I understand, I'm sorry</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Overlay to prevent interaction with the page when horror message is shown */}
      {showHorrorMessage && (
        <div 
          className="fixed inset-0 z-[999]" 
          style={{ pointerEvents: 'all' }}
          aria-hidden="true"
          /* This div blocks all interactions with the page behind it */
        />
      )}
      
      {/* Reading progress indicator - always visible for user orientation */}
      <div 
        className="fixed top-0 left-0 z-50 h-1 bg-primary/70"
        style={{ 
          width: `${readingProgress}%`, 
          transition: 'width 0.2s ease-out'
        }}
        aria-hidden="true"
      />
      
      {/* Floating pagination has been removed */}
      
      {/* Navigation buttons removed as requested */}
      {/* Full width immersive reading experience */}

      <div className={`pt-0 pb-0 bg-background mt-0 w-full overflow-visible ${isUIHidden ? 'distraction-free-active' : ''}`}>
        {/* Static font size controls in a prominent position - minimal spacing */}
        <div className={`flex justify-between items-center px-2 md:px-8 lg:px-12 z-10 py-1 border-b border-border/30 mb-1 w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
          {/* Font controls using the standard Button component */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 transition-all duration-300 hover:scale-105"
              aria-label="Decrease font size"
            >
              <Minus className="h-4 w-4 mr-1" />
              A-
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={fontSize >= 20}
              className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20 transition-all duration-300 hover:scale-105"
              aria-label="Increase font size"
            >
              A+
              <Plus className="h-4 w-4 ml-1" />
            </Button>
            
            {/* Font Dialog with controlled open state */}
            <Dialog open={fontDialogOpen} onOpenChange={setFontDialogOpen}>
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

          {/* Narration button */}
          <div className="flex-grow"></div>

          {/* Theme toggle button removed as requested */}

          {/* Integrated BookmarkButton in top controls */}
          <BookmarkButton 
            postId={currentPost.id} 
            variant="reader"
            showText={false}
            className="h-8 w-8 rounded-full bg-background hover:bg-background/80 mx-2 cursor-pointer"
          />

          {/* Text-to-speech functionality removed */}

          {/* Contents Dialog with controlled open state - non-fullscreen with close button */}
          <Dialog open={contentsDialogOpen} onOpenChange={setContentsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center gap-1.5 min-w-0 max-w-[120px] overflow-hidden transition-all duration-200 hover:scale-105 rounded-md"
              >
                <BookText className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs font-semibold tracking-wide">TOC</span>
              </Button>
            </DialogTrigger>
            {/* Wrap the TableOfContents component to ensure DialogContent has proper aria attributes */}
            <DialogContent 
              className="max-w-md" 
              aria-labelledby="toc-dialog-title" 
              aria-describedby="toc-dialog-description"
            >
              <div className="flex items-center justify-between">
                <DialogTitle id="toc-dialog-title">Table of Contents</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </DialogClose>
              </div>
              <DialogDescription id="toc-dialog-description">Browse all available stories</DialogDescription>
              <TableOfContents 
                currentPostId={currentPost.id} 
                onClose={() => setContentsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      
        <article
            key={currentPost.id}
            className="prose dark:prose-invert px-6 md:px-6 pt-0 w-full max-w-none"
          >
            {/* Navigation buttons above story content */}
            <div className={`flex justify-center items-center gap-4 py-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousStory}
                disabled={posts.length <= 1 || isFirstStory}
                className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToRandomStory}
                disabled={posts.length <= 1}
                className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
              >
                <Shuffle className="h-4 w-4 mr-1" />
                Random
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextStory}
                disabled={posts.length <= 1 || isLastStory}
                className="h-9 px-4 bg-background/80 hover:bg-background/60 border-border/50 disabled:opacity-30"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

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
                    {(isAdmin || (isCommunityContent && user?.id === currentPost?.authorId)) && isCommunityContent && (
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
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(currentPost.title?.rendered || currentPost.title || 'Story') }}
                />
              </div>
              
              {/* Story Delete Dialog */}
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <Trash className="h-5 w-5 mr-2 text-red-500" />
                      {isAdmin && user?.id !== currentPost?.authorId ? 
                        "Delete Community Story" : 
                        "Delete Your Story"}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-sm">
                      {isAdmin && user?.id !== currentPost?.authorId ? 
                        "As an admin, you are about to delete a user-submitted community story. This action cannot be undone." : 
                        "You are about to delete your community story. This action cannot be undone."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center justify-between border p-3 rounded-md bg-muted/50 mt-2">
                    <div className="font-medium truncate pr-2">
                      {currentPost.title?.rendered || currentPost.title || 'Story'}
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
                <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm text-muted-foreground backdrop-blur-sm bg-background/20 px-3 sm:px-4 py-1 rounded-full shadow-sm border border-primary/10 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  {/* Story theme category with icon */}
                  {detectedThemes.length > 0 ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                      {(() => {
                        // Get the primary theme (first one as it's sorted by relevance)
                        const primaryTheme = detectedThemes[0];
                        // Safely get the theme information with fallback
                        const themeInfo = primaryTheme && 
                          Object.prototype.hasOwnProperty.call(THEME_CATEGORIES, primaryTheme) 
                            ? THEME_CATEGORIES[primaryTheme as keyof typeof THEME_CATEGORIES] 
                            : {
                                icon: 'Ghost',
                                badgeVariant: 'default',
                                keywords: [],
                                description: 'Horror Fiction',
                                visualEffects: []
                              };
                        
                        const ThemeIcon = (() => {
                          // First check if we have a custom icon from the post
                          if (postThemeIcon) {
                            // Try to find the icon in our import list
                            switch(postThemeIcon.toLowerCase()) {
                              case 'skull': return Skull;
                              case 'brain': return Brain;
                              case 'pill': return Pill;
                              case 'cpu': return Cpu;
                              case 'dna': return Dna;
                              case 'ghost': return Ghost;
                              case 'footprints': return Footprints;
                              case 'cloud-rain': 
                              case 'cloudrain': return CloudRain;
                              case 'castle': return Castle;
                              case 'bug': return Bug;
                              case 'radiation': return Radiation;
                              case 'umbrella': return Umbrella;
                              case 'userminus2': 
                              case 'user-minus2': return UserMinus2;
                              case 'anchor': return Anchor;
                              case 'alerttriangle': 
                              case 'alert-triangle': return AlertTriangle;
                              case 'building': return Building;
                              case 'worm': return Worm;
                              case 'cloud': return Cloud;
                              case 'cloudfog': 
                              case 'cloud-fog': return CloudFog;
                              default: return Ghost; // Default fallback
                            }
                          }
                          
                          // If no custom icon, fall back to the theme definition
                          // Ensure themeInfo and themeInfo.icon exist before using them
                          if (!themeInfo || !themeInfo.icon) {
                            return Ghost; // Default fallback if themeInfo or icon is missing
                          }
                          
                          switch(themeInfo.icon) {
                            case 'skull': 
                            case 'Skull': return Skull;
                            case 'brain': 
                            case 'Brain': return Brain;
                            case 'pill': 
                            case 'Pill': return Pill;
                            case 'cpu': 
                            case 'Cpu': return Cpu;
                            case 'dna': 
                            case 'Dna': return Dna;
                            case 'ghost': 
                            case 'Ghost': return Ghost;
                            case 'cross': 
                            case 'Cross': return Cross;
                            case 'car': 
                            case 'Car': return ChevronRight; // Temporary fallback for Car icon
                            case 'footprints': 
                            case 'Footprints': return Footprints;
                            case 'cloudrain': 
                            case 'CloudRain': return CloudRain;
                            case 'castle': 
                            case 'Castle': return Castle;
                            case 'bug': 
                            case 'Bug': return Bug;
                            case 'radiation': 
                            case 'Radiation': return Radiation;
                            case 'umbrella': 
                            case 'Umbrella': return Umbrella;
                            case 'userminus2': 
                            case 'UserMinus2': return UserMinus2;
                            case 'anchor': 
                            case 'Anchor': return Anchor;
                            case 'alerttriangle': 
                            case 'AlertTriangle': return AlertTriangle;
                            case 'building': 
                            case 'Building': return Building;
                            case 'worm': 
                            case 'Worm': return Worm;
                            case 'cloud': 
                            case 'Cloud': return Cloud;
                            case 'cloudfog': 
                            case 'CloudFog': return CloudFog;
                            default: return Ghost; // Default fallback
                          }
                        })();

                        return (
                          <>
                            <ThemeIcon className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium">{primaryTheme}</span>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                      <Ghost className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Horror Fiction</span>
                    </div>
                  )}
                  
                  <span className="text-muted-foreground">•</span>
                  
                  {/* Date indicator */}
                  <span className="text-xs px-2 py-1 bg-muted/50 rounded-md">
                    {currentPost.date ? format(new Date(currentPost.date), 'MMM d, yyyy') : 'No date'}
                  </span>
                  
                  <span className="text-muted-foreground">•</span>
                  
                  {/* Estimated reading time */}
                  <span className="text-xs px-2 py-1 bg-accent/50 rounded-md">
                    {currentPost.readingTimeMinutes || '~5'} min read
                  </span>
                </div>

                {/* Reader controls under time-to-read */}
                <div className={`w-full mt-8 sm:mt-10 ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={goToPreviousStory}
                      className="px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors border border-border/50"
                      disabled={showHorrorMessage || posts.length <= 1}
                    >
                      Previous
                    </button>
                    <button
                      onClick={goToNextStory}
                      className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      disabled={showHorrorMessage || posts.length <= 1}
                    >
                      Next
                    </button>
                    <button
                      onClick={goToRandomStory}
                      className="px-4 py-2 rounded-md bg-accent text-foreground hover:bg-accent/80 transition-colors border border-border/50"
                      disabled={showHorrorMessage || posts.length <= 1}
                    >
                      Random
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content needs to be wrapped in a SwipeNavigation component */}
            <SwipeNavigation
              onPrevious={goToPreviousStory}
              onNext={goToNextStory}
              disabled={showHorrorMessage || posts.length <= 1}
            >
              <div className="story-container mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <div 
                  className="story-content cursor-pointer text-justify"
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHtmlContent(currentPost.content?.rendered || currentPost.content || 'No content available.') 
                  }}
                  onClick={toggleUI}
                  style={{ fontSize: `${fontSize}px` }}
                />
              </div>
            </SwipeNavigation>
            
            {/* Simple pagination at bottom of story content - compact and tighter */}
            <div className={`flex items-center justify-center gap-2 mb-6 mt-4 w-full text-center ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-full py-1 px-2 shadow-md">
                {/* Previous story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousStory}
                  className="h-6 w-6 rounded-full hover:bg-background/80 group relative disabled:opacity-70 disabled:bg-gray-100/50"
                  aria-label="Previous story"
                  disabled={posts.length <= 1 || isFirstStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Previous
                  </span>
                </Button>
                
                {/* Story counter */}
                <div className="px-1.5 text-xs text-muted-foreground font-medium">
                  {currentIndex + 1}/{posts.length}
                </div>
                
                {/* Next story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextStory}
                  className="h-6 w-6 rounded-full hover:bg-background/80 group relative disabled:opacity-70 disabled:bg-gray-100/50"
                  aria-label="Next story"
                  disabled={posts.length <= 1 || isLastStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Next
                  </span>
                </Button>
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-border/50">
              <div className="flex flex-col items-center justify-center gap-6">
                {/* Centered Like/Dislike buttons */}
                <div className={`flex justify-center w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <LikeDislike postId={currentPost.id} />
                </div>

                <div className={`flex flex-col items-center gap-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  <p className="text-sm text-muted-foreground font-medium">✨ Loved the story? Share it or follow for more! ✨</p>
                  <div className="flex items-center gap-3">
                    {/* Native Share Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: currentPost.title?.rendered || currentPost.title || 'Story',
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
                          const tweetText = `Check out this story: ${currentPost.title?.rendered || currentPost.title || 'Story'} ${window.location.href}`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
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
                          const wpUrl = `https://wordpress.com/wp-admin/press-this.php?u=${encodeURIComponent(window.location.href)}&t=${encodeURIComponent(currentPost.title?.rendered || currentPost.title || 'Story')}`;
                          window.open(wpUrl, '_blank');
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaWordpress className="h-4 w-4" />
                        <span className="sr-only">Follow on WordPress</span>
                      </Button>
                      
                      {/* Instagram */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({
                            title: "Link Copied",
                            description: "Story link copied to clipboard for Instagram sharing!"
                          });
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                      >
                        <FaInstagram className="h-4 w-4" />
                        <span className="sr-only">Follow on Instagram</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social sharing and support section  */}
            <div className={`social-support-section mt-8 pt-6 border-t border-border ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              
              {/* Support writing card */}
              <SupportWritingCard />
            </div>

            {/* Comment section */}
            <div className={`mt-8 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <SimpleCommentSection postId={currentPost.id} />
            </div>
        </article>
      </div>
    </div>
  );
}