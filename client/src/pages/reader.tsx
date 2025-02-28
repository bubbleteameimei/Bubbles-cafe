import { useState, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from 'date-fns';
import { useLocation } from "wouter";
import Mist from "@/components/effects/mist";
import { LikeDislike } from "@/components/ui/like-dislike";
import CommentSection from "@/components/blog/comment-section";
import { getReadingTime } from "@/lib/content-analysis";
import { useFontSize } from "@/hooks/use-font-size";

interface PostsResponse {
  posts: Post[];
  hasMore: boolean;
  page: number;
}

export default function Reader() {
  const [, setLocation] = useLocation();
  const { fontSize } = useFontSize();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = sessionStorage.getItem('selectedStoryIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [showShareModal, setShowShareModal] = useState(false);

  const { data, isLoading, error } = useInfiniteQuery<PostsResponse>({
    queryKey: ["wordpress", "posts", "reader"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/posts?page=${pageParam}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialPageParam: 1
  });

  const posts = data?.pages.flatMap(page => page.posts) ?? [];
  const currentPost = posts[currentIndex];

  const goToPrevious = useCallback(() => {
    if (posts.length === 0) return;
    setCurrentIndex(prev => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts.length]);

  const goToNext = useCallback(() => {
    if (posts.length === 0) return;
    setCurrentIndex(prev => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [posts.length]);

  useEffect(() => {
    if (posts.length > 0) {
      sessionStorage.setItem('selectedStoryIndex', currentIndex.toString());
    }
  }, [currentIndex, posts.length]);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (error || !currentPost) {
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

  const formattedDate = format(new Date(currentPost.createdAt), 'MMMM d, yyyy');
  const readingTime = getReadingTime(currentPost.content);

  return (
    <div className="relative min-h-screen bg-background">
      <Mist className="opacity-30" />
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
              <h1 className="text-4xl font-bold text-center mb-4 tracking-tight">
                {currentPost.title}
              </h1>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  className="group hover:bg-primary/10 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Previous Story
                </Button>
                <Button
                  variant="outline"
                  onClick={goToNext}
                  className="group hover:bg-primary/10 transition-all duration-300"
                >
                  Next Story
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 text-sm text-muted-foreground">
              <time>{formattedDate}</time>
              <span>{readingTime}</span>
            </div>

            <div
              className="story-content space-y-2"
              style={{
                whiteSpace: 'pre-wrap',
                fontSize: `${fontSize}px`,
                lineHeight: '1.6'
              }}
            >
              {currentPost.content && currentPost.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-2">
                  {paragraph.trim() ? paragraph.trim() : null}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-8">
                <LikeDislike postId={currentPost.id} />
                <Button
                  id="shareBtn"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: currentPost.title,
                        text: "Check out this story on Bubble's Café!",
                        url: window.location.href
                      }).catch(error => {
                        console.error("Sharing failed:", error);
                        setShowShareModal(true);
                      });
                    } else {
                      setShowShareModal(true);
                    }
                  }}
                >
                  🔗 Share
                </Button>
              </div>

              {/* Share Modal */}
              {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-background p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Share This Story</h3>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      value={window.location.href}
                      readOnly
                      className="w-full p-2 mb-4 bg-muted rounded"
                    />

                    <button
                      onClick={copyLink}
                      className="w-full mb-4 bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90"
                    >
                      📋 Copy Link
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center p-2 bg-[#25D366] text-white rounded hover:opacity-90"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center p-2 bg-[#1DA1F2] text-white rounded hover:opacity-90"
                      >
                        Twitter
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center p-2 bg-[#4267B2] text-white rounded hover:opacity-90"
                      >
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <CommentSection postId={currentPost.id} />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}