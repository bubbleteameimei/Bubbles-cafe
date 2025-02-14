export const theme = {
  colorPalette: {
    darkMode: {
      primaryColors: {
        base: '#000000',
        subtle: '#0A0A0A',
        accent: '#141414'
      },
      accentColors: {
        primary: '#FFFFFF',
        secondary: '#E0E0E0',
        muted: '#808080'
      },
      horror: {
        blood: 'hsl(0, 100%, 30%)',
        shadow: 'hsl(0, 0%, 10%)',
        fog: 'hsla(0, 0%, 100%, 0.05)'
      }
    },
    lightMode: {
      primaryColors: {
        base: '#FFFFFF',
        subtle: '#F8F8F8',
        accent: '#F0F0F0'
      },
      accentColors: {
        primary: '#000000',
        secondary: '#1A1A1A',
        muted: '#4D4D4D'
      },
      horror: {
        blood: 'hsl(0, 100%, 45%)',
        shadow: 'hsl(0, 0%, 90%)',
        fog: 'hsla(0, 0%, 0%, 0.05)'
      }
    }
  },
  transitions: {
    standard: 'all 0.2s ease-in-out',
    smooth: 'all 0.3s ease-in-out',
    horror: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  effects: {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    horrorGlow: '0 0 10px rgba(255, 0, 0, 0.3)',
    fogOverlay: 'linear-gradient(to bottom, transparent, hsla(0, 0%, 0%, 0.1))'
  }
};