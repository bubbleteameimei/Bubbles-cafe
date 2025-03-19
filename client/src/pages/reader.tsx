import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Share2, Minus, Plus, Shuffle, Headphones, Volume2, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import { useFontSize } from "@/hooks/use-font-size";
import { getReadingTime } from "@/lib/content-analysis";
// Import social icons lazily to avoid loading them initially
const FaTwitter = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaTwitter })));
const FaWordpress = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaWordpress })));
const FaInstagram = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaInstagram })));
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button";
import { useTheme } from "@/components/theme-provider";
import ApiLoader from "@/components/api-loader";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Lazy load non-essential components
const CommentSection = lazy(() => import("@/components/blog/comment-section"));
const AudioNarrator = lazy(() => import("@/components/ui/audio-narrator").then(module => ({ default: module.AudioNarrator })));

// Import the WordPress API functions with error handling
import { fetchWordPressPosts } from "@/lib/wordpress-api";

// Create a utility function to sanitize HTML content 
const sanitizeHtmlContent = (html: string): string => {
  try {
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
}

export default function ReaderPage({ slug, params }: ReaderPageProps) {
  // Log params for debugging
  console.log('[ReaderPage] Initializing with params:', { routeSlug: params?.slug || slug, params, slug });
  // Extract slug from route params if provided
  const routeSlug = params?.slug || slug;
  const [, setLocation] = useLocation();
  
  // Theme is now managed by the useTheme hook
  const { theme, toggleTheme } = useTheme();
  
  // Font size adjustment
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();

  // Reading progress state - moved to top level with other state hooks
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Audio narrator settings
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(() => {
    try {
      return localStorage.getItem('tts-enabled') === 'true';
    } catch (error) {
      console.error('[Reader] Error reading TTS settings from localStorage:', error);
      return false;
    }
  });
  const [isNarratorOpen, setIsNarratorOpen] = useState(false);
  const [narratorTone, setNarratorTone] = useState<"neutral" | "creepy" | "suspense" | "terror" | "panic" | "whisper">("whisper");
  
  // Listen for changes to text-to-speech enabled setting
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tts-enabled') {
        setIsTextToSpeechEnabled(e.newValue === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    queryKey: ["wordpress", "posts", "reader", routeSlug],
    queryFn: async () => {
      console.log('[Reader] Fetching posts...', { routeSlug });
      try {
        if (routeSlug) {
          // If slug is provided, fetch specific post
          const response = await fetch(`/api/posts/${routeSlug}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const post = await response.json();
          return { posts: [post], totalPages: 1, total: 1 };
        } else {
          // Otherwise fetch all posts
          const data = await fetchWordPressPosts({ page: 1, perPage: 100 });
          console.log('[Reader] Posts fetched successfully:', {
            totalPosts: data.posts?.length,
            totalPages: data.totalPages
          });
          return data;
        }
      } catch (error) {
        console.error('[Reader] Error fetching posts:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
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
        title: currentPost.title.rendered,
        date: currentPost.date
      } : 'No post found');
    }
  }, [currentIndex, postsData?.posts]);

  useEffect(() => {
    console.log('[Reader] Verifying social icons:', {
      twitter: !!FaTwitter,
      wordpress: !!FaWordpress,
      instagram: !!FaInstagram
    });
  }, []);

  useEffect(() => {
    try {
      console.log('[Reader] Injecting content styles');
      const styleTag = document.createElement('style');
      styleTag.textContent = storyContentStyles;
      document.head.appendChild(styleTag);
      return () => styleTag.remove();
    } catch (error) {
      console.error('[Reader] Error injecting styles:', error);
    }
  }, []);
  
  // Handle reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      </div>
    );
  }

  const formattedDate = format(new Date(currentPost.date), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content.rendered);

  const handleSocialShare = (platform: string, url: string) => {
    try {
      console.log(`[Reader] Opening ${platform} profile`);
      window.open(url, '_blank');
    } catch (error) {
      console.error(`[Reader] Error opening ${platform}:`, error);
    }
  };

  const shareStory = async () => {
    console.log('[Reader] Attempting native share:', currentPost.title.rendered);
    const shareData = {
      title: currentPost.title.rendered,
      text: "Check out this story on Bubble's Café!",
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

  const storyContentStyles = `
  .story-content {
    font-family: 'Newsreader', var(--font-serif, Georgia, 'Times New Roman', serif);
    /* Removed max-width constraint for immersive experience */
    margin: 0 auto;
    color: hsl(var(--foreground));
    transition: color 0.3s ease, background-color 0.3s ease;
  }
  .story-content p {
    line-height: 1.8;  /* Adjusted for Newsreader font */
    margin-bottom: 1.2em;  /* Improved spacing between paragraphs */
    text-align: justify;
    letter-spacing: 0.01em; /* Subtle letter spacing */
    font-kerning: normal; /* Improves kerning pairs */
    font-feature-settings: "kern", "liga", "clig", "calt"; /* Typography features */
    max-width: 80ch; /* Control paragraph width for readability while keeping immersive layout */
    margin-left: auto;
    margin-right: auto;
    font-family: 'Newsreader', var(--font-serif, Georgia, 'Times New Roman', serif);
  }
  .story-content p + p {
    margin-top: 2em;  /* Double line break effect */
    text-indent: 0; /* No indent to maintain modern style */
  }
  .story-content p:first-of-type::first-letter {
    font-size: 1.8em;
    font-weight: 500;
    margin-right: 0.05em;
    float: left;
    line-height: 1;
    padding-top: 0.1em;
  }
  .story-content p:first-of-type {
    font-size: 1.05em;
  }
  @media (max-width: 768px) {
    .story-content p {
      margin-bottom: 1em;
      line-height: 1.7; /* Slightly tighter on mobile */
      font-family: 'Newsreader', var(--font-serif, Georgia, 'Times New Roman', serif);
    }
    .story-content p + p {
      margin-top: 1.8em;  /* Slightly reduced on mobile */
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
    font-family: 'Newsreader', var(--font-serif, Georgia, 'Times New Roman', serif);
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
  const goToRandomStory = () => {
    if (posts.length <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * posts.length);
    } while (randomIndex === currentIndex);
    
    setCurrentIndex(randomIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Function to navigate to previous story
  const goToPreviousStory = () => {
    if (posts.length <= 1) return;
    
    const newIndex = currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Function to navigate to next story
  const goToNextStory = () => {
    if (posts.length <= 1) return;
    
    const newIndex = (currentIndex + 1) % posts.length;
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // The theme and toggleTheme functions are already declared at the top of the component
  
  return (
    <div className="relative min-h-screen bg-background">
      {/* Reading progress indicator */}
      <div 
        className="fixed top-0 left-0 z-50 h-1 bg-primary/70"
        style={{ width: `${readingProgress}%`, transition: 'width 0.2s ease-out' }}
        aria-hidden="true"
      />
      
      {/* Floating pagination has been removed */}
      
      {/* Navigation buttons removed as requested */}
      {/* Full width immersive reading experience */}

      <div className="pt-2 pb-4">
        {/* Enhanced font size controls with Narration button - scrollable with content */}
        <div className="flex justify-between items-center mb-0 px-4 md:px-8 lg:px-12 sticky top-3 z-40">
          {/* Font size controls using the standard Button component */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="h-8 px-2 bg-background hover:bg-background/80"
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
              className="h-8 px-2 bg-background hover:bg-background/80"
              aria-label="Increase font size"
            >
              A+
              <Plus className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Narration button */}
          <div className="flex-grow"></div>

          {/* Integrated BookmarkButton in top controls */}
          <BookmarkButton 
            postId={currentPost.id} 
            variant="reader"
            showText={false}
            className="h-9 w-9 rounded-full bg-background hover:bg-background/80 mx-2"
          />

          {/* Only show narration button if text-to-speech is enabled */}
          {isTextToSpeechEnabled && (
            <Dialog 
              open={isNarratorOpen} 
              onOpenChange={(open) => {
                console.log('[Reader] Narrator dialog state changed:', open);
                setIsNarratorOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 mx-2 group relative"
                  aria-label="Listen to narration"
                >
                  <Headphones className="h-4 w-4" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                    Narration
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-2xl"
                aria-labelledby="dialog-title-narrator"
                aria-describedby="dialog-desc-narrator"
              >
                <DialogHeader>
                  <DialogTitle id="dialog-title-narrator">Whisper Narration</DialogTitle>
                  <DialogDescription id="dialog-desc-narrator">
                    Listen to the story with emotional tone modulation
                  </DialogDescription>
                </DialogHeader>
                
                {/* Emotional tone selector */}
                <div className="grid grid-cols-3 gap-2 my-4">
                  {["whisper", "creepy", "suspense", "terror", "panic", "neutral"].map((tone) => (
                    <Button
                      key={tone}
                      variant={narratorTone === tone ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNarratorTone(tone as any)}
                      className="capitalize"
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
                
                {/* Audio narrator component */}
                <ErrorBoundary fallback={
                  <div className="p-4 border border-destructive/10 bg-destructive/5 rounded-lg">
                    <h4 className="font-medium text-destructive mb-2">Narrator Unavailable</h4>
                    <p className="text-sm text-muted-foreground">
                      We're having trouble loading the audio narrator. Please try again later.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        <RefreshCcw className="h-3 w-3 mr-2" />
                        Try again
                      </Button>
                    </div>
                  </div>
                }>
                  <Suspense fallback={
                    <div className="w-full p-4 flex items-center justify-center">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="space-y-3 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  }>
                    <AudioNarrator
                      content={sanitizeHtmlContent(currentPost.content.rendered).replace(/<[^>]*>/g, ' ')}
                      title={sanitizeHtmlContent(currentPost.title.rendered).replace(/<[^>]*>/g, '')}
                      emotionalTone={narratorTone}
                      autoScroll={false}
                    />
                  </Suspense>
                </ErrorBoundary>
              </DialogContent>
            </Dialog>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/')}
            className="h-8 px-2 bg-background hover:bg-background/80 w-32"
          >
            Return to Home
          </Button>
        </div>
      
        <AnimatePresence mode="wait">
          <motion.article
            key={currentPost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="prose dark:prose-invert max-w-none px-4 md:px-8 lg:px-12"
          >
            <div className="flex flex-col items-center mb-4">
              <h1
                className="text-4xl md:text-5xl font-bold text-center mb-2 tracking-tight leading-tight"
                dangerouslySetInnerHTML={{ __html: currentPost.title.rendered }}
              />

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground backdrop-blur-sm bg-background/20 px-3 py-1 rounded-full">
                  <time className="font-medium">{formattedDate}</time>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{readingTime}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-center mt-2 gap-2 w-full">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousStory}
                    className="h-8 px-2 bg-background hover:bg-background/80 w-24"
                    disabled={posts.length <= 1}
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
                    className="h-8 w-8 px-0 rounded-full bg-primary/10 hover:bg-primary/20 border-none"
                    disabled={posts.length <= 1}
                    aria-label="Random Story"
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                  
                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextStory}
                    className="h-8 px-2 bg-background hover:bg-background/80 w-24"
                    disabled={posts.length <= 1}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 ml-1">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="story-content font-newsreader mb-8 mx-auto w-full md:w-[95%] lg:w-[90%] xl:w-[85%]"
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: 'pre-wrap',
                lineHeight: '1.7',
                letterSpacing: '0.01em'
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlContent(currentPost.content.rendered)
              }}
            />
            
            {/* Simple pagination at bottom of story content - extremely compact */}
            <div className="flex items-center justify-center gap-3 mb-6 mt-4 w-full text-center">
              <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md border border-border/50 rounded-full py-1.5 px-3 shadow-md">
                {/* Previous story button */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={goToPreviousStory}
                  className="h-8 w-8 rounded-full hover:bg-background/80 group relative"
                  aria-label="Previous story"
                  disabled={posts.length <= 1}
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
                  className="h-8 w-8 rounded-full hover:bg-background/80 group relative"
                  aria-label="Next story"
                  disabled={posts.length <= 1}
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
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="w-full md:w-auto flex items-center gap-4">
                  <LikeDislike postId={currentPost.id} />
                  
                  {/* Add BookmarkButton next to Like/Dislike buttons for easy access */}
                  <BookmarkButton 
                    postId={currentPost.id}
                    variant="default"
                    showText={true}
                    className="bg-background/80 hover:bg-background"
                  />
                </div>

                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground font-medium">Share this story 。Follow me for more!</p>
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
                      <Suspense fallback={
                        <div className="flex gap-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-9 h-9 rounded-full border border-gray-200 animate-pulse bg-gray-100 dark:bg-gray-800 dark:border-gray-700"></div>
                          ))}
                        </div>
                      }>
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
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>

              {/* Comment Section with improved aesthetic styling */}
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
                      <Suspense fallback={
                        <div className="p-4 space-y-4">
                          <div className="animate-pulse space-y-2">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          </div>
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          </div>
                        </div>
                      }>
                        <CommentSection postId={currentPost.id} />
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>

        {/* Bottom Return to Home button */}
        <div className="mt-12 mb-8 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation('/')}
            className="px-4 bg-background hover:bg-background/80"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}