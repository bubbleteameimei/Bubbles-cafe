import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ChevronRight } from "lucide-react";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { getExcerpt } from "@/lib/content-analysis";
import ApiLoader from "@/components/api-loader";


export default function Home() {
  const [, setLocation] = useLocation();
  
  // Add/remove body-home class and set background image when component mounts/unmounts
  useEffect(() => {
    document.body.classList.add('body-home');
    
    // Directly apply background image to body element
    document.body.style.backgroundImage = "url('/images/background.jpeg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundAttachment = "fixed";
    
    return () => {
      document.body.classList.remove('body-home');
      document.body.style.backgroundImage = "";
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
        <div className="text-center p-8">Error loading latest story.</div>
      ) : (
        <div className="relative min-h-screen overflow-x-hidden flex flex-col home-page">
          {/* Full screen background with inline styles using Vite public folder */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url("/images/background.jpeg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: -10
            }}
          ></div>
          
          {/* Dark overlay for better text contrast */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)',
              zIndex: -9
            }}
          ></div>
            
          {/* Invisible barrier to prevent scrolling under header */}
          <div className="relative w-full h-14 sm:h-16 md:h-20 lg:h-16" aria-hidden="true"></div>
          
          {/* Content container with proper z-index to appear above background - full width */}
          <div className="relative z-10 flex flex-col items-center justify-start pt-2 sm:pt-4 md:pt-6 lg:pt-8 pb-40 sm:pb-48 md:pb-56 lg:pb-64 text-center w-full min-h-screen">
            <div>
              <h1 className="font-bodoni text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-10xl mb-4 sm:mb-5 md:mb-7 tracking-wider text-white flex flex-col items-center">
                <span>BUBBLE'S</span>
                <span className="mt-1 md:mt-2">CAFE</span>
              </h1>
            </div>
          
            {/* Extra spacing for moving content down */}
            <div className="h-20 sm:h-24 md:h-32 lg:h-40 xl:h-48"></div>
          
            <div className="space-y-5 sm:space-y-6 md:space-y-8 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <div>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white w-full leading-relaxed md:leading-relaxed lg:leading-relaxed px-2 md:px-4 font-medium">
                  Each story here is a portal to the unexpected,
                  the unsettling, and the unexplained.
                </p>
              </div>

              <div>
                <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 w-full">
                  <Button
                    size="lg"
                    onClick={() => setLocation('/stories')}
                    className="text-lg sm:text-xl md:text-2xl h-14 sm:h-16 md:h-18 lg:h-20 bg-[#121212] dark:bg-[#121212] hover:bg-[#1a1a1a] dark:hover:bg-[#1a1a1a] text-white dark:text-white shadow-lg backdrop-blur-sm font-medium"
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
                    className="text-lg sm:text-xl md:text-2xl h-14 sm:h-16 md:h-18 lg:h-20 bg-[#444444] dark:bg-[#333333] hover:bg-[#505050] dark:hover:bg-[#3f3f3f] text-white dark:text-white shadow-lg backdrop-blur-sm font-medium"
                  >
                    Start Reading
                    <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-5 md:mt-6 lg:mt-8 mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                <BuyMeCoffeeButton />
              </div>
              
              {posts.length > 0 && (
                <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-10 text-center space-y-2 sm:space-y-3 md:space-y-4">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-white uppercase tracking-wider">Latest Story</p>
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