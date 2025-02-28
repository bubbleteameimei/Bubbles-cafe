// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default)
    dark: {
      background: 'hsl(240 10% 3.9%)',
      foreground: 'hsl(0 0% 98%)',
      card: 'hsl(240 10% 3.9%)',
      cardForeground: 'hsl(0 0% 98%)',
      popover: 'hsl(240 10% 3.9%)',
      popoverForeground: 'hsl(0 0% 98%)',
      primary: 'hsl(346 89% 50%)',
      primaryForeground: 'hsl(0 0% 98%)',
      secondary: 'hsl(240 4% 16%)',
      secondaryForeground: 'hsl(0 0% 98%)',
      muted: 'hsl(240 4% 16%)',
      mutedForeground: 'hsl(240 5% 64.9%)',
      accent: 'hsl(240 4% 16%)',
      accentForeground: 'hsl(0 0% 98%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)',
      border: 'hsl(240 4% 16%)',
      input: 'hsl(240 4% 16%)',
      ring: 'hsl(346 89% 50%)',
    },
    // Light mode
    light: {
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(240 10% 3.9%)',
      card: 'hsl(0 0% 100%)',
      cardForeground: 'hsl(240 10% 3.9%)',
      popover: 'hsl(0 0% 100%)',
      popoverForeground: 'hsl(240 10% 3.9%)',
      primary: 'hsl(346 89% 50%)',
      primaryForeground: 'hsl(0 0% 98%)',
      secondary: 'hsl(240 5% 96%)',
      secondaryForeground: 'hsl(240 10% 3.9%)',
      muted: 'hsl(240 5% 96%)',
      mutedForeground: 'hsl(240 4% 46.1%)',
      accent: 'hsl(240 5% 96%)',
      accentForeground: 'hsl(240 10% 3.9%)',
      destructive: 'hsl(0 84% 60%)',
      destructiveForeground: 'hsl(0 0% 98%)',
      border: 'hsl(240 6% 90%)',
      input: 'hsl(240 6% 90%)',
      ring: 'hsl(346 89% 50%)',
    }
  },
  typography: {
    fonts: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  effects: {
    transition: {
      theme: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, border-color 0.3s ease-in-out',
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    radius: {
      sm: '0.3rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    }
  }
};

export type Theme = typeof theme;
export default theme;