import React from 'react';
import { useThemeStore } from '../stores/themeStore';
import { Button } from './ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ZustandThemeToggle() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  // Get the appropriate icon based on the current theme
  const ThemeIcon = React.useMemo(() => {
    switch(theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'system': return Monitor;
      default: return Sun;
    }
  }, [theme]);

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">Zustand Theme Demo</h3>
      
      <div className="flex gap-2 items-center">
        <span>Current theme:</span>
        <span className="font-bold">
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </span>
        <ThemeIcon className="ml-2 h-4 w-4" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant={theme === 'light' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" /> Light
        </Button>
        
        <Button 
          variant={theme === 'dark' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" /> Dark
        </Button>
        
        <Button 
          variant={theme === 'system' ? 'default' : 'outline'} 
          size="sm" 
          onClick={() => setTheme('system')}
        >
          <Monitor className="mr-2 h-4 w-4" /> System
        </Button>
      </div>

      <Button onClick={toggleTheme}>
        Toggle Theme (cycles through light → dark → system)
      </Button>
    </div>
  );
}