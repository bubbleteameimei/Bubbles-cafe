import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Mist from "@/components/effects/mist";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  if (isLoading || !posts || posts.length === 0) {
    return <LoadingScreen />;
  }

  const currentPost = posts[currentIndex % posts.length];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === posts.length - 1 ? 0 : prev + 1));
  };

  const randomize = () => {
    const newIndex = Math.floor(Math.random() * posts.length);
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="max-w-3xl mx-auto pb-48">
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

        <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-4 bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
          <div className="flex items-center justify-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={goToPrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous Story</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={randomize}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Random Story</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={goToNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next Story</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground fixed bottom-36 left-1/2 transform -translate-x-1/2">
          Story {currentIndex + 1} of {posts.length}
        </div>
      </div>
    </div>
  );
}