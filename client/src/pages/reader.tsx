import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Share2, ChevronLeft, ChevronRight, Minus, Plus, Shuffle, Headphones, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { fetchPosts } from "@/lib/wordpress-api";
import { useFontSize } from "@/hooks/use-font-size";
import { getReadingTime, sanitizeHtmlContent } from "@/lib/content-analysis";
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { BookmarkButton } from "@/components/ui/BookmarkButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { AudioNarrator } from "@/components/ui/audio-narrator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReaderPageProps {
  slug?: string;
}

export default function Reader({ slug }: ReaderPageProps) {
  const [, setLocation] = useLocation();
  
  // Theme is now managed by the useTheme hook
  const { theme, toggleTheme } = useTheme();
  
  // Font size adjustment
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();

  // Reading progress state - moved to top level with other state hooks
  const [readingProgress, setReadingProgress] = useState(0);
  
  // Audio narrator settings
  const [isNarratorOpen, setIsNarratorOpen] = useState(false);
  const [narratorTone, setNarratorTone] = useState<"neutral" | "creepy" | "suspense" | "terror" | "panic" | "whisper">("whisper");

  console.log('[Reader] Component mounted with slug:', slug); // Debug log

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
    queryKey: ["wordpress", "posts", "reader", slug],
    queryFn: async () => {
      console.log('[Reader] Fetching posts...', { slug });
      try {
        if (slug) {
          // If slug is provided, fetch specific post
          const response = await fetch(`/api/posts/${slug}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const post = await response.json();
          return { posts: [post], hasMore: false };
        } else {
          // Otherwise fetch all posts
          const data = await fetchPosts(1, 100);
          console.log('[Reader] Posts fetched successfully:', {
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

  if (isLoading) {
    console.log('[Reader] Loading state');
    return <LoadingScreen />;
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
    return <LoadingScreen />;
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
    font-family: var(--font-serif, Georgia, 'Times New Roman', serif);
    max-width: 70ch;
    margin: 0 auto;
    color: hsl(var(--foreground));
    transition: color 0.3s ease, background-color 0.3s ease;
  }
  .story-content p {
    line-height: 1.85;  /* Enhanced readability */
    margin-bottom: 1.2em;  /* Improved spacing between paragraphs */
    text-align: justify;
    letter-spacing: 0.01em; /* Subtle letter spacing */
    font-kerning: normal; /* Improves kerning pairs */
    font-feature-settings: "kern", "liga", "clig", "calt"; /* Typography features */
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

  // Function to handle going to a random story
  const goToRandomStory = () => {
    if (posts.length <= 1) return;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * posts.length);
    } while (randomIndex === currentIndex);
    
    setCurrentIndex(randomIndex);
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

      {/* Enhanced Floating Navigation - desktop */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-background/70 backdrop-blur-md border-border/40 shadow-md hover:bg-background/90 hover:shadow-lg transition-all duration-300 group"
        >
          <span className="absolute left-16 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-border/30 text-sm font-medium opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-sm pointer-events-none whitespace-nowrap">
            Previous Story
          </span>
          <ChevronLeft className="h-5 w-5 text-primary/90" />
          <span className="sr-only">Previous Story</span>
        </Button>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-40">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (currentIndex < posts.length - 1) {
              setCurrentIndex(currentIndex + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          disabled={currentIndex === posts.length - 1}
          className="w-12 h-12 rounded-full bg-background/70 backdrop-blur-md border-border/40 shadow-md hover:bg-background/90 hover:shadow-lg transition-all duration-300 group"
        >
          <span className="absolute right-16 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-border/30 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-sm pointer-events-none whitespace-nowrap">
            Next Story
          </span>
          <ChevronRight className="h-5 w-5 text-primary/90" />
          <span className="sr-only">Next Story</span>
        </Button>
      </div>
      
      {/* We've removed the mobile floating navigation and replaced it with the top centered navigation */}
      
      {/* Fixed bottom toolbar with reading controls */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Main controls toolbar group */}
        <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md border border-border/50 rounded-full py-1.5 px-3 shadow-md">
          {/* Font size controls */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={decreaseFontSize}
              className="h-8 w-8 rounded-full hover:bg-background/80"
              aria-label="Decrease font size"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-1 min-w-[36px] text-center">{fontSize}px</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={increaseFontSize}
              className="h-8 w-8 rounded-full hover:bg-background/80"
              aria-label="Increase font size"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-border/50"></div>
          
          {/* Listen to Narrator button */}
          <Dialog open={isNarratorOpen} onOpenChange={setIsNarratorOpen}>
            <DialogTrigger asChild>
              <Button
                variant={isNarratorOpen ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-background/80 group relative"
                aria-label="Listen to narration"
              >
                <Headphones className="h-4 w-4" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm border border-border/50">
                  Whisper Narration
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Whisper Narration</DialogTitle>
                <DialogDescription>
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
              <AudioNarrator
                content={sanitizeHtmlContent(currentPost.content.rendered).replace(/<[^>]*>/g, ' ')}
                title={sanitizeHtmlContent(currentPost.title.rendered).replace(/<[^>]*>/g, '')}
                emotionalTone={narratorTone}
                autoScroll={false}
              />
            </DialogContent>
          </Dialog>
          
          <div className="w-px h-6 bg-border/50"></div>
          
          {/* Dark/Light mode toggle */}
          <ThemeToggle 
            variant="icon" 
            className="h-8 w-8 rounded-full hover:bg-background/80" 
          />
          
          <div className="w-px h-6 bg-border/50"></div>
          
          {/* Bookmark button */}
          <BookmarkButton 
            postId={currentPost.id} 
            variant="reader"
            showText={false}
            className="h-8 w-8 rounded-full hover:bg-background/80"
          />
        </div>
        
        {/* Return to home link */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/')}
          className="h-8 rounded-full bg-background/90 backdrop-blur-md border border-border/50 text-xs px-3 shadow-md"
        >
          Return to Home
        </Button>
      </div>
      
      {/* Fixed top navigation buttons for better access */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-full py-1.5 px-3 shadow-md">
          <Button
            variant="ghost"
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            disabled={currentIndex === 0}
            className="group hover:bg-primary/10 transition-all duration-300 relative overflow-hidden pr-5 rounded-full"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="relative z-10">Previous</span>
          </Button>
          
          <div className="h-5 w-px bg-border/50"></div>
          
          <Button
            variant="ghost"
            onClick={() => {
              if (currentIndex < posts.length - 1) {
                setCurrentIndex(currentIndex + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            disabled={currentIndex === posts.length - 1}
            className="group hover:bg-primary/10 transition-all duration-300 relative overflow-hidden pl-5 rounded-full"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Next</span>
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-12">
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
            className="prose dark:prose-invert max-w-none bg-background/50 dark:bg-background/70 backdrop-blur-sm p-6 sm:p-8 rounded-xl border border-border/30 shadow-sm"
          >
            <div className="flex flex-col items-center mb-10">
              <h1
                className="text-4xl md:text-5xl font-bold text-center mb-5 tracking-tight leading-tight"
                dangerouslySetInnerHTML={{ __html: currentPost.title.rendered }}
              />

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground backdrop-blur-sm bg-background/20 px-4 py-2 rounded-full">
                  <time className="font-medium">{formattedDate}</time>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{readingTime}</span>
                  </div>
                </div>

                {/* Random Story Button */}
                <div className="flex items-center justify-center mt-4">                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={goToRandomStory}
                    className="h-9 px-3 rounded-full bg-primary/10 hover:bg-primary/20 border-none text-xs"
                    disabled={posts.length <= 1}
                  >
                    <Shuffle className="h-3 w-3 mr-1" />
                    Random Story
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="story-content mb-16"
              style={{
                fontSize: `${fontSize}px`,
                whiteSpace: 'pre-wrap'
              }}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlContent(currentPost.content)
              }}
            />

            <div className="mt-12 pt-10 border-t border-border/50">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full md:w-auto">
                  <LikeDislike postId={currentPost.id} />
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

                    {/* Social Icons */}
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
                    <CommentSection postId={currentPost.id} />
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}