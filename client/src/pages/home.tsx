import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Book, ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: postsResponse, isLoading, error } = useQuery<{ posts: Post[], hasMore: boolean }>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const response = await fetch('/api/posts?page=1&limit=16');
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      console.log('Home: Fetched posts data:', data);
      return data;
    },
    retry: 3,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !postsResponse?.posts) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">Error loading latest story.</div>;
  }

  const posts = postsResponse.posts;

  const navigateToStory = (postId: number) => {
    if (!posts) return;
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      sessionStorage.setItem('selectedStoryIndex', index.toString());
      setLocation('/reader');
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="relative min-h-screen bg-background bg-[url('/assets/homepage-bg.jpeg')] bg-cover bg-center bg-no-repeat">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-[80vh] flex flex-col items-center justify-start pt-20 text-center max-w-3xl mx-auto"
        >
          <div className="space-y-6 mb-12">
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Each story here is a portal to the unexpected,
              the unsettling, and the unexplained.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 w-full max-w-lg">
            <Button
              size="lg"
              onClick={() => setLocation('/index')}
              className="text-lg h-14"
            >
              Browse Stories
              <Book className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation('/reader')}
              className="text-lg h-14"
            >
              Start Reading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {posts && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-24 text-center"
            >
              <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">Latest Story</p>
              <h2 
                className="text-2xl font-bold mb-2 hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigateToStory(posts[0].id)}
              >
                {posts[0].title}
              </h2>
              <p className="text-muted-foreground line-clamp-2 max-w-xl mx-auto mb-4">
                {posts[0].excerpt}
              </p>
              <div className="text-sm text-muted-foreground">
                {posts[0].createdAt && formatDate(posts[0].createdAt)}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}