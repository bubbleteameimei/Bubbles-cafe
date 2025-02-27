// Define our theme colors and styles based on the new color scheme
export const theme = {
  colors: {
    background: '#1e1e24',        // Dark slate
    foreground: '#d8c3a5',        // Cream
    card: '#4f3d36',              // Deep brown
    cardForeground: '#d8c3a5',    // Cream
    primary: '#7d6759',           // Medium brown
    primaryForeground: '#d8c3a5', // Cream
    secondary: '#b0a698',         // Light taupe
    secondaryForeground: '#1e1e24', // Dark slate
    muted: '#3a2e29',             // Darker brown
    mutedForeground: '#b0a698',   // Light taupe
    accent: '#b0a698',            // Light taupe
    accentForeground: '#1e1e24',  // Dark slate
    destructive: '#e63946',       // Reddish
    destructiveForeground: '#d8c3a5', // Cream
    border: '#5d4a40',            // Medium-dark brown
    input: '#4f3d36',             // Deep brown
    ring: '#b0a698',              // Light taupe
  },
  typography: {
    fonts: {
      serif: '"Cormorant Garamond", "EB Garamond", Georgia, serif',
      decorative: '"Cinzel Decorative", "Cormorant Garamond", serif',
      body: '"Lancelot", "EB Garamond", serif',
      heading: '"Cinzel Decorative", "Cormorant Garamond", serif'
    },
    scale: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    },
    styles: {
      heading: {
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 4px 4px 8px rgba(0, 0, 0, 0.1), 0 0 12px rgba(107, 53, 54, 0.2)'
      },
      body: {
        letterSpacing: '0.01em',
        lineHeight: 1.8
      },
      decorative: {
        letterSpacing: '0.03em',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 3px 3px 6px rgba(107, 53, 54, 0.2)'
      }
    },
    responsive: {
      sm: {
        base: '14px',
        scale: 1.2
      },
      md: {
        base: '16px',
        scale: 1.25
      },
      lg: {
        base: '18px',
        scale: 1.333
      }
    }
  },
  lightMode: {
    colors: {
      background: '#f2e9de',        // Lighter cream
      foreground: '#1e1e24',        // Dark slate
      card: '#d8c3a5',              // Cream
      cardForeground: '#1e1e24',    // Dark slate
      primary: '#b0a698',           // Light taupe
      primaryForeground: '#1e1e24', // Dark slate
      secondary: '#7d6759',         // Medium brown
      secondaryForeground: '#f2e9de', // Lighter cream
      muted: '#e8dfd2',             // Lightest cream
      mutedForeground: '#4f3d36',   // Deep brown
      accent: '#7d6759',            // Medium brown
      accentForeground: '#f2e9de',  // Lighter cream
      destructive: '#e63946',       // Reddish
      destructiveForeground: '#f2e9de', // Lighter cream
      border: '#c3b5a6',            // Medium-light cream
      input: '#d8c3a5',             // Cream
      ring: '#7d6759',              // Medium brown
    }
  },
  effects: {
    textShadow: {
      sm: '1px 1px 2px rgba(0, 0, 0, 0.2)',
      md: '2px 2px 4px rgba(0, 0, 0, 0.3)',
      lg: '2px 2px 4px rgba(0, 0, 0, 0.3), 4px 4px 8px rgba(0, 0, 0, 0.1)',
      horror: '2px 2px 4px rgba(0, 0, 0, 0.4), 3px 3px 6px rgba(107, 53, 54, 0.3), 0 0 15px rgba(139, 0, 0, 0.2)'
    },
    transition: {
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      elaborate: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export default theme;