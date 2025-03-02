// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default) - Optimized for background image
    dark: {
      background: '#121212',        // Deep Charcoal - For image overlay
      foreground: '#EAEAEA',        // Soft White - For readability on dark
      card: '#1E1E1E',              // Rich Dark Gray with slight warm tone
      cardForeground: '#EAEAEA',    // Soft White
      popover: '#121212',           // Deep Charcoal
      popoverForeground: '#EAEAEA', // Soft White
      primary: '#A67C52',           // Warm Brown - Complements image
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#2C2620',         // Deep Brown - Subtle secondary elements
      secondaryForeground: '#EAEAEA', // Soft White
      muted: '#343434',             // Muted Dark Gray
      mutedForeground: '#A6A6A6',   // Warm Gray
      accent: '#8C6D4F',            // Earthy Accent - Complements image
      accentForeground: '#FFFFFF',  // Pure White
      destructive: '#C75D4C',       // Muted Red - Warning/Delete
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#2C2620',            // Deep Brown
      input: '#1E1E1E',             // Rich Dark Gray
      ring: '#A67C52',              // Warm Brown
    },
    // Light mode - Warm and complementary to image
    light: {
      background: '#F5F2EE',        // Warm Off-White
      foreground: '#232323',        // Deep Charcoal - Clean text
      card: '#FFFFFF',              // Pure White
      cardForeground: '#232323',    // Deep Charcoal
      popover: '#FFFFFF',          // Pure White
      popoverForeground: '#111827', // Nearly Black
      primary: '#4F46E5',          // Deep Indigo - Professional
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#F3F4F6',        // Light Gray
      secondaryForeground: '#111827', // Nearly Black
      muted: '#F3F4F6',            // Light Gray
      mutedForeground: '#6B7280',  // Medium Gray
      accent: '#4F46E5',           // Deep Indigo
      accentForeground: '#FFFFFF', // Pure White
      destructive: '#DC2626',      // Red
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#E5E7EB',           // Border Gray
      input: '#F9FAFB',            // Off White
      ring: '#4F46E5',            // Deep Indigo
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