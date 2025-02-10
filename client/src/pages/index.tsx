import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { detectThemes, calculateIntensity } from "@/lib/content-analysis";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, Calendar } from "lucide-react";
import { LikeDislike } from "@/components/ui/like-dislike";
import Mist from "@/components/effects/mist";

// Helper function to generate and persist random stats
const getOrCreateStats = (postId: number) => {
  const storageKey = `post-stats-${postId}`;
  const existingStats = localStorage.getItem(storageKey);

  if (existingStats) {
    return JSON.parse(existingStats);
  }

  const newStats = {
    likes: Math.floor(Math.random() * 71) + 80, // Random between 80-150
    dislikes: Math.floor(Math.random() * 15)
  };

  localStorage.setItem(storageKey, JSON.stringify(newStats));
  return newStats;
};

// Update the excerpt function to be more concise
const getExcerpt = (content: string) => {
  if (!content) return '';

  const paragraphs = content.split('\n\n');
  const engagingParagraph = paragraphs.find(p => 
    p.includes('!') || 
    p.includes('?') || 
    p.includes('...') || 
    p.toLowerCase().includes('suddenly') ||
    p.toLowerCase().includes('horror') ||
    p.toLowerCase().includes('fear') ||
    p.toLowerCase().includes('scream') ||
    p.toLowerCase().includes('blood') ||
    p.toLowerCase().includes('dark')
  );

  const selectedParagraph = engagingParagraph || paragraphs[0];
  const maxLength = 100; // Reduced from 120
  const trimmed = selectedParagraph.trim();
  return trimmed.length > maxLength 
    ? trimmed.slice(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
    : trimmed;
};

const getReadingTime = (content: string) => {
  if (!content) return '0 min read';
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};

export default function IndexView() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000
  });

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const navigateToStory = (postId: number) => {
    if (!posts) return;
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      setLocation('/reader');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !posts || posts.length === 0) {
    return <div className="text-center p-8">Stories not found or error loading stories.</div>;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Mist className="opacity-40" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="flex items-center justify-between mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">Index</h1>
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-muted-foreground hover:text-primary"
            >
              Back to Home
            </Button>
          </motion.div>

          <motion.div 
            className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {posts.map((post, index) => {
              const readingTime = getReadingTime(post.content);
              const excerpt = getExcerpt(post.content);
              const stats = getOrCreateStats(post.id);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <Card className="relative flex flex-col h-full hover:shadow-xl transition-all duration-300 bg-card border-border hover:border-primary/20 z-10">
                    <CardHeader className="relative py-2 px-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle 
                          className="text-base font-serif group-hover:text-primary transition-colors"
                        >
                          {post.title}
                        </CardTitle>
                        <div className="text-[10px] text-muted-foreground font-mono space-y-0.5">
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="h-3 w-3" />
                            <time>{formatDate(post.createdAt)}</time>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            <span>{readingTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent 
                      onClick={() => navigateToStory(post.id)}
                      className="cursor-pointer py-1 px-3 flex-grow"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 font-serif">
                        {excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-primary/80">
                            Level {calculateIntensity(post.content)}/5
                          </span>
                          {detectThemes(post.content)[0] && (
                            <span className="text-muted-foreground">
                              {detectThemes(post.content)[0].charAt(0) + 
                               detectThemes(post.content)[0].slice(1).toLowerCase().replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-primary gap-1 group-hover:gap-2 transition-all duration-300">
                        Read full story <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                    <CardFooter className="relative mt-auto py-2 px-3 border-t border-border bg-card">
                      <div className="w-full">
                        <LikeDislike
                          postId={post.id}
                          initialLikes={stats.likes}
                          initialDislikes={stats.dislikes}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}