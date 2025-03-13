import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ChevronRight } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { fetchPosts } from "@/lib/wordpress-api";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { getExcerpt } from "@/lib/content-analysis";
import FadeInSection from "../components/transitions/FadeInSection";

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
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Full screen background image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="fixed inset-0" 
        style={{
          backgroundImage: `url('/attached_assets/IMG_4918.jpeg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          width: '100vw',
          height: '100vh',
          zIndex: -2,
          willChange: 'transform',
          transform: 'translateZ(0)'
        }} 
      />

      {/* Gradient overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/50"
        style={{ zIndex: -1 }}
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-20 text-center max-w-3xl mx-auto px-4">
        <FadeInSection style="horror" direction="scale" duration={0.8}>
          <h1 className="font-decorative text-5xl sm:text-6xl md:text-7xl mb-8 tracking-wider text-foreground drop-shadow-lg flex flex-col items-center">
            <span>BUBBLE'S</span>
            <span className="mt-2">CAFE</span>
          </h1>
        </FadeInSection>
        
        <div className="space-y-6 mb-12">
          <FadeInSection style="glitch" direction="up" delay={0.2} duration={0.6}>
            <p className="text-lg sm:text-xl text-foreground/90 max-w-2xl leading-relaxed drop-shadow">
              Each story here is a portal to the unexpected,
              the unsettling, and the unexplained.
            </p>
          </FadeInSection>

          <FadeInSection style="horror" direction="up" delay={0.3} duration={0.5}>
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
          </FadeInSection>
          
          <FadeInSection style="horror" direction="up" delay={0.4} duration={0.5} className="mt-10 mb-10">
            <BuyMeCoffeeButton />
          </FadeInSection>
          
          {posts && posts.length > 0 && (
            <FadeInSection style="horror" delay={0.9} duration={0.8} className="mt-16 text-center space-y-4">
              <p className="text-sm font-medium text-foreground/90 uppercase tracking-wider">Latest Story</p>
              <div 
                onClick={() => navigateToStory(posts[0].slug)}
                className="group cursor-pointer hover:scale-[1.01] transition-transform duration-200"
              >
                <h2 
                  className="text-2xl font-bold mb-3 text-foreground/95 group-hover:text-primary transition-colors"
                  dangerouslySetInnerHTML={{ __html: posts[0]?.title?.rendered || 'Featured Story' }}
                />
                <div className="text-foreground/80 max-w-xl mx-auto mb-4 line-clamp-2">
                  {posts[0]?.content?.rendered && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      {getExcerpt(posts[0].content.rendered)}
                    </motion.span>
                  )}
                </div>
                <div className="flex items-center justify-center text-sm text-primary gap-1 group-hover:gap-2 transition-all duration-300">
                  Read full story 
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-sm font-medium text-foreground/70 mt-3">
                  {posts[0]?.date ? formatDate(posts[0].date) : ''}
                </div>
              </div>
            </FadeInSection>
          )}
        </div>
      </div>
    </div>
  );
}