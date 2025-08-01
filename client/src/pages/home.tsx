import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ChevronRight } from "lucide-react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { getExcerpt } from "@/lib/content-analysis";
import ApiLoader from "@/components/api-loader";
// Removed BloodDrippingText import - removing blood effects per user request


export default function Home() {
  const [, setLocation] = useLocation();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Basic setup for homepage without background images
  useEffect(() => {
    // Set body to default background
    document.body.style.backgroundColor = "hsl(var(--background))";
    
    // Mark as loaded for consistency
    setImageLoaded(true);
    
    return () => {
      // Clean up styling
      document.body.style.backgroundColor = "";
    };
  }, []);
  
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
      
      {error ? (
        <div className="text-center p-8 text-white bg-black/70 rounded-lg max-w-2xl mx-auto mt-20">
          <h2 className="text-xl font-bold mb-4">Unable to load latest story</h2>
          <p className="mb-4">The database connection is currently unavailable, but you can still explore the site.</p>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button 
                onClick={() => setLocation('/reader')}
                className="group w-full px-6 py-3 bg-gradient-to-r from-slate-600 via-slate-700 to-gray-700 hover:from-slate-500 hover:via-slate-600 hover:to-gray-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl font-medium text-lg text-center"
              >
                Browse Stories
                <motion.div
                  animate={{ 
                    x: [0, 3, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="ml-2"
                >
                  <Book className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                </motion.div>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Button 
                onClick={() => window.location.reload()}
                className="group w-full px-6 py-3 bg-[#444444] hover:bg-[#505050] text-white shadow-lg transition-all duration-300 hover:shadow-xl font-medium text-lg text-center"
              >
                Try Again
                <motion.div
                  animate={{ 
                    x: [0, 4, 0]
                  }}
                  transition={{ 
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="ml-2"
                >
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen overflow-x-hidden flex flex-col home-page">
          {/* We are using the CSS-based background image instead of this div (see index.css body.body-home::before) */}
            
          {/* Invisible barrier to prevent scrolling under header */}
          <div className="relative w-full h-2 sm:h-3 md:h-4 lg:h-3" aria-hidden="true"></div>
          
          {/* Content container with proper z-index to appear above background - full width */}
          <div className="relative z-10 flex flex-col items-center justify-start pt-0 pb-6 sm:pb-8 md:pb-10 lg:pb-12 text-center w-full min-h-screen">
            <div className="relative">
              <h1 className="font-serif text-7xl sm:text-8xl md:text-9xl lg:text-10xl xl:text-11xl mb-2 sm:mb-3 md:mb-4 tracking-wider text-white flex flex-col items-center">
                <span>BUBBLES</span>
                <span className="mt-1 md:mt-2 text-red-700 relative">CAFE</span>
              </h1>
            </div>
          
            {/* Minimal spacing */}
            <div className="h-2 sm:h-3 md:h-4 lg:h-5 xl:h-6"></div>
          
            <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-1 sm:mb-2 md:mb-3 lg:mb-4 flex-grow flex flex-col justify-between">
              <div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white w-full leading-relaxed md:leading-relaxed lg:leading-relaxed px-2 md:px-4 font-medium">
                  Every story here is a portal to the unexpected,
                  the unexplained, and <span className="italic text-red-700">the unsettling<span className="text-red-700 font-bold">.</span></span>
                </p>
              </div>

              <div>
                <div className="flex flex-col gap-3 w-full max-w-md mx-auto px-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => setLocation('/stories')}
                      className="group relative w-[90%] h-14 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white shadow-lg backdrop-blur-sm font-sans font-medium text-lg transition-all duration-300 hover:shadow-xl active:scale-95 rounded-lg flex items-center justify-center px-4 mx-auto"
                    >
                      <span className="text-center mr-2">Browse Stories</span>
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -5, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Book className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                      </motion.div>
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => posts && posts.length > 0 
                        ? setLocation('/reader')  // Always navigate to the reader page
                        : setLocation('/reader')  // Fallback to /reader if no posts
                      }
                      className="group relative w-[90%] h-14 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white shadow-lg backdrop-blur-sm font-sans font-medium text-lg transition-all duration-300 hover:shadow-xl active:scale-95 rounded-lg flex items-center justify-center px-4 mx-auto"
                    >
                      <span className="text-center mr-2">Start Reading</span>
                      <motion.div
                        animate={{ 
                          x: [0, 6, 0]
                        }}
                        transition={{ 
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <div className="mt-1 sm:mt-2 md:mt-3 lg:mt-4 mb-1 sm:mb-2 md:mb-3 lg:mb-4">
                <BuyMeCoffeeButton />
              </div>
              
              {posts.length > 0 && (
                <div className="mt-3 sm:mt-4 md:mt-5 lg:mt-6 text-center space-y-2 sm:space-y-3 md:space-y-4">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white uppercase tracking-wider font-sans">Latest Story</p>
                  <div 
                    onClick={() => setLocation('/reader')} 
                    className="group cursor-pointer hover:scale-[1.01] transition-transform duration-200 w-full p-2 md:p-4 lg:p-6 rounded-lg hover:bg-foreground/5 dark:hover:bg-foreground/10 bg-black/40 backdrop-blur-sm"
                  >
                    <h2 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-5 text-white group-hover:text-primary transition-colors px-2"
                      dangerouslySetInnerHTML={{ __html: posts[0]?.title?.rendered || 'Featured Story' }}
                    />
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 w-full mb-3 sm:mb-4 md:mb-5 line-clamp-2 px-2 md:px-4 leading-relaxed md:leading-relaxed">
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
                    <div className="text-sm sm:text-base md:text-lg font-medium text-white/70 mt-3 md:mt-4">
                      {posts[0]?.date ? formatDate(posts[0].date) : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}