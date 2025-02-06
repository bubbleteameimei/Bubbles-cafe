import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PostFooter } from "@/components/blog/post-footer";
import Mist from "@/components/effects/mist";

// Social media links
const socialLinks = {
  wordpress: "https://bubbleteameimei.wordpress.com",
  twitter: "https://twitter.com/Bubbleteameimei",
  instagram: "https://www.instagram.com/bubbleteameimei"
};

export default function Posts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  const goToPrevious = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  const goToNext = useCallback(() => {
    if (!posts?.length) return;
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  const randomize = useCallback(() => {
    if (!posts?.length) return;
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts?.length]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentIndex]);

  if (isLoading || !posts || posts.length === 0) {
    return <LoadingScreen />;
  }

  const currentPost = posts[currentIndex % posts.length];

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="story-container max-w-3xl mx-auto px-4 py-8">
        {/* Story Index */}
        <div className="mb-8 bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border/50">
          <h3 className="text-xl font-bold mb-4">Story Index</h3>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div 
                key={post.id} 
                className={`p-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-accent/50 transition-colors ${
                  index === currentIndex ? 'bg-accent' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <h4 className="font-semibold mb-2">{post.title}</h4>
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <article className="prose dark:prose-invert mx-auto">
              <h2 className="text-3xl font-bold mb-4">{currentPost.title}</h2>
              <div
                className="story-content"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph.trim().split('_').map((text, i) =>
                      i % 2 === 0 ? text : <i key={i}>{text}</i>
                    )}
                  </p>
                ))}
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        <PostFooter
          currentIndex={currentIndex}
          totalPosts={posts.length}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onRandom={randomize}
          socialLinks={socialLinks}
        />
      </div>
    </div>
  );
}