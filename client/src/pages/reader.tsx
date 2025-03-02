import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
import { SiTwitter, SiFacebook, SiWhatsapp } from 'react-icons/si';

const socialIcons = {
  twitter: SiTwitter,
  facebook: SiFacebook,
  whatsapp: SiWhatsapp
};

const storyContentStyles = `
  .story-content p {
    line-height: 1.7;
    margin-bottom: 1.2em;
    max-width: 70ch;
    text-align: justify;
  }
`;

export default function Reader() {
  const [, setLocation] = useLocation();
  const { fontSize } = useFontSize();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ["wordpress", "posts", "reader"],
    queryFn: async () => {
      return fetchPosts(1, 10);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (postsData?.posts && postsData.posts.length > 0) {
      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [currentIndex, postsData?.posts]);

  // Inject story content styles
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = storyContentStyles;
    document.head.appendChild(styleTag);
    return () => styleTag.remove();
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (error || !postsData?.posts || postsData.posts.length === 0) {
    console.error('[Reader] Error loading posts:', error);
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
    return <div className="text-center p-8">No story selected.</div>;
  }

  const formattedDate = format(new Date(currentPost.date), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content.rendered);

  const shareStory = async () => {
    const shareData = {
      title: currentPost.title.rendered,
      text: "Check out this story on Bubble's Café!",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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

              <div className="flex items-center gap-4">
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

            <div className="flex items-center justify-between mb-8 text-sm text-muted-foreground">
              <time>{formattedDate}</time>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime}</span>
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
                <div className="flex gap-4">
                  {/* Native Share */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={shareStory}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <span className="sr-only">Share</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      <polyline points="16 6 12 2 8 6"/>
                      <line x1="12" y1="2" x2="12" y2="15"/>
                    </svg>
                  </Button>

                  {/* Social Icons */}
                  {Object.entries(socialIcons).map(([platform, Icon]) => (
                    <Button
                      key={platform}
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const title = encodeURIComponent(currentPost.title.rendered);
                        let shareUrl = '';

                        switch (platform) {
                          case 'twitter':
                            shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
                            break;
                          case 'facebook':
                            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                            break;
                          case 'whatsapp':
                            shareUrl = `https://wa.me/?text=${title}%20${url}`;
                            break;
                        }

                        window.open(shareUrl, '_blank');
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <span className="sr-only">Share on {platform}</span>
                      <Icon size={20} />
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