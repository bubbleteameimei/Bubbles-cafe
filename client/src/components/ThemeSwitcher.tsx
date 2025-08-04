import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Palette, Sun, Moon, Sparkles, Leaf, Grape, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Theme = 'light' | 'dark' | 'blue-pastel' | 'green-pastel' | 'purple-pastel' | 'brown-pastel' | 'system';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  preview: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'system',
    label: 'System',
    icon: <Palette className="h-4 w-4" />,
    preview: 'Auto',
    description: 'Follow system preference'
  },
  {
    value: 'light',
    label: 'Light',
    icon: <Sun className="h-4 w-4" />,
    preview: '☀️',
    description: 'Clean and bright'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon className="h-4 w-4" />,
    preview: '🌙',
    description: 'Easy on the eyes'
  },
  {
    value: 'blue-pastel',
    label: 'Ocean Blue',
    icon: <Sparkles className="h-4 w-4" />,
    preview: '🌊',
    description: 'Calm and serene'
  },
  {
    value: 'green-pastel',
    label: 'Nature Green',
    icon: <Leaf className="h-4 w-4" />,
    preview: '🌿',
    description: 'Fresh and natural'
  },
  {
    value: 'purple-pastel',
    label: 'Lavender Dream',
    icon: <Grape className="h-4 w-4" />,
    preview: '💜',
    description: 'Elegant and soft'
  },
  {
    value: 'brown-pastel',
    label: 'Warm Earth',
    icon: <Coffee className="h-4 w-4" />,
    preview: '🍂',
    description: 'Cozy and warm'
  }
];

const ThemeSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system');
  const [isOpen, setIsOpen] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: Theme) => {
    const html = document.documentElement;
    
    // Remove all theme classes and attributes
    html.classList.remove('dark');
    html.removeAttribute('data-theme');
    
    if (theme === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      }
    } else if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      // Light theme is default, no class needed
    } else {
      // Pastel themes use data-theme attribute
      html.setAttribute('data-theme', theme);
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  const getCurrentThemeOption = () => {
    return themeOptions.find(option => option.value === currentTheme) || themeOptions[0];
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 rounded-lg border-2 transition-all duration-200",
            "hover:border-primary/50 hover:shadow-lg",
            "focus:ring-2 focus:ring-primary/20",
            className
          )}
          aria-label="Theme switcher"
        >
          <div className="flex items-center justify-center">
            {getCurrentThemeOption().icon}
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 p-2 bg-card/95 backdrop-blur-md border border-border/50 shadow-xl"
        sideOffset={8}
      >
        <div className="grid gap-1">
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground border-b border-border/50 mb-1">
            Choose Theme
          </div>
          
          {themeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-accent/50 hover:text-accent-foreground",
                "focus:bg-accent/50 focus:text-accent-foreground",
                currentTheme === option.value && "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background/50 border border-border/30">
                  {option.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-lg">{option.preview}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </div>
              
              {currentTheme === option.value && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        
        <div className="border-t border-border/50 mt-2 pt-2 px-2">
          <p className="text-xs text-muted-foreground text-center">
            Theme preferences are saved automatically
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// System preference change listener
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme') as Theme;
    if (currentTheme === 'system' || !currentTheme) {
      const html = document.documentElement;
      html.classList.remove('dark');
      if (e.matches) {
        html.classList.add('dark');
      }
    }
  });
}

export default ThemeSwitcher;