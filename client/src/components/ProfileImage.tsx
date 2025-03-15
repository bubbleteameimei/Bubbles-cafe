import { useState, useEffect } from 'react';

export default function ProfileImage() {
  const [loadError, setLoadError] = useState(false);
  
  // Use an array of possible image paths in order of preference
  const imagePaths = [
    '/IMG_5307.png',                // Direct root path
    '/images/profile.png',          // Under images directory
    '/images/IMG_5307.png',         // Image under images directory
    '/assets/IMG_5307.png',         // Assets directory
    '/vanessa-profile.png'          // Root path with different name
  ];
  
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Debug information
  useEffect(() => {
    console.log("ProfileImage component mounted");
    console.log("Available image paths:", imagePaths);
    console.log("Current path index:", currentPathIndex);
    console.log("Current image path being used:", imagePaths[currentPathIndex]);
  }, [currentPathIndex]);
  
  // Try to preload the image to check which path works
  useEffect(() => {
    console.log("Attempting to preload image from path:", imagePaths[0]);
    
    const preloadImage = new Image();
    preloadImage.src = imagePaths[0];
    
    preloadImage.onload = () => {
      setImageLoaded(true);
      console.log("✅ Image preload successful:", imagePaths[0]);
    };
    
    preloadImage.onerror = () => {
      console.warn("⚠️ Failed to preload image from primary path, will try fallbacks");
    };
    
    // Add direct fetch attempt to check headers
    fetch(imagePaths[0])
      .then(response => {
        console.log(`Fetch status for ${imagePaths[0]}: ${response.status} ${response.statusText}`);
        console.log("Response headers:", response.headers);
        return response.blob();
      })
      .then(blob => {
        console.log("Blob type:", blob.type);
        console.log("Blob size:", blob.size);
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
      
  }, []);
  
  const handleImageError = () => {
    console.error(`❌ Error loading image from path: ${imagePaths[currentPathIndex]}`);
    
    if (currentPathIndex < imagePaths.length - 1) {
      // Try the next image path
      const nextIndex = currentPathIndex + 1;
      console.log(`Trying next image path (${nextIndex}): ${imagePaths[nextIndex]}`);
      setCurrentPathIndex(nextIndex);
    } else {
      console.error("⛔ All image paths failed to load");
      setLoadError(true);
    }
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    console.log(`✅ Successfully loaded image from: ${imagePaths[currentPathIndex]}`);
  };
  
  return (
    <div className="relative" style={{ width: '250px', height: '250px' }}>
      {/* Enhanced glow effect behind the image with stronger animation */}
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl transform scale-[1.85] animate-glow"></div>
      
      {/* Secondary glow layer for depth */}
      <div className="absolute inset-0 rounded-full bg-primary/15 blur-lg transform scale-[1.5] animate-pulse"></div>
      
      {/* Container for the image */}
      <div className="h-56 w-56 relative border-2 border-primary/40 shadow-xl ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-full overflow-hidden flex items-center justify-center p-1 bg-background/50 mx-auto">
        {!loadError ? (
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            <img 
              src={imagePaths[currentPathIndex]}
              alt="Vanessa" 
              className="w-full h-full object-cover"
              loading="eager" // Changed to eager for profile picture which is important content
              decoding="async"
              style={{
                objectFit: "cover", // Ensure the image covers the container properly
                objectPosition: "center 15%", // Focus on the face area
              }}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-muted/50 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
      </div>
      
      {/* Debug overlay - only visible during development */}
      {process.env.NODE_ENV !== 'production' && !imageLoaded && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 rounded">
          Loading... ({currentPathIndex + 1}/{imagePaths.length})
        </div>
      )}
    </div>
  );
}