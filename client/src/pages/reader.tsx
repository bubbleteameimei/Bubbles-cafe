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

// Create a utility function to sanitize HTML content 
const sanitizeHtmlContent = (html: string): string => {
  try {
    // Convert markdown-style italics (_text_) to HTML <em> tags
    // Look for text surrounded by underscores that doesn't have spaces immediately after/before the underscores
    // This avoids replacing underscores in URLs or other non-italic contexts
    html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');
    
    // Ensure proper paragraph spacing by adding an additional class to paragraphs
    // This helps preserve spacing even when content is sanitized
    html = html.replace(/<p>/g, '<p class="story-paragraph">');
    
    // Fix specific spacing issues by ensuring paragraphs are properly separated
    // Replace multiple consecutive line breaks with proper paragraph tags
    html = html.replace(/(\r?\n){2,}/g, '</p><p class="story-paragraph">');
    
    // Create a simple HTML sanitization function
    // This removes potentially harmful scripts and keeps only safe content
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Remove script tags
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Get the sanitized content
    return doc.body.innerHTML;
  } catch (error) {
    console.error('[Reader] Error sanitizing HTML:', error);
    // Return the original HTML if there's an error parsing it
    return html;
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
  
  // Reading progress is now only tracked visually, without saving position
  
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
    queryKey: ["wordpress", "posts", "reader", routeSlug, isCommunityContent ? "community" : "regular"],
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
          // Otherwise fetch all posts
          try {
            // Try to fetch from internal API first
            const response = await fetch('/api/posts?limit=100');
            if (response.ok) {
              const data = await response.json();
              const normalizedPosts = data.posts.map((post: any) => ({
                ...post,
                title: {
                  rendered: post.title?.rendered || post.title || ''
                },
                content: {
                  rendered: post.content?.rendered || post.content || ''
                },
                date: post.date || post.createdAt || new Date().toISOString()
              }));
              return { posts: normalizedPosts, totalPages: 1, total: normalizedPosts.length };
            }
          } catch (err) {
            console.log('[Reader] Error fetching from internal API, trying WordPress API');
          }
          
          // Fallback to WordPress API
          const data = await fetchWordPressPosts({ page: 1, perPage: 100 });
          console.log('[Reader] Posts fetched successfully:', {
            totalPosts: data.posts?.length,
            totalPages: data.totalPages
          });
          return data;
        }
      } catch (error) {
        console.error('[Reader] Error fetching posts:', error);
        // Add fallback error handling here
        console.error('[Reader] Error or no posts available:', { error, currentIndex });
        
        // Try to fetch any posts to show something
        try {
          // Try to fetch community posts if that's what we're looking for
          const endpoint = isCommunityContent ? '/api/posts/community?limit=1' : '/api/posts?limit=1';
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
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
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

  // Apply styles effect
  useEffect(() => {
    try {
      console.log('[Reader] Injecting content styles with font family:', fontFamily);
      const styleTag = document.createElement('style');
      styleTag.id = 'reader-dynamic-styles';
      
      // Get fresh styles every time by calling the function
      const currentStyles = generateStoryContentStyles();
      styleTag.textContent = currentStyles || '';
      
      // Remove any existing style tag with the same ID to prevent duplicates
      const existingTag = document.getElementById('reader-dynamic-styles');
      if (existingTag) {
        existingTag.remove();
      }
      
      document.head.appendChild(styleTag);
      return () => {
        if (styleTag && styleTag.parentNode) {
          styleTag.remove();
        }
      };
    } catch (error) {
      console.error('[Reader] Error injecting styles:', error);
      // Add fallback inline styles to the content container if style injection fails
      const contentContainer = document.querySelector('.story-content');
      if (contentContainer) {
        contentContainer.setAttribute('style', `font-family: ${availableFonts[fontFamily].family}; font-size: ${fontSize}px;`);
      }
    }
  }, [fontFamily, fontSize, availableFonts, theme]);
  
  // Handle reading progress with visual progress bar only (no position saving)
  // Using the older, simpler implementation for smoother scrolling
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      // Avoid division by zero
      if (totalHeight > 0) {
        const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
        setReadingProgress(progress);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initial calculation
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  
  // Add a useEffect hook to handle deleted posts detection on component mount
  useEffect(() => {
    // Only run this check if we're looking at a specific post by slug
    if (routeSlug && !isLoading && postsData?.posts?.length === 1) {
      const post = postsData.posts[0];
      // Make a direct API request to verify the post still exists
      // Use the slugOrId endpoint which handles both IDs and slugs correctly
      fetch(`/api/posts/${post.id}`)
        .then(response => {
          if (response.status === 404) {
            console.log('[Reader] Post no longer exists in the database, redirecting');
            toast({
              title: 'Story Unavailable',
              description: 'This story is no longer available.'
            });
            // Immediate navigation to prevent the deleted content from being displayed
            setLocation('/community');
          }
        })
        .catch(error => {
          console.error('[Reader] Error verifying post existence:', error);
        });
    }
  }, [routeSlug, isLoading, postsData, setLocation, toast]);

  // Use our ApiLoader component to handle loading state with the global context
  if (isLoading) {
    return (
      <div className="relative min-h-[200px]">
        <ApiLoader 
          isLoading={true}
          message="Loading story..."
          minimumLoadTime={800}
          debug={true}
          overlayZIndex={100}
        >
          <div className="invisible">
            <div className="h-[200px] w-full flex items-center justify-center">
              <span className="sr-only">Loading story content...</span>
            </div>
          </div>
        </ApiLoader>
      </div>
    );
  }

  if (error || !postsData?.posts || postsData.posts.length === 0) {
    console.error('[Reader] Error or no posts available:', {
      error,
      postsCount: postsData?.posts?.length,
      currentIndex
    });
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Unable to load stories</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
        <Button variant="outline" onClick={() => {
          console.log('[Reader] Retrying page load');
          window.location.reload();
        }}>
          Retry
        </Button>
      </div>
    );
  }

  const posts = postsData.posts;

  // Additional validation before rendering
  if (currentIndex < 0 || currentIndex >= posts.length) {
    console.error('[Reader] Invalid current index:', {
      currentIndex,
      totalPosts: posts.length,
      savedIndex: sessionStorage.getItem('selectedStoryIndex')
    });
    setCurrentIndex(0);
    return null; // ApiLoader will handle the loading state
  }

  const currentPost = posts[currentIndex];

  if (!currentPost) {
    console.error('[Reader] No post found:', {
      currentIndex,
      totalPosts: posts.length,
      savedIndex: sessionStorage.getItem('selectedStoryIndex')
    });
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Story Not Found</h2>
        <p className="text-muted-foreground mb-4">
          Unable to load the requested story. Please try again from the home page.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => {
              console.log('[Reader] Returning to home');
              sessionStorage.removeItem('selectedStoryIndex');
              setLocation('/');
            }}
          >
            Return to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log('[Reader] Browsing stories');
              sessionStorage.removeItem('selectedStoryIndex');
              setLocation('/');
            }}
          >
            Browse Stories
          </Button>
        </div>
      </div>
    );
  }

  // Add error handling for date parsing to prevent "Invalid time value" errors
  let formattedDate = '';
  try {
    if (currentPost.date) {
      formattedDate = format(new Date(currentPost.date), 'MMMM d, yyyy');
    } else {
      formattedDate = 'Publication date unavailable';
    }
  } catch (error) {
    console.error('[Reader] Error formatting date:', error);
    formattedDate = 'Publication date unavailable';
  }
  
  // Use theme from post or detect from content
  const postThemeCategory = currentPost.themeCategory;
  // Get icon from direct property or metadata
  const postThemeIcon = currentPost.themeIcon || 
                       (currentPost.metadata && (currentPost.metadata as any).themeIcon);
  
  // Detect themes from content as fallback if no theme is assigned
  const detectedThemes = postThemeCategory 
    ? [postThemeCategory] 
    : detectThemes(currentPost.content?.rendered || currentPost.content || '');

  const handleSocialShare = (platform: string, url: string) => {
    try {
      console.log(`[Reader] Opening ${platform} profile`);
      window.open(url, '_blank');
    } catch (error) {
      console.error(`[Reader] Error opening ${platform}:`, error);
    }
  };

  const shareStory = async () => {
    const displayTitle = currentPost.title?.rendered || currentPost.title || 'Story';
    console.log('[Reader] Attempting native share:', displayTitle);
    const shareText = isCommunityContent 
      ? "Check out this community story on Bubble's Café!" 
      : "Check out this story on Bubble's Café!";
    const shareData = {
      title: displayTitle,
      text: shareText,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('[Reader] Story shared successfully');
      } else {
        console.log('[Reader] Native share not supported');
      }
    } catch (error) {
      console.error('[Reader] Error sharing story:', error);
    }
  };

  const socialLinks = [
    {
      key: 'wordpress',
      Icon: FaWordpress,
      url: 'http://bubbleteameimei.wordpress.com'
    },
    {
      key: 'twitter',
      Icon: FaTwitter,
      url: 'https://twitter.com/Bubbleteameimei'
    },
    {
      key: 'instagram',
      Icon: FaInstagram,
      url: 'https://instagram.com/Bubbleteameimei'
    }
  ];

  const unusedStyles = `
  .story-content {
    font-family: ${availableFonts[fontFamily].family};
    width: 100%; /* Full width instead of max-width constraint */
    margin: 0 auto;
    color: hsl(var(--foreground));
    transition: color 0.3s ease, background-color 0.3s ease;
  }
  .story-content p, .story-content .story-paragraph {
    line-height: 1.7;  /* Improved line height for readability */
    margin-bottom: 1.7em;  /* Restored paragraph spacing to improve readability */
    text-align: justify;
    letter-spacing: 0.01em; /* Subtle letter spacing */
    font-kerning: normal; /* Improves kerning pairs */
    font-feature-settings: "kern", "liga", "clig", "calt"; /* Typography features */
    max-width: none; /* Remove width constraint for full-width layout */
    margin-left: auto;
    margin-right: auto;
    font-family: ${availableFonts[fontFamily].family};
  }
  .story-content em {
    font-family: ${availableFonts[fontFamily].family};
    font-style: italic;
    font-size: 1em;
    line-height: 1.7;
    letter-spacing: 0.01em;
    font-weight: 500;
  }
  /* Add clear paragraph separation as per user request */
  .story-content p + p {
    margin-top: 0; /* No additional top margin as we have sufficient bottom margin */
    text-indent: 0; /* No indent to maintain modern style */
  }
  /* Ensure all paragraphs have equal styling */
  .story-content p:first-of-type {
    font-size: 1em; /* Same size as other paragraphs */
  }
  /* Break words properly for better readability */
  .story-content p {
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
  @media (max-width: 768px) {
    .story-content p, .story-content .story-paragraph {
      margin-bottom: 1.5em; /* Slightly reduced on mobile but still maintaining good spacing */
      line-height: 1.75; /* Slightly increased on mobile for readability */
      font-family: ${availableFonts[fontFamily].family};
    }
  }
  .story-content img {
    max-width: 100%;
    height: auto;
    margin: 2em auto;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
  }
  .story-content img:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  .story-content h1, .story-content h2, .story-content h3 {
    margin-top: 1.8em;
    margin-bottom: 0.8em;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.3;
    position: relative;
    font-family: ${availableFonts[fontFamily].family};
  }
  .story-content h2::before, .story-content h3::before {
    content: "";
    position: absolute;
    left: -1rem;
    top: 0.5em;
    height: 0.5em;
    width: 0.5em;
    background-color: hsl(var(--primary) / 0.6);
    border-radius: 50%;
  }
  .story-content ul, .story-content ol {
    margin-bottom: 1.5em;
    padding-left: 1.8em;
  }
  .story-content li {
    margin-bottom: 0.6em;
    position: relative;
  }
  .story-content blockquote {
    margin: 2em 0;
    padding: 1.2em 1.5em 1.2em 2em;
    border-left: 4px solid hsl(var(--primary) / 0.7);
    font-style: italic;
    background-color: hsl(var(--muted) / 0.5);
    border-radius: 0.375rem;
    position: relative;
    font-size: 1.05em;
    line-height: 1.7;
  }
  .story-content blockquote::before {
    content: """;
    position: absolute;
    left: 0.5em;
    top: 0.1em;
    font-size: 2.5em;
    color: hsl(var(--primary) / 0.3);
    font-family: Georgia, serif;
    line-height: 1;
  }
  .dark .story-content blockquote {
    background-color: hsl(var(--muted) / 0.2);
  }
  .story-content a {
    color: hsl(var(--primary));
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    transition: color 0.2s ease, text-decoration-thickness 0.2s ease;
  }
  .story-content a:hover {
    color: hsl(var(--primary) / 0.8);
    text-decoration-thickness: 2px;
  }
  /* Add subtle text selection styling */
  .story-content ::selection {
    background-color: hsl(var(--primary) / 0.2);
    color: hsl(var(--foreground));
  }
  /* Hide any WordPress specific elements */
  .story-content .wp-caption,
  .story-content .wp-caption-text,
  .story-content .gallery-caption {
    font-family: var(--font-sans);
    font-size: 0.85em;
    text-align: center;
    color: hsl(var(--muted-foreground));
    margin-top: -1em;
    margin-bottom: 2em;
  }
  /* Improve hr styling */
  .story-content hr {
    margin: 3em auto;
    height: 2px;
    background-color: hsl(var(--border));
    border: none;
    width: 40%;
    opacity: 0.6;
  }
  `;

  // Navigation functions
  // Function to track rapid navigation and show horror Easter egg
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
        {/* Static font size controls in a prominent position - reduced mobile spacing */}
        <div className={`flex justify-between items-center px-2 md:px-8 lg:px-12 z-10 py-0.5 sm:py-2 border-b border-border/30 mb-0 sm:mb-1 w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
          {/* Font controls using the standard Button component */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20"
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
              className="h-8 px-3 bg-primary/5 hover:bg-primary/10 shadow-md border-primary/20"
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
            className="h-8 w-8 rounded-full bg-background hover:bg-background/80 mx-2"
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
                  dangerouslySetInnerHTML={{ __html: currentPost.title?.rendered || currentPost.title || 'Story' }}
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
                  {/* Story theme icon - show primary theme if available, otherwise default to generic */}
                  {detectedThemes.length > 0 ? (
                    <div className="flex items-center gap-1.5">
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
                            case 'cloud-rain': 
                            case 'CloudRain': return CloudRain;
                            case 'castle': 
                            case 'Castle': return Castle;
                            case 'utensils': 
                            case 'Utensils': return BookOpen; // Temporary fallback for Utensils icon
                            case 'bug': 
                            case 'Bug': return Bug;
                            case 'knife': 
                            case 'Knife': return Ghost; // Temporary fallback for Knife icon
                            case 'scan': 
                            case 'Scan': return Cpu; // Temporary fallback for Scan icon
                            case 'AlertTriangle': return AlertTriangle;
                            case 'Copy': return RefreshCcw; // Temporary fallback for Copy icon
                            default: return Bug;
                          }
                        })();
                        
                        return (
                          <>
                            <ThemeIcon className="h-4 w-4 text-primary/80" />
                            <span className="font-medium text-primary/80 whitespace-nowrap text-xs sm:text-sm">{primaryTheme}</span>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-primary/80" />
                      <span className="font-medium text-primary/80 whitespace-nowrap text-xs sm:text-sm">Fiction</span>
                    </div>
                  )}
                  <span className="text-muted-foreground/30">•</span>
                  <time className="font-medium whitespace-nowrap text-xs sm:text-sm">{formattedDate}</time>
                </div>

                {/* Navigation Buttons - reduced vertical spacing */}
                <div className={`flex items-center justify-center mt-0.5 sm:mt-2 gap-2 w-full ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousStory}
                    className={`h-8 px-2 bg-background hover:bg-background/80 w-24 disabled:opacity-70 disabled:bg-gray-100/50 disabled:border-gray-200/50`}
                    disabled={posts.length <= 1 || isFirstStory}
                    title={isFirstStory ? "This is the first story" : "Go to previous story"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                      <path d="m15 18-6-6 6-6"/>
                    </svg>
                    Previous
                  </Button>
                  
                  {/* Random Story Button (smaller without text) */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToRandomStory}
                    className={`h-8 w-8 px-0 rounded-full bg-primary/10 hover:bg-primary/20 border-none disabled:opacity-70 disabled:bg-gray-100/50`}
                    disabled={posts.length <= 1}
                    aria-label="Random Story"
                    title={posts.length <= 1 ? "Need more stories to use random" : "Go to a random story"}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  
                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextStory}
                    className={`h-8 px-2 bg-background hover:bg-background/80 w-24 disabled:opacity-70 disabled:bg-gray-100/50 disabled:border-gray-200/50`}
                    disabled={posts.length <= 1 || isLastStory}
                    title={isLastStory ? "This is the last story" : "Go to next story"}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 ml-1">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            <SwipeNavigation
              onPrevious={goToPreviousStory}
              onNext={goToNextStory}
              disabled={!(posts && posts.length > 1)}
              minSwipeDistance={70}
            >
              <div
                ref={contentRef}
                className="reader-container story-content mb-8 w-full overflow-visible flex-1"
                style={{
                  whiteSpace: 'normal',
                  letterSpacing: '0.012em',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  overflow: 'visible',
                  margin: '10px 0',
                  lineHeight: '1.8',
                  textAlign: 'left',
                  fontSize: '1.2rem',
                  cursor: 'pointer', // Explicitly set cursor to pointer for this element
                  padding: '0 0.5rem' // Slight padding on both sides
                }}
                onClick={toggleUI} // Only story content toggles UI
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtmlContent(currentPost.content?.rendered || currentPost.content || '')
                }}
              />
            </SwipeNavigation>
            
            {/* Simple pagination at bottom of story content - extremely compact */}
            <div className={`flex items-center justify-center gap-3 mb-6 mt-4 w-full text-center ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`}>
              <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md border border-border/50 rounded-full py-1.5 px-3 shadow-md">
                {/* Previous story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousStory}
                  className="h-8 w-8 rounded-full hover:bg-background/80 group relative disabled:opacity-70 disabled:bg-gray-100/50"
                  aria-label="Previous story"
                  disabled={posts.length <= 1 || isFirstStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Previous Story
                  </span>
                </Button>
                
                {/* Story counter */}
                <div className="px-2 text-xs text-muted-foreground font-medium">
                  {currentIndex + 1} of {posts.length}
                </div>
                
                {/* Next story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToNextStory}
                  className="h-8 w-8 rounded-full hover:bg-background/80 group relative disabled:opacity-70 disabled:bg-gray-100/50"
                  aria-label="Next story"
                  disabled={posts.length <= 1 || isLastStory}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Next Story
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
                      onClick={shareStory}
                      className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>

                    {/* Social Icons - Lazy loaded */}
                    <ErrorBoundary fallback={
                      <div className="flex gap-3">
                        {[1, 2, 3].map(i => (
                          <Button key={i} variant="outline" size="icon" disabled
                            className="h-9 w-9 rounded-full cursor-not-allowed opacity-50">
                            <span className="sr-only">Social icon (unavailable)</span>
                          </Button>
                        ))}
                      </div>
                    }>
                      <div className="flex gap-3">
                        {socialLinks.map(({ key, Icon, url }) => (
                          <Button
                            key={key}
                            variant="outline"
                            size="icon"
                            onClick={() => handleSocialShare(key, url)}
                            className="h-9 w-9 rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                          >
                            <Icon className="h-4 w-4" />
                            <span className="sr-only">Follow on {key}</span>
                          </Button>
                        ))}
                      </div>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>

              {/* Comment Section with improved aesthetic styling - no fading */}
              <div className="mt-10 pt-6 border-t border-border/30">
                <div className="bg-background/50 backdrop-blur-md p-6 rounded-xl border border-border/20 shadow-lg">
                  <div className="flex flex-col gap-2 mb-6">
                    <h3 className="text-2xl font-medium tracking-tight flex items-center gap-2">
                      <span className="relative inline-block">
                        Discussion
                        <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary/40 rounded-full"></span>
                      </span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Join the conversation and share your thoughts about this story.
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 rounded-full"></div>
                    <ErrorBoundary fallback={
                      <div className="p-4 border border-destructive/10 bg-destructive/5 rounded-lg">
                        <h4 className="font-medium text-destructive mb-2">Comments Unavailable</h4>
                        <p className="text-sm text-muted-foreground">
                          We're having trouble loading the comments section. Please try refreshing the page.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => window.location.reload()}
                        >
                          <RefreshCcw className="h-3 w-3 mr-2" />
                          Try again
                        </Button>
                      </div>
                    }>
                      <SimpleCommentSection postId={currentPost.id} />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </div>
          </article>

        {/* Bottom navigation buttons */}
        <div className={`mt-6 mb-8 flex justify-center gap-3 ui-fade-element ${isUIHidden ? 'ui-hidden' : ''}`} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              setLocation('/');
            }}
            className="px-4 bg-background hover:bg-background/80 flex items-center gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Return to Home</span>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              setLocation('/');
            }}
            className="px-4 bg-background hover:bg-background/80 flex items-center gap-2"
          >
            <BookOpen className="h-5 w-5" />
            <span>Browse Stories</span>
          </Button>
        </div>
      </div>
    </div>
  );
}