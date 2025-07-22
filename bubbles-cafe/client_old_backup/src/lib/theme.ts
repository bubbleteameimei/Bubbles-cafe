// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default) - Using horror theme
    dark: {
      background: '#121212',        // Deep Charcoal
      foreground: '#F8F8F8',        // Soft White - For readability
      card: '#1A1A1A',              // Slightly lighter than background
      cardForeground: '#F8F8F8',    // Soft White
      popover: '#121212',           // Deep Charcoal
      popoverForeground: '#F8F8F8', // Soft White
      primary: '#800020',           // Deep Burgundy - Horror theme
      primaryForeground: '#FFFFFF',  // Pure White
      secondary: '#2A2A2A',         // Deep Gray
      secondaryForeground: '#F8F8F8', // Soft White
      muted: '#2E2E2E',             // Muted Dark Gray
      mutedForeground: '#9A9A9A',   // Soft Gray
      accent: '#800020',            // Deep Burgundy
      accentForeground: '#FFFFFF',  // Pure White
      destructive: '#991B1B',       // Dark Red
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#2E2E2E',            // Dark Border
      input: '#1A1A1A',             // Input Background
      ring: '#800020',              // Focus Ring
    },
    // Light mode - Sophisticated with reduced glare
    light: {
      background: '#FAFAFA',        // Soft White
      foreground: '#121212',        // Deep Charcoal
      card: '#FFFFFF',              // Pure White
      cardForeground: '#121212',    // Deep Charcoal
      popover: '#FFFFFF',           // Pure White
      popoverForeground: '#121212', // Deep Charcoal
      primary: '#800020',           // Deep Burgundy
      primaryForeground: '#FFFFFF', // Pure White
      secondary: '#F0F0F0',         // Light Gray
      secondaryForeground: '#121212', // Deep Charcoal
      muted: '#F0F0F0',            // Light Gray
      mutedForeground: '#6E6E6E',  // Medium Gray
      accent: '#800020',           // Deep Burgundy
      accentForeground: '#FFFFFF', // Pure White
      destructive: '#991B1B',      // Dark Red
      destructiveForeground: '#FFFFFF', // Pure White
      border: '#E2E2E2',           // Light Border
      input: '#F5F5F5',            // Input Background
      ring: '#800020',            // Focus Ring
    }
  },
  typography: {
    fonts: {
      // Using EB Garamond for headers and Lora for body text
      serif: '"EB Garamond", "Times New Roman", serif',
      sans: 'Lora, system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    scale: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    }
  },
  layout: {
    container: {
      // Optimized content width for readability
      default: '100%',
      sm: '640px',     // Mobile
      md: '768px',     // Tablet
      lg: '1024px',    // Desktop
      xl: '1280px',    // Large Desktop
    },
    maxWidth: {
      prose: '65ch',   // Optimal line length for readability
      wide: '80ch',    // For wider content
    },
    spacing: {
      content: '2rem', // Base content padding
      section: '4rem', // Section spacing
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