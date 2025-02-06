import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PostFooter } from "@/components/blog/post-footer";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Mist from "@/components/effects/mist";

// Social media links
const socialLinks = {
  wordpress: "https://bubbleteameimei.wordpress.com",
  twitter: "https://twitter.com/Bubbleteameimei",
  instagram: "https://www.instagram.com/bubbleteameimei"
};

export default function Stories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);

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
    // Get index from URL if present
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

  const currentPost = posts[currentIndex % posts.length];

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
                className="gap-2 backdrop-blur-sm bg-background/50 hover:bg-background/70 transition-all duration-300 hover:scale-105"
              >
                <List className="h-4 w-4" />
                Story Index
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-[540px] backdrop-blur-2xl bg-background/95">
              <SheetHeader>
                <SheetTitle className="text-2xl font-serif">Story Index</SheetTitle>
              </SheetHeader>
              <div className="mt-8 grid gap-4 pr-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {posts?.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border border-border rounded-lg cursor-pointer backdrop-blur-sm hover:bg-accent/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      index === currentIndex ? 'border-primary bg-primary/10' : 'bg-background/50'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setIsIndexOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            key={currentPost.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <article className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg mx-auto backdrop-blur-sm bg-background/50 p-6 sm:p-8 rounded-lg border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">{currentPost.title}</h2>
              <div
                className="story-content"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentPost.content.split('\n\n').map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-6"
                  >
                    {paragraph.trim().split('_').map((text, i) =>
                      i % 2 === 0 ? text : <i key={i}>{text}</i>
                    )}
                  </motion.p>
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