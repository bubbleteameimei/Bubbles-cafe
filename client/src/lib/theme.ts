export const theme = {
  colorPalette: {
    darkMode: {
      primaryColors: {
        base: '#34271f',        // Deep brown
        subtle: '#393833',      // Dark charcoal
        accent: '#585544',      // Warm beige-brown
        text: '#e8e6e3',        // Light cream for better contrast
        muted: '#a39e93'        // Muted cream for secondary text
      },
      accentColors: {
        primary: '#5e4d33',     // Rich terracotta brown
        secondary: '#383929',   // Olive green
        muted: '#17221c'        // Dark forest green
      },
      horror: {
        blood: '#502a20',       // Rusty red-brown
        shadow: '#1a1614',      // Darker shade of base
        fog: 'hsla(32, 15%, 16%, 0.05)'
      },
      ui: {
        background: '#2a211b',  // Slightly lighter than base for better contrast
        card: '#312720',        // Card background
        border: '#443831',      // Subtle borders
        hover: '#3d322b'        // Hover state
      }
    },
    lightMode: {
      primaryColors: {
        base: '#c6a477',        // Creamy beige
        subtle: '#875b36',      // Golden brown
        accent: '#947c60',      // Light taupe
        text: '#34271f',        // Deep brown for contrast
        muted: '#666055'        // Muted brown for secondary text
      },
      accentColors: {
        primary: '#8c6949',     // Medium brown
        secondary: '#6e614f',   // Neutral brown
        muted: '#947c60'        // Light taupe
      },
      horror: {
        blood: '#502a20',       // Rusty red-brown (consistent across modes)
        shadow: '#f5f1ec',      // Light cream shadow
        fog: 'hsla(35, 50%, 62%, 0.05)'
      },
      ui: {
        background: '#f5f1ec',  // Light cream background
        card: '#ffffff',        // White card background
        border: '#e6d5c3',      // Subtle borders
        hover: '#efe9e1'        // Hover state
      }
    }
  },
  typography: {
    fonts: {
      serif: 'Georgia, Times New Roman, serif',
      sans: 'system-ui, -apple-system, sans-serif'
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  transitions: {
    standard: 'all 0.2s ease-in-out',
    smooth: 'all 0.3s ease-in-out',
    horror: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  effects: {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    horrorGlow: '0 0 10px rgba(80, 42, 32, 0.3)',  // Using rusty red-brown
    fogOverlay: 'linear-gradient(to bottom, transparent, hsla(32, 15%, 16%, 0.1))'
  }
};