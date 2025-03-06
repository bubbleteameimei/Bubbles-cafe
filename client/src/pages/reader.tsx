import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Share2, ChevronLeft, ChevronRight, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { fetchPosts } from "@/lib/wordpress-api";
import { useFontSize } from "@/hooks/use-font-size";
import { useFontSizeControls } from "@/hooks/use-font-size";
import { getReadingTime } from "@/lib/content-analysis";
import { FaTwitter, FaWordpress, FaInstagram } from 'react-icons/fa';
import { TipPopup } from "@/components/ui/tip-popup";

interface ReaderPageProps {
  slug?: string;
}

// Added FontSizeControls component - Basic implementation
const FontSizeControls = ({ increaseFontSize, decreaseFontSize }: { increaseFontSize: () => void; decreaseFontSize: () => void }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={decreaseFontSize} size="icon">A-</Button>
      <Button onClick={increaseFontSize} size="icon">A+</Button>
    </div>
  );
};


export default function Reader({ slug }: ReaderPageProps) {
  const [, setLocation] = useLocation();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const [showControls, setShowControls] = useState(false); // Added state for controls
  const toggleControls = () => setShowControls(!showControls);

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
    font-family: var(--font-sans);
    max-width: 70ch;
    margin: 0 auto;
  }
  .story-content p {
    line-height: 1.7;  /* Optimal readability */
    margin-bottom: 1em;  /* Good spacing between paragraphs */
    text-align: justify;
  }
  .story-content p + p {
    margin-top: 2em;  /* Double line break effect */
  }
  @media (max-width: 768px) {
    .story-content p {
      margin-bottom: 0.8em;
    }
    .story-content p + p {
      margin-top: 2em;  /* Keep double line break on mobile */
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
    // Assuming setIsOpen is a state variable in TipPopup to close the popup after clicking
    //  This part requires modification to the TipPopup component itself.
  };


  return (
    <div className="relative min-h-screen bg-background" onClick={toggleControls}>
      <Mist className="opacity-30" />

      {/* Add TipPopup with auto-show */}
      <TipPopup autoShow={true} handleTip={handleTip}/>

      {/* Floating Navigation */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
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
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur hover:bg-primary/10 transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous Story</span>
        </Button>
      </div>

      <div className="fixed right-4 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-2 z-10">
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
          className="w-10 h-10 rounded-full bg-background/80 backdrop-blur hover:bg-primary/10 transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next Story</span>
        </Button>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8 relative">
        <div
          className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <FontSizeControls increaseFontSize={increaseFontSize} decreaseFontSize={decreaseFontSize} /> {/* Added props for interaction */}
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
                <div className="flex items-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentIndex > 0) {
                        setCurrentIndex(currentIndex - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentIndex === 0}
                    className="group hover:bg-primary/10 transition-all duration-300"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Previous Story
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentIndex < posts.length - 1) {
                        setCurrentIndex(currentIndex + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    disabled={currentIndex === posts.length - 1}
                    className="group hover:bg-primary/10 transition-all duration-300"
                  >
                    Next Story
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="story-content mb-16"
              style={{ fontSize: `${fontSize}px`, whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{
                __html: currentPost.content.rendered
                  .replace(/\n\n+/g, '\n\n') // Replace multiple newlines with double newline
                  .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
                  .replace(/<p>(.*?)<\/p>/g, (match, p1) => `<p>${p1.trim()}</p>`) // Trim paragraph content
                  .replace(/(\s*<br\s*\/?>\s*){2,}/g, '<br/>') // Replace multiple breaks with single break
                  .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                  .replace(/(\r\n|\r|\n){2,}/g, '\n\n') // Normalize line breaks
                  .trim() // Trim the entire content
              }}
            />

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <LikeDislike postId={currentPost.id} />

                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">Stay connected—follow me for more! ✨</p>
                  <div className="flex items-center gap-3">
                    {/* Add TipPopup with custom trigger */}
                    <TipPopup
                      triggerContent={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          onClick={handleTip}
                        >
                          <Coffee className="h-5 w-5" />
                          <span className="sr-only">Support with a tip</span>
                        </Button>
                      }
                    />

                    {/* Native Share */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={shareStory}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Share</span>
                    </Button>

                    {/* Social Icons */}
                    {socialLinks.map(({ key, Icon, url }) => (
                      <Button
                        key={key}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSocialShare(key, url)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="sr-only">Follow on {key}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment Section - Moved closer to like/dislike */}
              <div className="mt-4">
                <CommentSection postId={currentPost.id} />
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}