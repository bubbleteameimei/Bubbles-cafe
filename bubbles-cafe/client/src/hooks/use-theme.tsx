// Redirecting all theme handling to shadcn/ui theme provider
import { useTheme as useShadcnTheme } from "@/components/theme-provider";

interface ThemeState {
  mode: 'light' | 'dark';
  appearance: 'light' | 'dark' | 'system';
}

/**
 * This is a compatibility wrapper for the shadcn/ui theme provider
 * It maintains the same API as the old useTheme hook but delegates to shadcn/ui
 */
export function useTheme() {
  const { theme: shadcnTheme, setTheme: setShadcnTheme, toggleTheme: toggleShadcnTheme } = useShadcnTheme();
  
  // Map shadcn theme to old theme structure
  const theme: ThemeState = {
    mode: shadcnTheme === 'light' ? 'light' : 'dark',
    appearance: shadcnTheme
  };
  
  // Map setTheme to setShacnTheme with compatibility
  const setTheme = (newTheme: Partial<ThemeState>) => {
    if (newTheme.mode) {
      setShadcnTheme(newTheme.mode);
    } else if (newTheme.appearance && newTheme.appearance !== 'system') {
      setShadcnTheme(newTheme.appearance);
    } else if (newTheme.appearance === 'system') {
      setShadcnTheme('system');
    }
  };
  
  return {
    theme,
    toggleTheme: toggleShadcnTheme,
    setTheme
  };
}

export default useTheme;