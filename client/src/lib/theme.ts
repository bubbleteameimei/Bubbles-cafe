// Define our theme colors and styles based on the refined color scheme
export const theme = {
  colors: {
    // Dark mode (default)
    background: '#120D09',        // Smoky Black
    foreground: '#e1d3ba',        // Light Lion
    card: '#251E16',              // Eerie Black
    cardForeground: '#e1d3ba',    // Light Lion
    primary: '#8B6C50',           // Raw Umber
    primaryForeground: '#e9dfc9', // Very light Lion
    secondary: '#C09B6F',         // Lion
    secondaryForeground: '#120D09', // Smoky Black
    muted: '#352a1f',             // Darker Umber
    mutedForeground: '#C09B6F',   // Lion
    accent: '#C09B6F',            // Lion
    accentForeground: '#120D09',  // Smoky Black
    destructive: '#e63946',       // Reddish
    destructiveForeground: '#e1d3ba', // Light Lion
    border: '#3d3630',            // Darker border
    input: '#251E16',             // Eerie Black
    ring: '#8B6C50',              // Raw Umber
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
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 4px 4px 8px rgba(0, 0, 0, 0.2)'
      },
      body: {
        letterSpacing: '0.01em',
        lineHeight: 1.8
      },
      decorative: {
        letterSpacing: '0.03em',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 3px 3px 6px rgba(79, 61, 54, 0.3)'
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
      card: '#e8e0d2',              // Lighter card
      cardForeground: '#1e1e24',    // Dark slate
      primary: '#7d6759',           // Medium brown
      primaryForeground: '#f2e9de', // Lighter cream
      secondary: '#b0a698',         // Light taupe
      secondaryForeground: '#1e1e24', // Dark slate
      muted: '#e8dfd2',             // Lightest cream
      mutedForeground: '#4f3d36',   // Deep brown
      accent: '#7d6759',            // Medium brown
      accentForeground: '#f2e9de',  // Lighter cream
      destructive: '#e63946',       // Reddish
      destructiveForeground: '#f2e9de', // Lighter cream
      border: '#c3b5a6',            // Medium-light cream
      input: '#e8e0d2',             // Lighter card
      ring: '#7d6759',              // Medium brown
    }
  },
  effects: {
    textShadow: {
      sm: '1px 1px 2px rgba(0, 0, 0, 0.3)',
      md: '2px 2px 4px rgba(0, 0, 0, 0.4)',
      lg: '2px 2px 4px rgba(0, 0, 0, 0.4), 4px 4px 8px rgba(0, 0, 0, 0.2)',
      horror: '2px 2px 4px rgba(0, 0, 0, 0.5), 3px 3px 6px rgba(79, 61, 54, 0.3), 0 0 12px rgba(125, 103, 89, 0.2)'
    },
    transition: {
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      elaborate: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};