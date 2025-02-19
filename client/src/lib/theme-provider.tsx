import { type ReactNode, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export type ThemeVariant = 'classic' | 'gothic' | 'scholarly' | 'antique';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, variant } = useTheme();

  // Apply sophisticated animations and transitions
  useEffect(() => {
    document.body.classList.add('animate-theme-transition');

    // Add premium animation classes based on theme
    if (theme === 'dark') {
      document.body.classList.add('dark-mode-premium');
    } else {
      document.body.classList.remove('dark-mode-premium');
    }

    // Add variant-specific classes
    document.body.className = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-variant-'))
      .concat(`theme-variant-${variant}`)
      .join(' ');

    // Cleanup
    return () => {
      document.body.classList.remove('animate-theme-transition');
    };
  }, [theme, variant]);

  return (
    <div className="theme-container premium-texture">
      <div className="theme-content premium-animation">
        {children}
      </div>
    </div>
  );
}

// Re-export the useTheme hook for convenience
export { useTheme } from "@/hooks/use-theme";