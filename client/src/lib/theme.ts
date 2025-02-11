export const theme = {
  colorPalette: {
    darkMode: {
      primaryColors: {
        base: '#000000',
        subtle: '#080808',
        accent: '#141414'
      },
      accentColors: {
        primary: '#FFFFFF',
        secondary: '#E6E6E6',
        muted: '#A8A8A8'
      }
    },
    lightMode: {
      primaryColors: {
        base: '#FFFFFF',
        subtle: '#FAFAFA',
        accent: '#F5F5F5'
      },
      accentColors: {
        primary: '#000000',
        secondary: '#1A1A1A',
        muted: '#4A4A4A'
      }
    }
  },
  typography: {
    fonts: {
      serifFont: 'Garamond, "Playfair Display", serif',
      typewriterFont: '"Courier Prime", monospace',
      handwrittenScriptFont: '"Dancing Script", "Great Vibes", cursive'
    }
  },
  transitions: {
    standard: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
};