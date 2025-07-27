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
          <div className="relative w-full h-14 sm:h-16 md:h-20 lg:h-16" aria-hidden="true"></div>
          
          {/* Content container with proper z-index to appear above background - full width */}
          <div className="relative z-10 flex flex-col items-center justify-start pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-6 sm:pb-8 md:pb-10 lg:pb-12 text-center w-full min-h-screen">
            <div>
              <h1 className="font-bodoni text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-10xl mb-4 sm:mb-5 md:mb-7 tracking-wider text-white flex flex-col items-center" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)' }}>
                <span>BUBBLE'S</span>
                <span className="mt-1 md:mt-2 text-red-700">CAFE</span>
              </h1>
            </div>
          
            {/* Extra spacing for moving content down */}
            <div className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48"></div>
          
            <div className="space-y-5 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white w-full leading-relaxed md:leading-relaxed lg:leading-relaxed px-2 md:px-4 font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.9)' }}>
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
                          x: [0, 2, 0]
                        }}
                        transition={{ 
                          duration: 2,
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
                          x: [0, 2, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <BuyMeCoffeeButton />
              </div>
              
              {posts.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 text-center space-y-2 sm:space-y-3 md:space-y-4">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white uppercase tracking-wider font-sans" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>Latest Story</p>
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