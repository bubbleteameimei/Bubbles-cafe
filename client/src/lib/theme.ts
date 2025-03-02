// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default)
    dark: {
      background: '#121212',        // Rich Charcoal Black
      foreground: '#E8E8E8',        // Soft White
      card: '#1E1E1E',             // Darker Charcoal
      cardForeground: '#E8E8E8',    // Soft White
      popover: '#121212',          // Match background
      popoverForeground: '#E8E8E8', // Soft White
      primary: '#4A90E2',          // Bright Blue - Primary actions
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#2D3748',        // Slate Gray - Secondary elements
      secondaryForeground: '#E8E8E8', // Soft White
      muted: '#4A5568',            // Steel Gray - Muted elements
      mutedForeground: '#A0AEC0',  // Light Steel Gray
      accent: '#4A90E2',           // Bright Blue - Accents
      accentForeground: '#FFFFFF', // Pure White
      destructive: '#E53E3E',      // Red - Destructive actions
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#2D3748',           // Slate Gray
      input: '#1E1E1E',            // Darker Charcoal
      ring: '#4A90E2',            // Bright Blue
    },
    // Light mode
    light: {
      background: '#FFFFFF',        // Pure White
      foreground: '#1A202C',        // Dark Gray - Text
      card: '#F7FAFC',             // Light Gray Blue
      cardForeground: '#1A202C',    // Dark Gray
      popover: '#FFFFFF',          // Pure White
      popoverForeground: '#1A202C', // Dark Gray
      primary: '#3182CE',          // Professional Blue
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#4A5568',        // Slate Gray
      secondaryForeground: '#FFFFFF', // Pure White
      muted: '#718096',            // Cool Gray
      mutedForeground: '#4A5568',  // Slate Gray
      accent: '#3182CE',           // Professional Blue
      accentForeground: '#FFFFFF', // Pure White
      destructive: '#E53E3E',      // Red
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#E2E8F0',           // Light Gray
      input: '#F7FAFC',            // Light Gray Blue
      ring: '#3182CE',            // Professional Blue
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
  layout: {
    container: {
      default: '100%',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    minWidth: '320px',
    maxWidth: '2560px',
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