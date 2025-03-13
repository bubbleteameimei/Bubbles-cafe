import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft, ChevronRight, BookmarkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { fetchPosts, fetchPost } from "@/lib/wordpress-api";
import { useFontSize } from "@/hooks/use-font-size";
import { FontSizeControls } from "@/components/ui/FontSizeControls";
import { getReadingTime } from "@/lib/content-analysis";
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "../styles/reader.css";

// Theme button component
const ThemeButton = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-7 w-7 text-amber-400" />
      ) : (
        <Moon className="h-7 w-7 text-indigo-500" />
      )}
    </button>
  );
};

// Bookmark button component
const BookmarkButton = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <button
      onClick={toggleBookmark}
      className="h-12 w-12 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 flex items-center justify-center transition-all hover:scale-105"
      aria-label="Bookmark post"
    >
      {isBookmarked ? (
        <svg className="h-7 w-7 fill-current text-amber-400" viewBox="0 0 24 24">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      ) : (
        <svg className="h-7 w-7 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      )}
    </button>
  );
};

// Font size controls component has been replaced with the imported component

// FloatingPagination component removed as requested

interface ReaderPageProps {
  slug?: string;
}

export default function Reader({ slug }: ReaderPageProps) {
  // Define styles first before any hooks to prevent uninitialized variable error
  const storyContentStyles = `
  /* Additional dynamic styles that complement our reader.css file */
  .story-content a {
    color: var(--primary);
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    transition: all 0.2s ease;
  }
  
  .story-content a:hover {
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  
  /* Add subtle text shadow in dark mode */
  @media (prefers-color-scheme: dark) {
    .story-content h1, 
    .story-content h2 {
      text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }
  
  /* Enhance image displays */
  .story-content img {
    transition: transform 0.3s ease;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
  
  .story-content img:hover {
    transform: scale(1.02);
  }
  `;

  // All hooks must be called in the same order on every render
  // Keep all useState and useEffect hooks at the top in a consistent order
  const [, setLocation] = useLocation();
  const { fontSize, updateFontSize } = useFontSize();
  const [showControls, setShowControls] = useState(false);
  
  // Define initial state for currentIndex using sessionStorage
  const initialIndex = (() => {
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
  })();
  
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Define handlers after all state hooks
  const toggleControls = () => setShowControls(!showControls);
  
  console.log('[Reader] Component mounted with slug:', slug);

  const { data: postsData, isLoading: queryLoading, error, refetch } = useQuery({
    queryKey: ["wordpress", "posts", "reader", slug],
    queryFn: async () => {
      console.log('[Reader] Fetching posts...', { slug });
      try {
        if (slug) {
          // First try to get from API
          try {
            const response = await fetch(`/api/posts/${slug}`);
            if (response.ok) {
              const post = await response.json();
              return { posts: [post], hasMore: false };
            }
          } catch (apiError) {
            console.warn('[Reader] API fetch failed, trying WordPress:', apiError);
            // If API fails, fall back to direct WordPress fetch
          }
          
          // Try to fetch directly from WordPress as fallback
          const post = await fetchPost(slug);
          if (post) {
            return { posts: [post], hasMore: false };
          }
          throw new Error('Post not found');
        } else {
          // For the main reader page, fetch all posts
          try {
            // First try API for cached posts
            const response = await fetch('/api/posts?limit=100');
            if (response.ok) {
              const data = await response.json();
              if (data.posts && data.posts.length > 0) {
                console.log('[Reader] Posts fetched from API successfully:', {
                  totalPosts: data.posts.length,
                });
                return { posts: data.posts, hasMore: data.hasMore };
              }
            }
          } catch (apiError) {
            console.warn('[Reader] API fetch failed, falling back to WordPress:', apiError);
          }
          
          // Fall back to WordPress direct fetch
          const data = await fetchPosts(1, 100);
          console.log('[Reader] Posts fetched from WordPress successfully:', {
            totalPosts: data.posts?.length,
            hasMore: data.hasMore
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
    refetchOnWindowFocus: false,
    retry: 2, // Add retry for network failures
    retryDelay: 1000 // Start with 1s delay
  });

  useEffect(() => {
    if (postsData?.posts && postsData.posts.length > 0) {
      console.log('[Reader] Validating current index:', {
        currentIndex,
        totalPosts: postsData.posts.length,
        savedIndex: sessionStorage.getItem('selectedStoryIndex')
      });

      if (currentIndex >= postsData.posts.length) {
        console.log('[Reader] Current index out of bounds, resetting to 0');
        setCurrentIndex(0);
        sessionStorage.setItem('selectedStoryIndex', '0');
      } else {
        console.log('[Reader] Current index is valid:', currentIndex);
        sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
      }

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
      // Update the storyContentStyles to include font size
      const dynamicStyles = `
        ${storyContentStyles}
        .story-content p, .story-content li {
          font-size: ${fontSize}px !important;
          line-height: 1.9 !important;
        }
      `;
      
      // Create or update style tag
      let styleTag = document.getElementById('reader-dynamic-styles') as HTMLStyleElement;
      
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'reader-dynamic-styles';
        document.head.appendChild(styleTag);
      }
      
      // Update the content
      styleTag.textContent = dynamicStyles;
      
      return () => {
        if (styleTag && document.head.contains(styleTag)) {
          styleTag.remove();
        }
      };
    } catch (error) {
      console.error('[Reader] Error injecting styles:', error);
    }
  }, [fontSize]);

  // All variables must be defined before any conditional returns to maintain hook order
  // Store values in variables first
  const loading = queryLoading || !postsData?.posts || postsData.posts.length === 0;
  const hasError = !!error;
  const posts = postsData?.posts || [];
  const isInvalidIndex = posts.length > 0 && (currentIndex < 0 || currentIndex >= posts.length);
  const currentPost = posts.length > 0 && currentIndex >= 0 && currentIndex < posts.length ? posts[currentIndex] : null;
  // Initialize the contentRef before any conditional returns
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Define formatting variables that depend on currentPost
  let formattedDate = '';
  let readingTime = '';
  
  if (currentPost) {
    try {
      // Make sure we have a valid date - check both date and createdAt fields
      const dateStr = currentPost.date || (currentPost.createdAt ? currentPost.createdAt : null);
      if (dateStr) {
        const postDate = new Date(dateStr);
        if (!isNaN(postDate.getTime())) {
          formattedDate = format(postDate, 'MMMM d, yyyy');
        } else {
          formattedDate = 'Date unavailable';
          console.log('[Reader] Invalid date format, using fallback');
        }
      } else {
        formattedDate = 'Date unavailable';
        console.log('[Reader] No date information available');
      }
      
      // Get reading time from rendered content
      if (currentPost.content && currentPost.content.rendered) {
        readingTime = getReadingTime(currentPost.content.rendered);
      } else if (typeof currentPost.content === 'string') {
        readingTime = getReadingTime(currentPost.content);
      } else {
        readingTime = '3 min read'; // Fallback
      }
    } catch (error) {
      console.error('[Reader] Error processing post data:', error);
      formattedDate = 'Date unavailable';
      readingTime = '3 min read'; // Fallback
    }
  }
  
  // Now render based on conditions
  if (loading) {
    console.log('[Reader] Loading state');
    return <LoadingScreen />;
  }

  if (hasError) {
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

  if (isInvalidIndex) {
    console.error('[Reader] Invalid current index:', {
      currentIndex,
      totalPosts: posts.length,
      savedIndex: sessionStorage.getItem('selectedStoryIndex')
    });
    setCurrentIndex(0);
    return <LoadingScreen />;
  }

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

  const handleSocialShare = (platform: string, url: string) => {
    try {
      console.log(`[Reader] Opening ${platform} profile`);
      window.open(url, '_blank');
    } catch (error) {
      console.error(`[Reader] Error opening ${platform}:`, error);
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

  const handleTip = () => {
    window.open('https://paystack.com/pay/z7fmj9rge1', '_blank');
  };

  const handleRandomStory = () => {
    if (!postsData?.posts) return;
    const randomIndex = Math.floor(Math.random() * postsData.posts.length);
    setCurrentIndex(randomIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Define additional functions below
  return (
    <div className="relative min-h-screen bg-background reader-interface">
      {/* Fullscreen button removed as requested */}
      
      {/* We'll add Reading progress tracker later after fixing it */}

      <div className="container max-w-3xl mx-auto px-4 pt-16 pb-16 relative z-10">
        {/* Reading controls - Theme toggle, bookmark and font size */}
        <div className="mb-12 flex justify-between items-center">
          <div className="flex space-x-4">
            <ThemeButton />
            <BookmarkButton />
          </div>
          <FontSizeControls />
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={currentPost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="prose dark:prose-invert max-w-none prose-lg"
          >
            <div className="flex flex-col items-center mb-8">
              <h1
                className="text-4xl font-bold text-center mb-4 tracking-tight"
                dangerouslySetInnerHTML={{ 
                  __html: currentPost.title?.rendered || 
                          (typeof currentPost.title === 'string' ? currentPost.title : 'Untitled Story')
                }}
              />

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <time>{formattedDate}</time>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Story
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentIndex < postsData.posts.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentIndex === postsData.posts.length - 1}
                  >
                    Next Story
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

              </div>
            </div>

            <div
              ref={contentRef}
              className="story-content mb-16 relative"
              style={{ 
                fontSize: `${fontSize}px`, 
                lineHeight: "1.9", 
                whiteSpace: 'pre-wrap'
              }}
              dangerouslySetInnerHTML={{
                __html: (() => {
                  // Handle content format from WordPress API
                  if (currentPost.content && currentPost.content.rendered) {
                    // First preserve italics and other formatting tags
                    const preservedTags: string[] = [];
                    const contentWithPlaceholders = currentPost.content.rendered.replace(
                      /<(em|i|strong|b|a|span|code)(.*?)>(.*?)<\/(em|i|strong|b|a|span|code)>/gis, 
                      (match: string, tag: string, attributes: string, content: string, endTag: string) => {
                        if (content.trim().length === 0) return ''; // Skip empty tags
                        const placeholder = `__PRESERVED_TAG_${preservedTags.length}__`;
                        const fullTag = tag === endTag 
                          ? `<${tag}${attributes}>${content}</${tag}>`
                          : match; // Keep original if opening/closing tags don't match
                        preservedTags.push(fullTag);
                        return placeholder;
                      }
                    );
                    
                    // Now process the content with preserved formatting
                    let processedContent = contentWithPlaceholders
                      .replace(/\n\n+/g, '\n\n')
                      .replace(/<p>\s*<\/p>/g, '')
                      // Process paragraphs with better styling
                      .replace(/<p>(.*?)<\/p>/g, (match: string, p1: string, index: number) => {
                        const trimmedContent = p1.trim();
                        // Skip styling for empty paragraphs
                        if (!trimmedContent) return '';
                        
                        return `<p style="
                          font-size: ${fontSize}px; 
                          margin-bottom: 1.8em; 
                          font-kerning: normal;
                          line-height: 1.9;
                          letter-spacing: 0.0125em;
                        ">${trimmedContent}</p>`;
                      })
                      .replace(/(\s*<br\s*\/?>\s*){2,}/g, '<br/>')
                      .replace(/\s+/g, ' ')
                      .replace(/(\r\n|\r|\n){2,}/g, '\n\n')
                      .trim();
                      
                    // Restore preserved tags
                    preservedTags.forEach((tag, index) => {
                      processedContent = processedContent.replace(
                        `__PRESERVED_TAG_${index}__`, 
                        tag
                      );
                    });
                    
                    return processedContent;
                  } 
                  // Handle content as plain string from database
                  else if (typeof currentPost.content === 'string') {
                    // First process italics/bold markdown-style syntax
                    let markdownContent = currentPost.content;
                    
                    // Convert markdown-style formatting to HTML
                    // Bold: **text** or __text__
                    markdownContent = markdownContent.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
                    
                    // Italic: *text* or _text_
                    markdownContent = markdownContent.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
                    
                    // Convert plain text to HTML with paragraphs
                    const contentHtml = markdownContent
                      .split('\n\n')
                      .map((paragraph: string) => {
                        const trimmedParagraph = paragraph.trim();
                        if (!trimmedParagraph) return '';
                        
                        return `<p style="
                          font-size: ${fontSize}px; 
                          margin-bottom: 1.8em; 
                          font-kerning: normal;
                          line-height: 1.9;
                          letter-spacing: 0.0125em;
                        ">${trimmedParagraph}</p>`;
                      })
                      .join('');
                    
                    return contentHtml || '<p>Content unavailable</p>';
                  }
                  
                  return '<p>Content unavailable</p>';
                })()
              }}
            />
            
            {/* Commenting features will be implemented separately */}

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="mb-8">
                  <LikeDislike postId={currentPost.id} variant="reader" />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">Stay connected—follow me for more! ✨</p>
                  <div className="flex items-center gap-4">
                    {socialLinks.map(({ key, Icon, url }) => (
                      <Button
                        key={key}
                        variant="ghost"
                        size="lg"
                        onClick={() => handleSocialShare(key, url)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="h-8 w-8" />
                        <span className="sr-only">Follow on {key}</span>
                      </Button>
                    ))}
                    <ShareButton/> {/*Added Share button here*/}
                  </div>

                  {/* Support writing section - Reduced size as requested */}
                  <div className="mt-6 w-full max-w-xs bg-card/50 backdrop-blur rounded-lg border border-border/50 p-4 text-center">
                    <h3 className="text-base font-semibold mb-1">Support My Writing</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      If you enjoy my stories, your support helps create more content.
                    </p>
                    <div className="flex justify-center">
                      <BuyMeCoffeeButton />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Secure Payment via Paystack
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <CommentSection postId={currentPost.id} />
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
        {/* Floating pagination removed as requested */}
      </div>
    </div>
  );
}