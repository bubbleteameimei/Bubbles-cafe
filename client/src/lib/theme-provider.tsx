import { type ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Direct render children since we now have a fixed horror theme
  return <>{children}</>;
}