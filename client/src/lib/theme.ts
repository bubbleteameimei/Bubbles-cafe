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
      serif: 'Georgia, "Times New Roman", serif',
      sans: 'system-ui, -apple-system, sans-serif'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    styles: {
      heading: {
        letterSpacing: '-0.02em',
        lineHeight: 1.2
      },
      body: {
        letterSpacing: '0.01em',
        lineHeight: 1.6
      }
    }
  },
  effects: {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    inkBlot: '0 0 15px rgba(0, 0, 0, 0.1)',
    paperTexture: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.15\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
    transition: {
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      elaborate: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export default theme;