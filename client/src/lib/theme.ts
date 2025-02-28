// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default)
    dark: {
      background: '#121212',        // Charcoal Black - Deep and soft
      foreground: '#EAEAEA',        // Off-White - Easy on eyes
      card: '#1A1A1A',             // Slightly lighter than background
      cardForeground: '#EAEAEA',    // Off-White
      popover: '#121212',          // Match background
      popoverForeground: '#EAEAEA', // Off-White
      primary: '#D4AF37',          // Pale Gold - Headers
      primaryForeground: '#EAEAEA', // Off-White
      secondary: '#7A1F1F',        // Deep Burgundy - Buttons
      secondaryForeground: '#EAEAEA', // Off-White
      muted: '#555555',            // Soft Gray - Accents
      mutedForeground: '#EAEAEA',  // Off-White
      accent: '#555555',           // Soft Gray - Accents
      accentForeground: '#EAEAEA', // Off-White
      destructive: '#7A1F1F',      // Deep Burgundy
      destructiveForeground: '#EAEAEA', // Off-White
      border: '#555555',           // Soft Gray
      input: '#1A1A1A',            // Slightly lighter than background
      ring: '#D4AF37',            // Pale Gold
    },
    // Light mode
    light: {
      background: '#F3ECE2',        // Linen Beige - Parchment feel
      foreground: '#1E1E1E',        // Charcoal - Text
      card: '#FFFFFF',             // Pure White
      cardForeground: '#1E1E1E',    // Charcoal
      popover: '#F3ECE2',          // Match background
      popoverForeground: '#1E1E1E', // Charcoal
      primary: '#7A1F1F',          // Deep Burgundy - Headers
      primaryForeground: '#F3ECE2', // Linen Beige
      secondary: '#C9A661',        // Muted Gold - Buttons
      secondaryForeground: '#1E1E1E', // Charcoal
      muted: '#888888',            // Dark Gray - Accents
      mutedForeground: '#1E1E1E',  // Charcoal
      accent: '#888888',           // Dark Gray - Accents
      accentForeground: '#1E1E1E', // Charcoal
      destructive: '#7A1F1F',      // Deep Burgundy
      destructiveForeground: '#F3ECE2', // Linen Beige
      border: '#888888',           // Dark Gray
      input: '#FFFFFF',            // Pure White
      ring: '#C9A661',            // Muted Gold
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
    minWidth: '320px',  // Prevent squeeze below this width
    maxWidth: '2560px', // Maximum width for ultra-wide screens
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