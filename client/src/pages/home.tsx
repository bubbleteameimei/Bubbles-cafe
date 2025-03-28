import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ChevronRight } from "lucide-react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { getExcerpt } from "@/lib/content-analysis";
import FadeInSection from "../components/transitions/FadeInSection";
import ApiLoader from "@/components/api-loader";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import BackgroundGradient from "@/components/BackgroundGradient";

export default function Home() {
  const [, setLocation] = useLocation();
  
  const { data: postsResponse, isLoading, error } = useQuery({
    queryKey: ["pages", "home", "latest-post"],
    queryFn: async () => {
      return fetchWordPressPosts({ page: 1, perPage: 1 });
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  // Function to navigate to a story detail page
  const navigateToStory = (slug: string) => {
    setLocation(`/reader/${slug}`);
  };

  // Format date helper
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Use our ApiLoader component to handle global loading state
  const posts = postsResponse?.posts || [];
  
  return (
    <>
      <ApiLoader isLoading={isLoading} />
      {/* Feedback button only on homepage */}
      <FeedbackButton position="bottom-left" />
      
      {error ? (
        <div className="text-center p-8">Error loading latest story.</div>
      ) : (
        <div className="relative w-full min-h-screen overflow-auto bg-background/5">
          {/* Background container - parent element with relative positioning */}
          <div className="relative min-h-screen w-full">
            {/* Full screen background image - using CSS class from index.css */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="bg-homepage" 
            />
            
            {/* REMOVED: No gradient overlay */}
            
            {/* Content container - siblings with the background div */}
            <div className="relative z-10 flex flex-col items-center justify-start pt-4 sm:pt-6 md:pt-10 lg:pt-16 pb-40 sm:pb-48 md:pb-56 lg:pb-64 text-center max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              <FadeInSection style="horror" direction="scale" duration={0.8}>
                <h1 className="font-bodoni text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-10xl mb-4 sm:mb-5 md:mb-7 tracking-wider text-foreground drop-shadow-lg flex flex-col items-center">
                  <span>BUBBLE'S</span>
                  <span className="mt-1 md:mt-2">CAFE</span>
                </h1>
              </FadeInSection>
            
              {/* Extra spacing for moving content down */}
              <div className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48"></div>
            
              <div className="space-y-5 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
                <FadeInSection style="glitch" direction="up" delay={0.2} duration={0.6}>
                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/90 max-w-2xl md:max-w-3xl leading-relaxed md:leading-relaxed lg:leading-relaxed drop-shadow px-2 md:px-4 font-medium">
                    Each story here is a portal to the unexpected,
                    the unsettling, and the unexplained.
                  </p>
                </FadeInSection>

                <FadeInSection style="horror" direction="up" delay={0.3} duration={0.5}>
                  <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 w-full max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
                    <Button
                      size="lg"
                      onClick={() => setLocation('/stories')}
                      className="text-lg sm:text-xl md:text-2xl h-12 sm:h-14 md:h-16 lg:h-18 bg-[#121212] dark:bg-[#121212] hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a] text-white dark:text-white shadow-lg backdrop-blur-sm font-medium"
                    >
                      Browse Stories
                      <Book className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => posts && posts.length > 0 
                        ? setLocation('/reader')  // Always navigate to the reader page
                        : setLocation('/reader')  // Fallback to /reader if no posts
                      }
                      className="text-lg sm:text-xl md:text-2xl h-12 sm:h-14 md:h-16 lg:h-18 bg-[#444444] dark:bg-[#333333] hover:bg-[#505050] dark:hover:bg-[#3f3f3f] text-white dark:text-white shadow-lg backdrop-blur-sm font-medium"
                    >
                      Start Reading
                      <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    </Button>
                  </div>
                </FadeInSection>
                
                <FadeInSection style="horror" direction="up" delay={0.4} duration={0.5} className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                  <BuyMeCoffeeButton />
                </FadeInSection>
                
                {posts.length > 0 && (
                  <FadeInSection style="horror" delay={0.7} duration={0.8} className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 text-center space-y-2 sm:space-y-3 md:space-y-4">
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-foreground/90 uppercase tracking-wider">Latest Story</p>
                    <div 
                      onClick={() => setLocation('/reader')} 
                      className="group cursor-pointer hover:scale-[1.01] transition-transform duration-200 max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto p-2 md:p-4 lg:p-6 rounded-lg hover:bg-foreground/5 dark:hover:bg-foreground/10"
                    >
                      <h2 
                        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 text-foreground/95 group-hover:text-primary transition-colors px-2"
                        dangerouslySetInnerHTML={{ __html: posts[0]?.title?.rendered || 'Featured Story' }}
                      />
                      <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 mx-auto mb-3 sm:mb-4 md:mb-5 line-clamp-2 px-2 md:px-4 leading-relaxed md:leading-relaxed">
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
                      <div className="flex items-center justify-center text-sm sm:text-base md:text-lg lg:text-xl text-primary gap-1 group-hover:gap-2 transition-all duration-300 font-medium">
                        Read full story 
                        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="text-sm sm:text-base md:text-lg font-medium text-foreground/70 mt-3 md:mt-4">
                        {posts[0]?.date ? formatDate(posts[0].date) : ''}
                      </div>
                    </div>
                  </FadeInSection>
                )}
              </div>
            </div>
          </div>
          
          {/* Footer is now handled by the App component */}
        </div>
      )}
    </>
  );
}