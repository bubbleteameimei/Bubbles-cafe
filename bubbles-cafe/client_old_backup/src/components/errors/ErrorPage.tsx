import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import SilentMovieEffect from './SilentMovieEffect';
import { useTheme } from '@/components/theme-provider';
import CreepyTextGlitch from './CreepyTextGlitch';
import { useLoading } from '@/components/GlobalLoadingProvider';

export interface ErrorPageProps {
  code: string;
  title: string;
  message: string;
}

export function ErrorPage({ code, title, message }: ErrorPageProps) {
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
    <SilentMovieEffect>
      <motion.div
        className="flex flex-col items-center justify-center p-8 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="silent-movie-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-8xl font-bold mb-6">
            <CreepyTextGlitch text={code} />
          </h1>
        </motion.div>
        
        <motion.div
          className="silent-movie-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h2 className="text-3xl font-medium tracking-widest mb-8">
            <CreepyTextGlitch text={title} />
          </h2>
        </motion.div>

        <motion.div
          className="silent-movie-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="text-2xl mb-12">
            <CreepyTextGlitch text={message} />
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            variant={isDarkMode ? "outline" : "default"}
            size="lg"
            onClick={handleReturnHome}
            className="mt-4 text-lg font-bold"
          >
            Return Home
          </Button>
        </motion.div>
      </motion.div>
    </SilentMovieEffect>
  );
}

export default ErrorPage;