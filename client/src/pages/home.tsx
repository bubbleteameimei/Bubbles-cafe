import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Book, ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { fetchPosts } from "@/lib/wordpress-api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Debug log for theme verification
console.log("[Home] Loading page with theme settings");

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
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-background">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/IMG_4848.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'brightness(0.4)'
        }}
      />

      {/* Content with proper z-index and text protection */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="min-h-[80vh] flex flex-col items-center justify-start pt-20 text-center max-w-4xl mx-auto"
          >
            <h1 className="font-decorative text-5xl sm:text-6xl md:text-7xl mb-8 tracking-wider text-foreground drop-shadow-lg">
              BUBBLE'S CAFE
            </h1>
            <div className="space-y-12 mb-12 w-full">
              <p className="text-lg sm:text-xl text-foreground/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Each story here is a portal to the unexpected,
                the unsettling, and the unexplained.
              </p>

              <div className="grid gap-4 sm:grid-cols-2 w-full max-w-lg mx-auto">
                <Button
                  size="lg"
                  onClick={() => setLocation('/stories')}
                  className="text-lg h-14 bg-primary/90 hover:bg-primary shadow-lg backdrop-blur-sm transition-all duration-300"
                >
                  Browse Stories
                  <Book className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => setLocation('/reader')}
                  className="text-lg h-14 bg-secondary/80 hover:bg-secondary/90 shadow-lg backdrop-blur-sm transition-all duration-300"
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
                  className="mt-24 w-full"
                >
                  <h2 className="text-2xl font-bold mb-8 text-foreground/90">Latest Stories</h2>
                  <Carousel
                    opts={{
                      align: "center",
                    }}
                    className="w-full max-w-3xl mx-auto"
                  >
                    <CarouselContent>
                      {posts.map((post, index) => (
                        <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                            <Card className="backdrop-blur-md bg-card/10 border-border/10 hover:bg-card/20 transition-all duration-300 cursor-pointer"
                                 onClick={() => navigateToStory(post.slug)}>
                              <CardContent className="flex flex-col gap-4 p-6">
                                <h3 className="text-xl font-semibold text-foreground/90 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                <div 
                                  className="text-sm text-foreground/70 line-clamp-3"
                                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />
                                <div className="text-xs text-foreground/60 mt-auto">
                                  {post.date && formatDate(post.date)}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="text-foreground border-border/20 hover:bg-primary/20" />
                    <CarouselNext className="text-foreground border-border/20 hover:bg-primary/20" />
                  </Carousel>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}