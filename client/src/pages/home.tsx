import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Mist from "@/components/effects/mist";

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"]
  });

  if (isLoading || !posts) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-[400px] w-full bg-muted rounded" />
      </div>
    );
  }

  const currentPost = posts[currentIndex];

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
    <div className="relative">
      <Mist />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Bubble's Cafe</h1>
        <p className="text-xl text-muted-foreground">Thoughts and emotions made into art</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
                    {paragraph.split('_').map((text, i) => 
                      i % 2 === 0 ? text : <em key={i}>{text}</em>
                    )}
                  </p>
                ))}
              </div>
            </article>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-4 mt-8">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={randomize}>
            <Shuffle className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-4">
          Story {currentIndex + 1} of {posts.length}
        </div>
      </div>
    </div>
  );
}