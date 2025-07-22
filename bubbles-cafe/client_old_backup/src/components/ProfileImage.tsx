import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileImage() {
  const [loadError, setLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  
  // Debug message on component mount
  useEffect(() => {
    console.log("ProfileImage component mounted");
  }, []);
  
  // Define optimized images with progressive loading strategy
  const images = [
    { 
      src: '/images/optimized/profile-optimized.jpg', 
      alt: 'Profile Image 1',
      // Smaller blur version for faster loading
      blurSrc: '/images/optimized/profile-blur.jpg',
      // Proper srcset for responsive loading
      srcset: '/images/optimized/profile-optimized.jpg 600w, /images/IMG_5266.png 900w'
    }
  ];
  
  // Use eager loading with preload
  useEffect(() => {
    // Add preload link to head to prioritize image loading
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = images[0].src;
    document.head.appendChild(preloadLink);
    
    // Immediate state set for better perceived performance
    setImageLoaded(true);
    
    return () => {
      // Clean up preload link on unmount
      document.head.removeChild(preloadLink);
    };
  }, []);
  
  // Scroll to a specific image index with smoother animation
  const scrollToIndex = useCallback((index: number) => {
    const validIndex = ((index % images.length) + images.length) % images.length; // Ensures positive modulo
    
    if (carouselRef.current) {
      const scrollAmount = validIndex * carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setActiveIndex(validIndex);
    }
  }, [images.length]);
  
  // Go to next image with loop
  const handleNext = () => {
    if (activeIndex < images.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0); // Loop back to the first image
    }
  };

  // Go to previous image with loop
  const handlePrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    } else {
      scrollToIndex(images.length - 1); // Loop to the last image
    }
  };

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  // Detect swipe direction and navigate
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;
    const threshold = 50; // Minimum distance to trigger swipe
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swiped left, go next
        handleNext();
      } else {
        // Swiped right, go previous
        handlePrev();
      }
    }
    
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]); // Add dependency to fix the closure issue

  // Update the active index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) {
        const scrollLeft = carouselRef.current.scrollLeft;
        const itemWidth = carouselRef.current.offsetWidth;
        const index = Math.round(scrollLeft / itemWidth);
        if (index !== activeIndex && index >= 0 && index < images.length) {
          setActiveIndex(index);
        }
      }
    };

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', handleScroll);
      return () => carouselElement.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex, images.length]);
  
  // Handle image error and loading state
  const handleImageError = () => {
    setLoadError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  return (
    <div className="relative flex justify-center mt-4" style={{ width: '100%' }}>
      {/* Subtle shadow container for depth */}
      <div className="absolute rounded-full w-[210px] h-[210px] opacity-15 blur-md bg-black transform -translate-x-1 translate-y-2"></div>
      
      {/* Navigation buttons removed per user request */}
      
      <div className="relative" style={{ width: '200px', height: '200px' }}>
        {/* Reduced subtle glow effect behind the image */}
        <div className="absolute inset-0 rounded-full bg-[#8B0000]/20 dark:bg-[#8B0000]/30 blur-xl transform scale-[1.2]" 
             style={{ animation: 'pulse-slow 4s ease-in-out infinite' }}></div>
                
        {/* Container for the image carousel */}
        <div className="h-48 w-48 relative border-2 border-[#8B0000]/30 dark:border-[#8B0000]/40 shadow-lg 
                      ring-1 ring-[#660000]/20 dark:ring-[#660000]/30 ring-offset-1 ring-offset-background 
                      rounded-full overflow-hidden
                      p-1 bg-background/70 mx-auto transition-all duration-700 
                      hover:shadow-[0_0_15px_rgba(139,0,0,0.4)] dark:hover:shadow-[0_0_20px_rgba(139,0,0,0.5)]">
          {/* Carousel wrapper */}
          <div 
            ref={carouselRef}
            className="w-full h-full rounded-full overflow-hidden flex scroll-smooth"
            style={{ 
              position: "relative",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none", 
              msOverflowStyle: "none",
              overflowX: "auto",
              display: "flex"
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Render all three images in the carousel */}
            {images.map((image, idx) => (
              <div 
                key={idx}
                className="min-w-full h-full rounded-full overflow-hidden flex-shrink-0 scroll-snap-align-start"
                style={{ position: "relative" }}
              >
                {/* Blur image that loads first */}
                {!imageLoaded && (
                  <img 
                    src={image.blurSrc}
                    alt=""
                    style={{
                      position: "absolute",
                      height: "145%",
                      width: "auto",
                      left: "45%",
                      top: "20%",
                      transform: "translate(-50%, -15%)",
                      objectFit: "cover",
                      objectPosition: "center 10%",
                      transition: "opacity 0.5s ease-in-out",
                    }}
                    className="transition-opacity"
                  />
                )}
                
                {/* Main high quality image */}
                <img 
                  src={image.src}
                  srcSet={image.srcset}
                  alt={image.alt}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  style={{
                    position: "absolute",
                    height: "145%", /* Reduced zoom to 145% per user request */
                    width: "auto", /* Width auto to maintain aspect ratio */
                    left: "45%", /* Shifted left as requested (from 50% to 45%) */
                    top: "20%", /* Keeps position high as requested */
                    transform: "translate(-50%, -15%)", /* Adjusted for top focus */
                    objectFit: "cover", /* Ensure the image covers the area */
                    objectPosition: "center 10%", /* Focus point high */
                    transition: "all 0.8s ease-in-out", /* Smoother animation transition */
                    opacity: imageLoaded ? 1 : 0,
                  }}
                  className="transition-all duration-1000 will-change-transform"
                  onError={handleImageError}
                  onLoad={() => {
                    console.log("[Profile] Image loaded successfully");
                    handleImageLoad();
                  }}
                />
                {/* Overlay removed per user request */}
              </div>
            ))}
          </div>
          
          {/* Dot indicators removed since there's only one image */}
        </div>
      </div>
    </div>
  );
}