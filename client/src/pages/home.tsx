import { useQuery } from "@tanstack/react-query";
import { type Post } from "@shared/schema";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import Mist from "@/components/effects/mist";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    console.error('Error loading stories:', error);
    return <div className="text-center p-8">Error loading latest story.</div>;
  }

  return (
    <div className="relative min-h-screen">
      <Mist />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 font-serif">
            Welcome to Bubble's Cafe
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
            Step into a realm where reality blends with the surreal. Each story here is a portal to the unexpected,
            the unsettling, and the unexplained.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 w-full max-w-lg">
            <Button
              size="lg"
              onClick={() => setLocation('/stories')}
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
              className="mt-16 text-center"
            >
              <p className="text-sm text-muted-foreground mb-3 uppercase tracking-wide font-mono">Latest Story</p>
              <h2 className="text-2xl font-bold mb-2 hover:text-primary cursor-pointer transition-colors"
                  onClick={() => setLocation(`/stories/${posts[0].slug}`)}>
                {posts[0].title}
              </h2>
              <p className="text-muted-foreground line-clamp-2 max-w-xl mx-auto mb-4">
                {posts[0].excerpt}
              </p>
              <div className="text-sm text-muted-foreground font-mono">
                {new Date(posts[0].createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}