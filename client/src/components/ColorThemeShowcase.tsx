import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Sun, Moon, Leaf, Grape, Coffee, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'blue-pastel' | 'green-pastel' | 'purple-pastel' | 'brown-pastel';

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  gradient: string;
}

const themes: ThemeOption[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright for daytime reading',
    icon: <Sun className="h-5 w-5" />,
    preview: {
      primary: '#6366f1',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff'
    },
    gradient: 'from-white to-slate-50'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes for night reading',
    icon: <Moon className="h-5 w-5" />,
    preview: {
      primary: '#818cf8',
      secondary: '#94a3b8',
      accent: '#fbbf24',
      background: '#0f172a'
    },
    gradient: 'from-slate-900 to-slate-800'
  },
  {
    id: 'blue-pastel',
    name: 'Ocean Blue',
    description: 'Calm and serene like ocean waves',
    icon: <Sparkles className="h-5 w-5" />,
    preview: {
      primary: '#60a5fa',
      secondary: '#93c5fd',
      accent: '#fde047',
      background: '#f0f9ff'
    },
    gradient: 'from-blue-50 to-sky-100'
  },
  {
    id: 'green-pastel',
    name: 'Nature Green',
    description: 'Fresh and natural like morning dew',
    icon: <Leaf className="h-5 w-5" />,
    preview: {
      primary: '#4ade80',
      secondary: '#86efac',
      accent: '#fb7185',
      background: '#f0fdf4'
    },
    gradient: 'from-green-50 to-emerald-100'
  },
  {
    id: 'purple-pastel',
    name: 'Lavender Dream',
    description: 'Elegant and soft like twilight',
    icon: <Grape className="h-5 w-5" />,
    preview: {
      primary: '#a78bfa',
      secondary: '#c4b5fd',
      accent: '#fb923c',
      background: '#faf5ff'
    },
    gradient: 'from-purple-50 to-violet-100'
  },
  {
    id: 'brown-pastel',
    name: 'Warm Earth',
    description: 'Cozy and warm like autumn leaves',
    icon: <Coffee className="h-5 w-5" />,
    preview: {
      primary: '#a3a3a3',
      secondary: '#d4a574',
      accent: '#f97316',
      background: '#fefbf3'
    },
    gradient: 'from-orange-50 to-amber-100'
  }
];

const ColorThemeShowcase: React.FC<{ className?: string }> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setCurrentTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const html = document.documentElement;
    
    // Remove all theme classes and attributes
    html.classList.remove('dark');
    html.removeAttribute('data-theme');
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme !== 'light') {
      html.setAttribute('data-theme', theme);
    }
    
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <div className={cn("w-full py-12", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Palette className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Beautiful Color Themes
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our carefully crafted color schemes designed for optimal reading comfort and visual appeal.
          Each theme is optimized for different times of day and personal preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            onHoverStart={() => setHoveredTheme(theme.id)}
            onHoverEnd={() => setHoveredTheme(null)}
            className="group"
          >
            <Card 
              className={cn(
                "relative overflow-hidden border-2 transition-all duration-300 cursor-pointer",
                "hover:shadow-xl hover:scale-105",
                currentTheme === theme.id 
                  ? "border-primary shadow-lg ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50",
                `bg-gradient-to-br ${theme.gradient}`
              )}
              onClick={() => applyTheme(theme.id)}
            >
              <CardContent className="p-6">
                {/* Theme Preview Colors */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-3">
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.preview.primary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.preview.secondary }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm border border-white/20"
                      style={{ backgroundColor: theme.preview.accent }}
                    />
                    <div 
                      className="w-8 h-8 rounded-full shadow-sm border border-gray-200"
                      style={{ backgroundColor: theme.preview.background }}
                    />
                  </div>
                </div>

                {/* Theme Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-primary">
                        {theme.icon}
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {theme.name}
                      </h3>
                    </div>
                    
                    <AnimatePresence>
                      {currentTheme === theme.id && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="text-primary"
                        >
                          <Check className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {theme.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <AnimatePresence>
                  {hoveredTheme === theme.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center mt-8"
      >
        <p className="text-sm text-muted-foreground">
          Your theme preference is saved automatically and applies across all pages
        </p>
      </motion.div>
    </div>
  );
};

export default ColorThemeShowcase;