import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import EdenGame from '../../../components/games/eden/EdenGame';

const EdenHollowPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };
  
  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Eden's Hollow - A Dark Fantasy Experience</title>
        <meta name="description" content="Enter the mysterious world of Eden's Hollow, a dark fantasy interactive adventure where your choices shape the story." />
      </Helmet>
      
      <div className="h-screen bg-black text-white relative">
        {!isFullscreen && (
          <div className="absolute top-4 left-4 z-50 bg-gray-900/80 p-3 rounded-md backdrop-blur-sm">
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md mr-2 transition-colors"
            >
              Back to Site
            </button>
            <button 
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 rounded-md transition-colors"
            >
              Fullscreen Mode
            </button>
          </div>
        )}
        
        <EdenGame />
      </div>
    </>
  );
};

export default EdenHollowPage;