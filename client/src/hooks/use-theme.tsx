// Redirecting all theme handling to shadcn/ui theme provider
import { useTheme as useShadcnTheme } from "@/components/theme-provider";

type ThemeAppearance = 'light' | 'dark' | 'system' | 'sky' | 'eco';

interface ThemeState {
  mode: 'light' | 'dark';
  appearance: ThemeAppearance;
}

/**
 * Compatibility wrapper around the ThemeProvider hook.
 * - Preserves the old {mode, appearance} shape.
 * - Supports new light-like themes (sky, eco) by mapping them to mode 'light'.
 */
export function useTheme() {
  const {
    theme: shadcnTheme,
    setTheme: setShadcnTheme,
    toggleTheme: toggleShadcnTheme,
  } = useShadcnTheme();

  // Map ThemeProvider theme to legacy ThemeState
  const systemPrefersDark =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const modeFromTheme =
    shadcnTheme === 'system'
      ? (systemPrefersDark ? 'dark' : 'light')
      : (shadcnTheme === 'light' || shadcnTheme === 'sky' || shadcn

  // Back-compat setter:
  // - Accepts either a ThemeState partial or a direct appearance string
  const setTheme = (newTheme: Partial<ThemeState> | ThemeAppearance) => {
    try {
      if (typeof newTheme === 'string') {
        // Direct appearance
        setShadcnTheme(newTheme as ThemeAppearance);
        return;
      }
      // Prefer appearance when provided
      if (newTheme.appearance) {
        setShadcnTheme(newTheme.appearance as ThemeAppearance);
        return;
      }
      // Fallback to mode (maps to light/dark)
      if (newTheme.mode) {
        setShadcnTheme(newTheme.mode);
        return;
      }
    } catch {
      // no-op
    }
  };

  return {
    theme,
    toggleTheme: toggleShadcnTheme,
    setTheme,
  };
}

export default useTheme;