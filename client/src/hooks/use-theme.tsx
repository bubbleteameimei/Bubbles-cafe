// Redirecting all theme handling to shadcn/ui theme provider
import { useTheme as useShadcnTheme } from "@/components/theme-provider";

type ThemeAppearance = "light" | "dark" | "system" | "sky" | "eco";

interface ThemeState {
  mode: "light" | "dark";
  appearance: ThemeAppearance;
}

// Input accepted by the legacy setter
type CompatThemeInput = Partial<{
  mode: ThemeAppearance;       // allow 'system', 'sky', 'eco' to flow through
  appearance: ThemeAppearance; // full appearance space
}>;

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
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const modeFromTheme =
    shadcnTheme === "system"
      ? systemPrefersDark
        ? "dark"
        : "light"
      : shadcnTheme === "light" || shadcnTheme === "sky" || shadcnTheme === "eco"
      ? "light"
      : "dark";

  const theme: ThemeState = {
    mode: modeFromTheme,
    appearance: shadcnTheme as ThemeAppearance,
  };

  // Back-compat setter:
  // - Accepts either a ThemeState-like partial or a direct appearance string
  const setTheme = (newTheme: CompatThemeInput | ThemeAppearance) => {
    try {
      if (typeof newTheme === "string") {
        // Direct appearance
        setShadcnTheme(newTheme as ThemeAppearance);
        return;
      }
      // Prefer appearance when provided
      if (newTheme.appearance) {
        setShadcnTheme(newTheme.appearance as ThemeAppearance);
        return;
      }
      // Fallback to mode (maps to light/dark or passes through appearance-like values)
      if (newTheme.mode) {
        if (newTheme.mode === "sky" || newTheme.mode === "eco") {
          setShadcnTheme(newTheme.mode);
          return;
        }
        if (newTheme.mode === "system") {
          setShadcnTheme("system");
          return;
        }
        // Otherwise it's 'light' or 'dark'
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