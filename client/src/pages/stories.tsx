import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PostFooter } from "@/components/blog/post-footer";
import { Button } from "@/components/ui/button";
import { List, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Mist from "@/components/effects/mist";

// Memoized social media links
const socialLinks = {
  wordpress: "https://bubbleteameimei.wordpress.com",
  twitter: "https://twitter.com/Bubbleteameimei",
  instagram: "https://www.instagram.com/bubbleteameimei"
} as const;

function renderContent(content: string) {
  return content.split('\n\n').map((paragraph: string, index: number) => {
    // Clean up any residual HTML tags while preserving italics
    const cleanedText = paragraph
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?p>/g, '')
      .trim();

    // Process italics by converting _text_ to <em>text</em>
    // Only process underscores that are actually part of italics (paired)
    const processedText = cleanedText.split('_').map((text, i) => {
      // Every odd index (1, 3, etc.) should be italicized
      return i % 2 === 0 ? text : `<em>${text}</em>`;
    }).join('');

    return (
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.1, 2), type: "spring", stiffness: 100 }}
        className="mb-6 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  });
}

export default function Stories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: posts = [], isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false
  });

  // Memoize navigation functions for better performance
  const navigate = useCallback((newIndex: number) => {
    if (isNavigating) return; // Prevent double clicks
    setIsNavigating(true);
    setCurrentIndex(newIndex);
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => setIsNavigating(false), 100); // Shorter debounce time
  }, [isNavigating]);

  const goToPrevious = useCallback(() => {
    if (!posts.length || isNavigating) return;
    navigate(currentIndex === 0 ? posts.length - 1 : currentIndex - 1);
  }, [posts.length, currentIndex, navigate, isNavigating]);

  const goToNext = useCallback(() => {
    if (!posts.length || isNavigating) return;
    navigate(currentIndex === posts.length - 1 ? 0 : currentIndex + 1);
  }, [posts.length, currentIndex, navigate, isNavigating]);

  const randomize = useCallback(() => {
    if (!posts.length || isNavigating) return;
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * posts.length);
    } while (newIndex === currentIndex && posts.length > 1);
    navigate(newIndex);
  }, [posts.length, navigate, currentIndex, isNavigating]);

  // Memoize current post to prevent unnecessary re-renders
  const currentPost = useMemo(() => {
    if (!posts.length) return null;
    return posts[currentIndex % posts.length];
  }, [posts, currentIndex]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const index = parseInt(params.get('index') || '0');
    if (!isNaN(index) && posts && index >= 0 && index < posts.length) {
      setCurrentIndex(index);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [posts]);

  if (isLoading || !posts || posts.length === 0) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center p-8">Error loading stories. Please try again later.</div>;
  }

  if (!currentPost) {
    return <div className="text-center p-8">No stories available.</div>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="story-container relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <Sheet open={isIndexOpen} onOpenChange={setIsIndexOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-background/50 hover:bg-background/70 transition-all duration-300 will-change-transform hover:scale-105"
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <List className="h-4 w-4" />
                )}
                Story Index
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-[540px] backdrop-blur-2xl bg-background/95">
              <SheetHeader>
                <SheetTitle className="text-2xl font-serif">Story Index</SheetTitle>
              </SheetHeader>
              <div className="mt-8 grid gap-4 pr-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {posts.map((post: Post, index: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 1), type: "spring" }}
                    className={`p-4 border border-border rounded-lg cursor-pointer backdrop-blur-sm hover:bg-accent/50 transition-all duration-300 will-change-transform hover:scale-[1.02] active:scale-[0.98] ${
                      index === currentIndex ? 'border-primary bg-primary/10' : 'bg-background/50'
                    }`}
                    onClick={() => {
                      if (isNavigating) return;
                      navigate(index);
                      setIsIndexOpen(false);
                    }}
                  >
                    <h4 className="font-serif font-semibold mb-2">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </motion.div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost?.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto backdrop-blur-sm bg-background/50 p-6 sm:p-8 rounded-lg border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
                {currentPost?.title}
              </h2>
              <div className="story-content">
                {currentPost && renderContent(currentPost.content)}
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