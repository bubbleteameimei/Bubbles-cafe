import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Sparkles, Leaf, Grape, Coffee, Check, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'blue-pastel' | 'green-pastel' | 'purple-pastel' | 'brown-pastel';

interface ThemeDetails {
  id: Theme;
  name: string;
  description: string;
  longDescription: string;
  icon: React.ReactNode;
  category: string;
  bestFor: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
  };
  preview: {
    gradient: string;
    textColor: string;
  };
}

const themeDetails: ThemeDetails[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Clean and bright for daytime reading',
    longDescription: 'The classic light theme provides excellent readability with high contrast text on a clean white background. Perfect for daytime reading and well-lit environments.',
    icon: <Sun className="h-6 w-6" />,
    category: 'Classic',
    bestFor: ['Daytime reading', 'Well-lit rooms', 'Long reading sessions', 'Academic content'],
    colors: {
      primary: '#6366f1',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9'
    },
    preview: {
      gradient: 'from-white to-slate-50',
      textColor: 'text-slate-900'
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes for night reading',
    longDescription: 'Reduce eye strain with our carefully crafted dark theme. The deep background with light text provides comfortable reading in low-light conditions while maintaining excellent contrast.',
    icon: <Moon className="h-6 w-6" />,
    category: 'Classic',
    bestFor: ['Night reading', 'Low-light environments', 'Extended sessions', 'Reducing eye strain'],
    colors: {
      primary: '#818cf8',
      secondary: '#94a3b8',
      accent: '#fbbf24',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#334155'
    },
    preview: {
      gradient: 'from-slate-900 to-slate-800',
      textColor: 'text-slate-100'
    }
  },
  {
    id: 'blue-pastel',
    name: 'Ocean Blue',
    description: 'Calm and serene like ocean waves',
    longDescription: 'Inspired by tranquil ocean waters, this theme combines soft blues with gentle contrasts. The calming atmosphere promotes focus and relaxation during reading.',
    icon: <Sparkles className="h-6 w-6" />,
    category: 'Pastel',
    bestFor: ['Relaxation', 'Fiction reading', 'Stress relief', 'Meditation'],
    colors: {
      primary: '#60a5fa',
      secondary: '#93c5fd',
      accent: '#fde047',
      background: '#f0f9ff',
      foreground: '#1e293b',
      muted: '#bae6fd'
    },
    preview: {
      gradient: 'from-blue-50 to-sky-100',
      textColor: 'text-blue-900'
    }
  },
  {
    id: 'green-pastel',
    name: 'Nature Green',
    description: 'Fresh and natural like morning dew',
    longDescription: 'Connect with nature through soft greens and earth tones. This theme evokes feelings of growth, harmony, and natural beauty, perfect for nature writing and poetry.',
    icon: <Leaf className="h-6 w-6" />,
    category: 'Pastel',
    bestFor: ['Nature content', 'Poetry', 'Wellness articles', 'Environmental topics'],
    colors: {
      primary: '#4ade80',
      secondary: '#86efac',
      accent: '#fb7185',
      background: '#f0fdf4',
      foreground: '#14532d',
      muted: '#bbf7d0'
    },
    preview: {
      gradient: 'from-green-50 to-emerald-100',
      textColor: 'text-green-900'
    }
  },
  {
    id: 'purple-pastel',
    name: 'Lavender Dream',
    description: 'Elegant and soft like twilight',
    longDescription: 'Embrace elegance with soft purples and lavender tones. This sophisticated theme creates a dreamy atmosphere perfect for fantasy, romance, and creative writing.',
    icon: <Grape className="h-6 w-6" />,
    category: 'Pastel',
    bestFor: ['Fantasy novels', 'Romance stories', 'Creative writing', 'Art content'],
    colors: {
      primary: '#a78bfa',
      secondary: '#c4b5fd',
      accent: '#fb923c',
      background: '#faf5ff',
      foreground: '#581c87',
      muted: '#e9d5ff'
    },
    preview: {
      gradient: 'from-purple-50 to-violet-100',
      textColor: 'text-purple-900'
    }
  },
  {
    id: 'brown-pastel',
    name: 'Warm Earth',
    description: 'Cozy and warm like autumn leaves',
    longDescription: 'Experience the warmth of autumn with rich browns and golden tones. This cozy theme creates a comfortable, homey feeling perfect for classic literature and personal stories.',
    icon: <Coffee className="h-6 w-6" />,
    category: 'Pastel',
    bestFor: ['Classic literature', 'Historical content', 'Personal stories', 'Cozy reading'],
    colors: {
      primary: '#a3a3a3',
      secondary: '#d4a574',
      accent: '#f97316',
      background: '#fefbf3',
      foreground: '#451a03',
      muted: '#e7ddd2'
    },
    preview: {
      gradient: 'from-orange-50 to-amber-100',
      textColor: 'text-orange-900'
    }
  }
];

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('light');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

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
    
    setSelectedTheme(theme);
    localStorage.setItem('theme', theme);
  };

  const currentTheme = localStorage.getItem('theme') as Theme || 'light';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Palette className="h-8 w-8 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Theme Gallery
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Discover our collection of beautiful, carefully crafted themes. Each theme is designed with specific reading contexts in mind, 
          from bright daytime sessions to cozy evening reading.
        </p>
      </motion.div>

      {/* Current Theme Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8 text-center"
      >
        <Badge variant="outline" className="px-4 py-2 text-sm">
          <Check className="h-4 w-4 mr-2 text-green-600" />
          Currently using: {themeDetails.find(t => t.id === currentTheme)?.name || 'Light Mode'}
        </Badge>
      </motion.div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {themeDetails.map((theme, index) => (
          <motion.div
            key={theme.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
            onHoverStart={() => setPreviewTheme(theme.id)}
            onHoverEnd={() => setPreviewTheme(null)}
            className="group"
          >
            <Card 
              className={cn(
                "relative overflow-hidden border-2 transition-all duration-300 h-full",
                "hover:shadow-xl hover:scale-[1.02]",
                currentTheme === theme.id 
                  ? "border-primary shadow-lg ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50",
                `bg-gradient-to-br ${theme.preview.gradient}`
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {theme.icon}
                    </div>
                    <div>
                      <CardTitle className={cn("text-xl font-bold", theme.preview.textColor)}>
                        {theme.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {theme.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {currentTheme === theme.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="text-green-600"
                      >
                        <Check className="h-6 w-6" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Color Palette */}
                <div className="flex gap-2 mb-4">
                  {Object.entries(theme.colors).slice(0, 4).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded-full shadow-sm border border-white/30"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className={cn("text-base mb-4 leading-relaxed", theme.preview.textColor)}>
                  {theme.longDescription}
                </p>

                {/* Best For Tags */}
                <div className="mb-6">
                  <h4 className={cn("text-sm font-medium mb-2", theme.preview.textColor)}>
                    Best for:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {theme.bestFor.map((use) => (
                      <Badge 
                        key={use} 
                        variant="outline" 
                        className="text-xs border-current/30"
                      >
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => applyTheme(theme.id)}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      currentTheme === theme.id
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                  >
                    {currentTheme === theme.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Active
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Apply Theme
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>

              {/* Hover Effect */}
              <AnimatePresence>
                {previewTheme === theme.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="text-center mt-12 p-6 rounded-lg bg-muted/30"
      >
        <h3 className="text-lg font-semibold mb-2">About Our Themes</h3>
        <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Each theme has been carefully designed with accessibility, readability, and visual comfort in mind. 
          The color palettes are tested for proper contrast ratios and optimal viewing in different lighting conditions.
          Your theme choice is saved automatically and persists across all pages of the platform.
        </p>
      </motion.div>
    </div>
  );
}