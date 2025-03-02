// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default) - Optimized for dark background image
    dark: {
      background: '#0A0A0A',        // Nearly Black - For image overlay
      foreground: '#F8F9FA',        // Crisp White - Maximum readability
      card: '#161616',             // Rich Dark Gray
      cardForeground: '#F8F9FA',    // Crisp White
      popover: '#0A0A0A',          // Nearly Black
      popoverForeground: '#F8F9FA', // Crisp White
      primary: '#6B8AFE',          // Electric Blue - Standout actions
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#2A2A2A',        // Deep Charcoal - Secondary elements
      secondaryForeground: '#F8F9FA', // Crisp White
      muted: '#404040',            // Muted Dark Gray
      mutedForeground: '#9CA3AF',  // Cool Gray
      accent: '#6B8AFE',           // Electric Blue - Accents
      accentForeground: '#FFFFFF', // Pure White
      destructive: '#FF4545',      // Bright Red - Warning/Delete
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#2A2A2A',           // Deep Charcoal
      input: '#161616',            // Rich Dark Gray
      ring: '#6B8AFE',            // Electric Blue
    },
    // Light mode - Professional and clean
    light: {
      background: '#FFFFFF',        // Pure White
      foreground: '#111827',        // Nearly Black - Clean text
      card: '#F9FAFB',             // Off White
      cardForeground: '#111827',    // Nearly Black
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