import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Book, ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { fetchPosts } from "@/lib/wordpress-api";

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: postsResponse, isLoading, error } = useQuery({
    queryKey: ["pages", "home", "latest-post"],
    queryFn: async () => {
      return fetchPosts(1, 1);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !postsResponse?.posts) {
    return <div className="text-center p-8">Error loading latest story.</div>;
  }

  const posts = postsResponse.posts;

  const navigateToStory = (slug: string) => {
    if (!posts) return;
    setLocation(`/reader/${slug}`);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image - optimized for mobile and desktop */}
      <div 
        className="fixed inset-0 w-full h-full bg-black before:content-[''] before:fixed before:inset-0 before:bg-[url('/attached_assets/IMG_4918.jpeg')] before:bg-center before:bg-contain before:bg-no-repeat md:before:bg-fixed"
        style={{ zIndex: 0 }}
      />

      {/* Dark overlay for better text readability */}
      <div 
        className="fixed inset-0 w-full h-full bg-black/60"
        style={{ zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-[80vh] flex flex-col items-center justify-start pt-20 text-center max-w-3xl mx-auto"
          >
            <h1 className="font-decorative text-5xl sm:text-6xl md:text-7xl mb-8 tracking-wider text-foreground drop-shadow-lg">
              BUBBLE'S CAFE
            </h1>
            <div className="space-y-6 mb-12">
              <p className="text-lg sm:text-xl text-foreground/90 max-w-2xl leading-relaxed drop-shadow">
                Each story here is a portal to the unexpected,
                the unsettling, and the unexplained.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 w-full max-w-lg">
                <Button
                  size="lg"
                  onClick={() => setLocation('/stories')}
                  className="text-lg h-14 bg-[#121212] dark:bg-[#121212] hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a] text-white dark:text-white shadow-lg backdrop-blur-sm"
                >
                  Browse Stories
                  <Book className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setLocation('/reader')}
                  className="text-lg h-14 bg-[#444444] dark:bg-[#333333] hover:bg-[#505050] dark:hover:bg-[#3f3f3f] text-white dark:text-white shadow-lg backdrop-blur-sm"
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
                  <p className="text-sm font-medium text-foreground/90 mb-3 uppercase tracking-wider">Latest Story</p>
                  <h2 
                    className="text-2xl font-bold mb-2 hover:text-primary cursor-pointer transition-colors text-foreground/95"
                    onClick={() => navigateToStory(posts[0].slug)}
                    dangerouslySetInnerHTML={{ __html: posts[0].title.rendered }}
                  />
                  <div className="text-sm font-medium text-foreground/80">
                    {posts[0].date && formatDate(posts[0].date)}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}