import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { useTheme } from '@/components/theme-provider';
import SimpleGlitchText from './SimpleGlitchText';
import { useLoading } from '@/hooks/use-loading';

export interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
}

export function SimplifiedErrorPage({ code, title, message }: ErrorPageProps) {
  const [_, setLocation] = useLocation();
  const { theme } = useTheme();
  const { hideLoading } = useLoading();
  const isDarkMode = theme === 'dark';

  // Ensure loading screen is hidden when error page is displayed
  useEffect(() => {
    hideLoading();
  }, [hideLoading]);

  const handleReturnHome = () => {
    setLocation('/');
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* Simple noise background */}
        <div className={`w-full h-full ${isDarkMode ? 'bg-opacity-10' : 'bg-opacity-5'}`} 
          style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"}}
        />
      </div>
      
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`text-8xl font-mono font-bold mb-6 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`}>
            <SimpleGlitchText text={code} />
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className={`text-3xl font-mono uppercase tracking-widest mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
            <SimpleGlitchText text={title} />
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <p className={`text-xl mb-10 font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <SimpleGlitchText text={message} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant={isDarkMode ? "destructive" : "default"}
            size="lg"
            onClick={handleReturnHome}
            className="font-mono text-lg"
          >
            Return Home
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SimplifiedErrorPage;