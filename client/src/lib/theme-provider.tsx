import { type ReactNode, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

interface Theme {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useTheme() as { theme: Theme };

  // Apply sophisticated animations and transitions
  useEffect(() => {
    document.body.classList.add('animate-theme-transition');

    // Add premium animation classes based on theme
    if (theme?.appearance === 'dark') {
      document.body.classList.add('dark-mode-premium');
    } else {
      document.body.classList.remove('dark-mode-premium');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('animate-theme-transition');
    };
  }, [theme?.appearance]);

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