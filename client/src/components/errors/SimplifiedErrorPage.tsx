import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useTheme } from '@/components/theme-provider';
import SimpleGlitchText from './SimpleGlitchText';
import { hideGlobalLoading } from '@/utils/global-loading-manager';

// Add horror-themed font styling
const horrorFontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Creepster&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
  
  .horror-title {
    font-family: 'Creepster', cursive !important;
    letter-spacing: 0.04em;
    text-shadow: 2px 2px 4px rgba(255, 0, 0, 0.4);
  }
  
  .horror-heading {
    font-family: 'Special Elite', cursive !important;
    letter-spacing: 0.05em;
  }
  
  .horror-text {
    font-family: 'Special Elite', cursive !important;
    letter-spacing: 0.03em;
  }
  
  .error-button {
    font-family: 'Special Elite', cursive !important;
    letter-spacing: 0.03em;
    transition: all 0.3s ease;
  }
  
  .error-button:hover {
    color: #ff3333;
    text-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
    transform: scale(1.05);
  }
  
  .error-container {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(20, 20, 20, 0.95));
  }
`;

export interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
}

export function SimplifiedErrorPage({ code, title, message }: ErrorPageProps) {
  const [_, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Ensure loading screen is hidden when error page is displayed
  useEffect(() => {
    hideGlobalLoading();
    
    // Add horror-themed font styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = horrorFontStyles;
    document.head.appendChild(styleElement);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm error-container">
      {/* Subtle blood drip effect at the top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-900 to-transparent opacity-80"></div>
      
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center p-8 max-w-lg text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-8xl horror-title mb-8 text-red-500">
            <SimpleGlitchText text={code} lineGlitch={false} />
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl horror-heading mb-8 text-foreground">
            <SimpleGlitchText text={title} lineGlitch={true} />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-xl mb-12 horror-text text-muted-foreground max-w-md mx-auto leading-relaxed">
            <SimpleGlitchText text={message} lineGlitch={true} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={handleReturnHome}
            className="error-button text-base border-red-900/40 hover:border-red-800"
          >
            Return Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SimplifiedErrorPage;