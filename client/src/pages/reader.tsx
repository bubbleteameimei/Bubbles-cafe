import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Clock, Share2 } from "lucide-react";
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
import { FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';

// Styles for WordPress content
const storyContentStyles = `
  .story-content {
    font-family: var(--font-sans);
    max-width: 70ch;
    margin: 0 auto;
  }
  .story-content p {
    line-height: 1.7;
    margin-bottom: 1.2em;
    text-align: justify;
  }
  .story-content img {
    max-width: 100%;
    height: auto;
    margin: 2em auto;
    border-radius: 0.5rem;
  }
  .story-content h1, .story-content h2, .story-content h3 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  .story-content ul, .story-content ol {
    margin-bottom: 1.2em;
    padding-left: 1.5em;
  }
  .story-content blockquote {
    margin: 1.5em 0;
    padding-left: 1em;
    border-left: 3px solid var(--border);
    font-style: italic;
  }
`;

export default function Reader() {
  const [, setLocation] = useLocation();
  const { fontSize } = useFontSize();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  // Verify social icons are imported
  useEffect(() => {
    console.log('[Reader] Verifying social icons:', {
      twitter: !!FaTwitter,
      facebook: !!FaFacebook,
      whatsapp: !!FaWhatsapp
    });
  }, []);

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ["wordpress", "posts", "reader"],
    queryFn: async () => {
      console.log('[Reader] Fetching posts...');
      try {
        const data = await fetchPosts(1, 10);
        console.log('[Reader] Posts fetched successfully:', data.posts?.length);
        return data;
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
      console.log('[Reader] Setting current post index:', currentIndex);
      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [currentIndex, postsData?.posts]);

  // Inject story content styles
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

  if (isLoading) return <LoadingScreen />;

  if (error || !postsData?.posts || postsData.posts.length === 0) {
    console.error('[Reader] Error state:', { error, postsData });
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Unable to load stories</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Please try again later"}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const posts = postsData.posts;
  const currentPost = posts[currentIndex];

  if (!currentPost) {
    console.error('[Reader] No post found at index:', currentIndex);
    return <div className="text-center p-8">No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.date), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content.rendered);

  const handleSocialShare = (platform: string, url: string) => {
    try {
      console.log(`[Reader] Sharing on ${platform}`);
      window.open(url, '_blank');
    } catch (error) {
      console.error(`[Reader] Error sharing on ${platform}:`, error);
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

  const socialPlatforms = [
    {
      key: 'twitter',
      Icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(currentPost.title.rendered)}&url=${encodeURIComponent(window.location.href)}`
    },
    {
      key: 'facebook',
      Icon: FaFacebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    },
    {
      key: 'whatsapp',
      Icon: FaWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(currentPost.title.rendered)}%20${encodeURIComponent(window.location.href)}`
    }
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <Mist className="opacity-30" />
      <div className="container max-w-3xl mx-auto px-4 py-8">
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

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <time>{formattedDate}</time>
                <span className="text-muted-foreground/30">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime}</span>
                </div>
              </div>
            </div>

            <div
              className="story-content"
              style={{
                fontSize: `${fontSize}px`,
              }}
              dangerouslySetInnerHTML={{ __html: currentPost.content.rendered }}
            />

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-8">
                <LikeDislike postId={currentPost.id} />
                <div className="flex items-center gap-2">
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
                  {socialPlatforms.map(({ key, Icon, url }) => (
                    <Button
                      key={key}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSocialShare(key, url)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">Share on {key}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <CommentSection postId={currentPost.id} />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}