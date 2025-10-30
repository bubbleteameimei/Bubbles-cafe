import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export default function ProfileImage() {
  const [_loadError, setLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  
  // Debug message on component mount
  useEffect(() => {
    console.log("ProfileImage component mounted");
  }, []);
  
  // Define optimized images with progressive loading strategy
  // Updated to use the new author profile image. Place the file at:
  // client/public/images/author-profile.jpg
  // Add a cache-busting param so the latest uploaded file is used immediately.
  const [bust] = useState(() => String(Date.now()));
  const images = useMemo(() => [
    { 
      src: `/images/author-profile.jpg?v=${bust}`,
      alt: 'Author Profile',
      // Use same source for blurred placeholder via CSS filter (no separate blur asset required)
      blurSrc: `/images/author-profile.jpg?v=${bust}`,
      // High-res hint; keep single entry to avoid broken fallbacks
      srcset: `/images/author-profile.jpg?v=${bust} 900w`
    }
  ], [bust]);
  // Fallback-aware current source
  const [currentSrc, setCurrentSrc] = useState(images[0].src);
  const [currentSrcSet, setCurrentSrcSet] = useState(images[0].srcset);
  const [fallbackStep, setFallbackStep] = useState(0);
  
  // Use eager loading with preload
  useEffect(() => {
    // Add preload link to head to prioritize image loading
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = images[0].src;
    document.head.appendChild(preloadLink);
    
    return () => {
      // Clean up preload link on unmount
      document.head.removeChild(preloadLink);
    };
  }, [images]);
  
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
  const handleNext = useCallback(() => {
    if (activeIndex < images.length - 1) {
      scrollToIndex(activeIndex + 1);
    } else {
      scrollToIndex(0); // Loop back to the first image
    }
  }, [activeIndex, images.length, scrollToIndex]);

  // Go to previous image with loop
  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    } else {
      scrollToIndex(images.length - 1); // Loop to the last image
    }
  }, [activeIndex, images.length, scrollToIndex]);

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
  }, [handlePrev, handleNext]);

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
    return undefined;
  }, [activeIndex, images.length]);
  
  // Handle image error and loading state
  const handleImageError = () => {
    // Try alternate extensions first, then fallback to previous optimized image
    if (fallbackStep === 0) {
      setCurrentSrc(`/images/author-profile.jpeg?v=${bust}`);
      setCurrentSrcSet(`/images/author-profile.jpeg?v=${bust} 900w`);
      setFallbackStep(1);
      return;
    }
    if (fallbackStep === 1) {
      setCurrentSrc(`/images/author-profile.png?v=${bust}`);
      setCurrentSrcSet(`/images/author-profile.png?v=${bust} 900w`);
      setFallbackStep(2);
      return;
    }
    setLoadError(true);
    setCurrentSrc(`/images/optimized/profile-optimized.jpg?v=${bust}`);
    setCurrentSrcSet(`/images/optimized/profile-optimized.jpg?v=${bust} 600w, /images/IMG_5266.png?v=${bust} 900w`);
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
                
                
                {/* Main high quality image */}
                <img 
                  src={currentSrc}
                  srcSet={currentSrcSet}
                  alt={image.alt}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transform: "none", // use natural framing with exact circular clip
                    transformOrigin: "center",
                    transition: "opacity 0.3s ease-in-out",
                  }}
                  className="transition-all duration-700 will-change-transform"
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