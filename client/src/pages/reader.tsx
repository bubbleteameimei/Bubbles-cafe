import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Share2, ChevronLeft, ChevronRight, Minus, Plus, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { fetchPosts } from "@/lib/wordpress-api";
import { useFontSize } from "@/hooks/use-font-size";
import { getReadingTime } from "@/lib/content-analysis";
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";
import "../styles/floating-pagination.css";

// Theme button component
const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="theme-button bg-background/80 backdrop-blur-sm rounded-full border border-border/50 px-3 py-2 flex items-center gap-2 transition-all hover:scale-105"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-400" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-500" />
      )}
    </button>
  );
};

// Font size controls component
const FontSizeControls = ({ updateFontSize, fontSize }: { updateFontSize: (size: number) => void; fontSize: number }) => {
  return (
    <div className="font-size-controls bg-background/80 backdrop-blur-sm rounded-full border border-border/50 px-3 py-2 flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateFontSize(fontSize - 2)}
        disabled={fontSize <= 12}
        className="h-8 w-8"
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease font size</span>
      </Button>
      <span className="text-sm font-medium min-w-[2rem] text-center">{fontSize}px</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => updateFontSize(fontSize + 2)}
        disabled={fontSize >= 24}
        className="h-8 w-8"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase font size</span>
      </Button>
    </div>
  );
};

// Updated FloatingPagination component
const FloatingPagination = ({
  currentIndex,
  totalPosts,
  onPrevious,
  onNext,
  onRandom
}: {
  currentIndex: number;
  totalPosts: number;
  onPrevious: () => void;
  onNext: () => void;
  onRandom: () => void;
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <button
        id="toggle-pagination"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4"
      >
        {isVisible ? "Hide" : "Show"} Navigation
      </button>

      <div className={`floating-pagination ${!isVisible ? 'hidden' : ''}`}>
        <button
          className="squircle-button"
          onClick={onPrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button
          className="squircle-button"
          onClick={onRandom}
        >
          Random
        </button>
        <button
          className="squircle-button"
          onClick={onNext}
          disabled={currentIndex === totalPosts - 1}
        >
          Next
        </button>
      </div>
    </>
  );
};

interface ReaderPageProps {
  slug?: string;
}

export default function Reader({ slug }: ReaderPageProps) {
  const [, setLocation] = useLocation();
  const { fontSize, updateFontSize } = useFontSize();
  const [showControls, setShowControls] = useState(false);
  const toggleControls = () => setShowControls(!showControls);

  console.log('[Reader] Component mounted with slug:', slug);

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
          const response = await fetch(`/api/posts/${slug}`);
          if (!response.ok) throw new Error('Failed to fetch post');
          const post = await response.json();
          return { posts: [post], hasMore: false };
        } else {
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
      const styleTag = document.createElement('style');
      styleTag.textContent = storyContentStyles;
      document.head.appendChild(styleTag);
      return () => styleTag.remove();
    } catch (error) {
      console.error('[Reader] Error injecting styles:', error);
    }
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
    font-family: var(--font-sans);
    max-width: 70ch;
    margin: 0 auto;
  }
  .story-content p {
    line-height: 1.7;  
    margin-bottom: 1em;  
    text-align: justify;
  }
  .story-content p + p {
    margin-top: 2em;  
  }
  @media (max-width: 768px) {
    .story-content p {
      margin-bottom: 0.8em;
    }
    .story-content p + p {
      margin-top: 2em;  
    }
  }
  .story-content img {
    max-width: 100%;
    height: auto;
    margin: 1.5em auto;
    border-radius: 0.5rem;
  }
  .story-content h1, .story-content h2, .story-content h3 {
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  .story-content ul, .story-content ol {
    margin-bottom: 1em;
    padding-left: 1.5em;
  }
  .story-content blockquote {
    margin: 1.2em 0;
    padding-left: 1em;
    border-left: 3px solid var(--border);
    font-style: italic;
  }
  `;

  const handleTip = () => {
    window.open('https://paystack.com/pay/z7fmj9rge1', '_blank');
  };

  const handleRandomStory = () => {
    if (!postsData?.posts) return;
    const randomIndex = Math.floor(Math.random() * postsData.posts.length);
    setCurrentIndex(randomIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-background">
      <Mist className="opacity-30" />

      <div className="container max-w-3xl mx-auto px-4 pt-8">
        {/* Reading controls - Font size and theme toggle */}
        <div className="mb-12 flex justify-end items-center gap-3">
          <ThemeButton />
          <FontSizeControls updateFontSize={updateFontSize} fontSize={fontSize} />
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={currentPost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="prose dark:prose-invert max-w-none"
          >
            <div className="flex flex-col items-center mb-8">
              <h1
                className="text-4xl font-bold text-center mb-4 tracking-tight"
                dangerouslySetInnerHTML={{ __html: currentPost.title.rendered }}
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
              className="story-content mb-16"
              style={{ fontSize: `${fontSize}px`, whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{
                __html: currentPost.content.rendered
                  .replace(/\n\n+/g, '\n\n')
                  .replace(/<p>\s*<\/p>/g, '')
                  .replace(/<p>(.*?)<\/p>/g, (match, p1) => `<p>${p1.trim()}</p>`)
                  .replace(/(\s*<br\s*\/?>\s*){2,}/g, '<br/>')
                  .replace(/\s+/g, ' ')
                  .replace(/(\r\n|\r|\n){2,}/g, '\n\n')
                  .trim()
              }}
            />

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
                  </div>

                  {/* Support writing section - Updated with homepage style */}
                  <div className="mt-6 w-full max-w-md bg-card/50 backdrop-blur rounded-lg border border-border/50 p-6 text-center">
                    <h3 className="text-lg font-semibold mb-2">Support My Writing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      If you're enjoying my stories, consider buying me a coffee! Your support helps me create more engaging content.
                    </p>
                    <Button
                      onClick={() => window.open('https://paystack.com/pay/z7fmj9rge1', '_blank')}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 rounded-md transition-colors"
                    >
                      Buy me a coffee ☕️
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Powered by Paystack • Secure Payment
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
        {/* Add floating pagination */}
        {postsData?.posts && (
          <FloatingPagination
            currentIndex={currentIndex}
            totalPosts={postsData.posts.length}
            onPrevious={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onNext={() => {
              if (currentIndex < postsData.posts.length - 1) {
                setCurrentIndex(currentIndex + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onRandom={handleRandomStory}
          />
        )}
      </div>
    </div>
  );
}