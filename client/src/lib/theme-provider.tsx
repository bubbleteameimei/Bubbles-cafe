import { type ReactNode } from "react";
import { useTheme } from "@/hooks/use-theme";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme hook to set up listeners and initial theme
  useTheme();

  return <>{children}</>;
}

// Re-export the useTheme hook for convenience
export { useTheme } from "@/hooks/use-theme";