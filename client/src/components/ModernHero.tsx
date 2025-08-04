import React from 'react';
import { motion } from 'framer-motion';
import { Book, Sparkles, ArrowRight, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const ModernHero: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/50 to-primary/5" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Book className="h-8 w-8 text-primary" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-32 right-16 opacity-20"
        >
          <Sparkles className="h-6 w-6 text-accent" />
        </motion.div>
        
        <motion.div
          animate={{
            y: [-15, 15, -15],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 left-20 opacity-20"
        >
          <Palette className="h-7 w-7 text-secondary" />
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Interactive
            </span>
            <br />
            <span className="text-foreground">
              Storytelling Platform
            </span>
          </h1>
          
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Immerse yourself in beautiful stories with our collection of carefully crafted themes. 
            Choose your perfect reading environment and dive into captivating narratives.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <Button
              size="lg"
              onClick={() => setLocation('/reader')}
              className="group relative px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Start Reading
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation('/community')}
              className="group px-8 py-3 border-2 hover:bg-accent/10 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Explore Stories
              </span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModernHero;