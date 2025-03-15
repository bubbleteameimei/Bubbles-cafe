import { useState, useEffect } from 'react';

export default function ProfileImage() {
  const [loadError, setLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use PNG image as requested
  const imagePath = '/images/IMG_5307.png';
  
  // Try to preload the image
  useEffect(() => {
    const preloadImage = new Image();
    preloadImage.src = imagePath;
    
    preloadImage.onload = () => {
      setImageLoaded(true);
    };
    
    preloadImage.onerror = () => {
      setLoadError(true);
    };
  }, []);
  
  const handleImageError = () => {
    setLoadError(true);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  return (
    <div className="relative flex justify-center mt-4" style={{ width: '100%' }}>
      {/* Outer shadow container for dramatic horror effect */}
      <div className="absolute rounded-full w-[210px] h-[210px] opacity-20 blur-md bg-black transform -translate-x-1 translate-y-2"></div>
      
      <div className="relative" style={{ width: '200px', height: '200px' }}>
        {/* Primary deep crimson glow effect behind the image - stronger in dark mode */}
        <div className="absolute inset-0 rounded-full bg-[#8B0000]/50 dark:bg-[#8B0000]/70 blur-xl transform scale-[1.9] animate-pulse-slow"></div>
        
        {/* Secondary blood-red glow layer for depth - stronger in dark mode */}
        <div className="absolute inset-0 rounded-full bg-[#660000]/40 dark:bg-[#660000]/60 blur-lg transform scale-[1.6] animate-pulse-medium"></div>
        
        {/* Third subtle burgundy glow layer for added dimensionality */}
        <div className="absolute inset-0 rounded-full bg-[#990000]/35 dark:bg-[#990000]/50 blur-md transform scale-[1.3] animate-pulse opacity-90"></div>
        
        {/* Intense blood drip effect - only visible in dark mode */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-[#660000]/0 dark:bg-[#660000]/25 blur-md animate-pulse-medium rounded-b-3xl hidden dark:block"></div>
        
        {/* Container for the image */}
        <div className="h-48 w-48 relative border-2 border-[#8B0000]/50 dark:border-[#8B0000]/70 shadow-xl 
                      ring-2 ring-[#660000]/30 dark:ring-[#660000]/50 ring-offset-2 ring-offset-background 
                      rounded-full overflow-hidden
                      p-1 bg-background/50 mx-auto transition-all duration-500 
                      hover:ring-[#990000]/80 hover:border-[#990000]/90 hover:ring-offset-4 
                      hover:shadow-[0_0_20px_rgba(139,0,0,0.7)] dark:hover:shadow-[0_0_30px_rgba(139,0,0,0.9)]
                      hover:scale-105">
          {!loadError ? (
            <div 
              className="w-full h-full rounded-full overflow-hidden" 
              style={{ position: "relative" }}
            >
              {/* New direct image positioning */}
              <img 
                src={imagePath}
                alt="Author" 
                loading="eager"
                decoding="async"
                style={{
                  position: "absolute",
                  height: "250%", /* 2.5x zoom for more dramatic effect */
                  width: "auto", /* Width auto to maintain aspect ratio */
                  left: "53%", /* Slight rightward shift (3% from center) */
                  top: "73%", /* Perfect downward shift as requested */
                  transform: "translate(-50%, -50%)", /* Center the image properly */
                  objectFit: "cover", /* Ensure the image covers the area */
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
                className="transition-all duration-500 filter hover:contrast-[1.05] hover:brightness-[0.95]"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-muted/50 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}