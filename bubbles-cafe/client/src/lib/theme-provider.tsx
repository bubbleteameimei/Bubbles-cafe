// Redirecting to shadcn/ui theme provider
import { ThemeProvider as ShadcnThemeProvider } from "@/components/theme-provider";
import type { ReactNode } from "react";

// Re-export the ThemeProvider component from shadcn/ui
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ShadcnThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      {children}
    </ShadcnThemeProvider>
  );
}

// Re-export the useTheme hook for compatibility
export { useTheme } from "@/components/theme-provider";