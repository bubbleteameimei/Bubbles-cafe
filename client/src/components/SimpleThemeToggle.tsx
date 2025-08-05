import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sun, Moon, Sparkles, Leaf, Grape, Coffee, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FullTheme = 'light' | 'dark' | 'blue-pastel' | 'green-pastel' | 'purple-pastel' | 'brown-pastel';

interface ThemeOption {
  value: FullTheme;
  label: string;
  icon: React.ReactNode;
  emoji: string;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Light',
    icon: <Sun className="h-4 w-4" />,
    emoji: '☀️'
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: <Moon className="h-4 w-4" />,
    emoji: '🌙'
  },
  {
    value: 'blue-pastel',
    label: 'Ocean Blue',
    icon: <Sparkles className="h-4 w-4" />,
    emoji: '🌊'
  },
  {
    value: 'green-pastel',
    label: 'Nature Green',
    icon: <Leaf className="h-4 w-4" />,
    emoji: '🌿'
  },
  {
    value: 'purple-pastel',
    label: 'Lavender',
    icon: <Grape className="h-4 w-4" />,
    emoji: '💜'
  },
  {
    value: 'brown-pastel',
    label: 'Warm Earth',
    icon: <Coffee className="h-4 w-4" />,
    emoji: '🍂'
  }
];

const SimpleThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const [currentTheme, setCurrentTheme] = useState<FullTheme>('light');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as FullTheme || 'light';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: FullTheme) => {
    const html = document.documentElement;
    
    // Remove all theme classes and attributes
    html.classList.remove('dark');
    html.removeAttribute('data-theme');
    
    // Apply the theme
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme !== 'light') {
      html.setAttribute('data-theme', theme);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);
    
    
  };

  const currentThemeOption = themeOptions.find(option => option.value === currentTheme) || themeOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-3 flex items-center gap-2 hover:bg-accent/50 transition-colors",
            className
          )}
        >
          <span className="text-lg">{currentThemeOption.emoji}</span>
          <span className="hidden sm:inline-block font-medium">
            {currentThemeOption.label}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => applyTheme(option.value)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              currentTheme === option.value && "bg-accent"
            )}
          >
            <span className="text-lg">{option.emoji}</span>
            <span className="flex-1">{option.label}</span>
            {currentTheme === option.value && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SimpleThemeToggle;