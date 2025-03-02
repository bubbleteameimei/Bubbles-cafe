// Define our theme colors and styles
export const theme = {
  colors: {
    // Dark mode (default)
    dark: {
      background: '#121212',        // Charcoal Black
      text: '#EAEAEA',             // Soft White
      accent: '#A6A6A6',           // Muted Gray
      hover: '#D4D4D4',            // Light Gray
      border: '#1F1F1F',           // Deep Black-Gray
      card: '#1A1A1A',             // Slightly lighter than background
      cardForeground: '#EAEAEA',    // Off-White
      primary: '#D4AF37',          // Pale Gold
      primaryForeground: '#EAEAEA', // Off-White
      secondary: '#7A1F1F',        // Deep Burgundy
      secondaryForeground: '#EAEAEA', // Off-White
      muted: '#555555',            // Soft Gray
      mutedForeground: '#EAEAEA',  // Off-White
    },
    // Light mode
    light: {
      background: '#F7F7F7',        // Off-White
      text: '#232323',             // Charcoal Gray
      accent: '#737373',           // Subtle Gray
      hover: '#525252',            // Darker Gray
      border: '#D9D9D9',           // Soft Gray
      card: '#FFFFFF',             // Pure White
      cardForeground: '#232323',    // Charcoal
      primary: '#7A1F1F',          // Deep Burgundy
      primaryForeground: '#F7F7F7', // Off-White
      secondary: '#525252',        // Darker Gray
      secondaryForeground: '#F7F7F7', // Off-White
      muted: '#888888',            // Dark Gray
      mutedForeground: '#232323',  // Charcoal
    }
  },
  effects: {
    transition: {
      theme: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, border-color 0.3s ease-in-out',
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }
  }
};

export type Theme = typeof theme;
export default theme;