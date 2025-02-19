// Define our horror theme colors and styles
export const theme = {
  colors: {
    background: '#161314',        // Gothic black
    foreground: '#e2dcd8',        // Alabaster
    card: '#1a1717',             // Dark marble
    cardForeground: '#e2dcd8',    // Alabaster
    primary: '#6b3536',          // Deep crimson
    primaryForeground: '#e2dcd8', // Alabaster
    secondary: '#2a2527',        // Dark slate
    secondaryForeground: '#e2dcd8', // Alabaster
    muted: '#372f2d',            // Aged granite
    mutedForeground: '#a09591',   // Weathered stone
    accent: '#8c5657',           // Faded crimson
    accentForeground: '#e2dcd8',  // Alabaster
    destructive: '#991b1b',      // Blood red
    destructiveForeground: '#e2dcd8', // Alabaster
    border: '#2d2827',           // Iron black
    input: '#1a1717',            // Dark marble
    ring: '#6b3536',             // Deep crimson
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