import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Book, ArrowRight, ChevronRight, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchWordPressPosts } from "@/lib/wordpress-api";
import { BuyMeCoffeeButton } from "@/components/BuyMeCoffeeButton";
import { getExcerpt } from "@/lib/content-analysis";
import { sanitizeHtmlContent } from "@/lib/sanitize-content";
import ApiLoader from "@/components/api-loader";


export default function Home() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  
  // Basic setup for homepage without background images
  useEffect(() => {
    // Set body to default background
    document.body.style.backgroundColor = "hsl(var(--background))";
    
    return () => {
      // Clean up styling
      document.body.style.backgroundColor = "";
    };
  }, []);

  // Defer non-critical animations until hero is in viewport
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: '0px', threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Ensure images within hero are lazily loaded
  useEffect(() => {
    const root = heroRef.current;
    if (!root) return;
    const imgs = root.querySelectorAll<HTMLImageElement>('img');
    imgs.forEach((img) => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', 'async');
      }
    });
  }, [inView]);
  
  const { data: postsResponse, isLoading, error } = useQuery({
    queryKey: ["pages", "home", "latest-post"],
    queryFn: async () => {
      return fetchWordPressPosts({ page: 1, perPage: 1 });
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Lightweight engagement fetch for social proof
  const { data: engagement } = useQuery({
    queryKey: ["analytics", "engagement"],
    queryFn: async () => {
      const res = await fetch('/api/analytics/engagement');
      if (!res.ok) throw new Error('Failed to load engagement');
      return res.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Reading time analytics for monthly views
  const { data: readingTime } = useQuery({
    queryKey: ["analytics", "reading-time"],
    queryFn: async () => {
      const res = await fetch('/api/analytics/reading-time');
      if (!res.ok) throw new Error('Failed to load reading-time');
      return res.json();
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
  


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
    <div>
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
                    x: [0, 3, 0],
                    rotate: [0, 10, -5, 0],
                    scale: [1, 1.05, 0.98, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="ml-2"
                >
                  <Book className="h-4 w-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
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
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
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
          <div ref={heroRef} className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-10 sm:pb-12 md:pb-16 lg:pb-20 text-center w-full min-h-screen">
            <div className="relative">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
                className="font-serif text-7xl sm:text-8xl md:text-9xl lg:text-10xl xl:text-11xl mb-6 sm:mb-8 md:mb-10 tracking-wider text-white flex flex-col items-center"
              >
                <span>BUBBLES</span>
                <span className="mt-1 md:mt-2 text-red-700 relative">CAFE</span>
              </motion.h1>
            </div>
          
            {/* Increased spacing */}
            <div className="h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14"></div>
          
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
              className="px-4 max-w-2xl mx-auto"
            >
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 leading-[1.7] font-normal" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Every story here is a portal to the unexpected,
                the unexplained, and <span className="italic text-red-700">the unsettling<span className="text-red-700 font-bold">.</span></span>
              </p>
            </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.4, delay: 0.22, ease: 'easeOut' }}
                className="w-full mt-8 sm:mt-10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 w-full max-w-2xl mx-auto px-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Button
                      size="lg"
                      onClick={() => setLocation('/stories')}
                      aria-label="Browse horror stories"
                      className="group relative w-full h-14 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white shadow-lg backdrop-blur-sm font-sans font-medium text-lg transition-all duration-300 hover:shadow-xl active:scale-95 rounded-lg flex items-center justify-center px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="text-center mr-2">Browse Stories</span>
                      <motion.div
                        animate={inView ? {
                          rotate: [0, 10, -6, 4, 0],
                          scale: [1, 1.06, 0.98, 1.03, 1]
                        } : undefined}
                        transition={{ 
                          duration: 3.6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Book className="h-4 w-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
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
                      onClick={() => setLocation('/reader')}
                      aria-label="Start reading now"
                      className="group relative w-full h-14 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white shadow-lg backdrop-blur-sm font-sans font-medium text-lg transition-all duration-300 hover:shadow-xl active:scale-95 rounded-lg flex items-center justify-center px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="text-center mr-2">Start Reading</span>
                      <motion.div
                        animate={inView ? { x: [0, 4, 0] } : undefined}
                        transition={{ 
                          duration: 1.1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <ChevronRight className="h-8 w-8 group-hover:translate-x-2 transition-transform duration-300" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              {/* Monthly readers pill removed by request */}
              
              {posts.length > 0 && (
                <div className="mt-8 sm:mt-10 text-center space-y-4 sm:space-y-5 md:space-y-6 w-full px-4 max-w-4xl mx-auto">
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white uppercase tracking-wider font-sans">Latest Story</p>
                  <div 
                    onClick={() => setLocation('/reader')} 
                    className="group cursor-pointer w-full p-5 sm:p-6 md:p-8 rounded-xl bg-gradient-to-b from-white/5 to-white/0 dark:from-white/10 dark:to-white/0 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] hover:border-primary/30"
                  >
                    <h2 
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-5 text-white group-hover:text-primary transition-colors px-2 sm:px-3"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtmlContent(posts[0]?.title?.rendered || 'Featured Story') }}
                    />
                    <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 w-full mb-4 sm:mb-5 md:mb-6 line-clamp-2 px-2 sm:px-3 leading-relaxed md:leading-relaxed">
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
                    <div className="flex items-center justify-center text-sm sm:text-base md:text-lg lg:text-xl text-primary gap-1 group-hover:gap-2 transition-all duration-300 font-medium mt-1 md:mt-2">
                      Read full story 
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="text-sm sm:text-base md:text-lg font-medium text-white/70 mt-3 md:mt-4">
                      {posts[0]?.date ? formatDate(posts[0].date) : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}