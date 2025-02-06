import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { useState } from "react";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
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
import { useLocation } from "wouter";

export default function StoryIndex() {
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    networkMode: 'offlineFirst',
    refetchOnWindowFocus: false
  });

  const handlePostClick = (post: Post) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setIsIndexOpen(false);

    // Use setTimeout to ensure the sheet closes before navigation
    setTimeout(() => {
      setLocation(`/stories/${post.slug}`);
      // Reset navigation state after a longer delay to prevent any unwanted side effects
      setTimeout(() => setIsNavigating(false), 500);
    }, 300); // Match the sheet close animation duration
  };

  if (isLoading || !posts || posts.length === 0) {
    return <LoadingScreen />;
  }

  if (error) {
    return <div className="text-center p-8">Error loading stories. Please try again later.</div>;
  }

  return (
    <div className="relative min-h-screen bg-[url('/assets/IMG_4399.jpeg')] bg-cover bg-center bg-fixed before:content-[''] before:absolute before:inset-0 before:bg-background/90">
      <Mist className="opacity-40" />
      <div className="story-container relative z-10 max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <Sheet
            open={isIndexOpen}
            onOpenChange={(open) => {
              if (!isNavigating) {
                setIsIndexOpen(open);
              }
            }}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 backdrop-blur-sm bg-background/50 hover:bg-background/70 transition-colors"
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
            <SheetContent 
              side="right" 
              className="w-[90vw] sm:w-[540px] backdrop-blur-2xl bg-background/95"
            >
              <SheetHeader>
                <SheetTitle className="text-2xl font-serif">Story Index</SheetTitle>
              </SheetHeader>
              <div className="mt-8 grid gap-4 pr-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                {posts.map((post: Post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="p-4 border border-border rounded-lg cursor-pointer backdrop-blur-sm hover:bg-accent/50 transition-colors"
                    onClick={() => handlePostClick(post)}
                  >
                    <h4 className="font-serif font-semibold mb-2">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </motion.div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}