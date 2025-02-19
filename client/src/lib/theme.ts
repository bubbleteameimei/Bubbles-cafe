export type ThemeVariant = 'classic' | 'antique' | 'scholarly' | 'gothic';

export const theme = {
  variants: {
    classic: {
      name: 'Classic Academia',
      darkMode: {
        primaryColors: {
          base: '#2c231c',        // Deep brown
          subtle: '#3a332e',      // Rich charcoal
          accent: '#4a3f35',      // Warm brown
          text: '#e6e1d9',        // Aged parchment
          muted: '#998e83'        // Muted sepia
        },
        accentColors: {
          primary: '#654321',     // Antique leather
          secondary: '#2f3520',   // Dark olive
          muted: '#1a1f14'        // Forest shadow
        },
        ui: {
          background: '#241d17',  // Dark mahogany
          card: '#2a231c',        // Rich walnut
          border: '#3d332b',      // Deep oak
          hover: '#352b23'        // Aged wood
        }
      },
      lightMode: {
        primaryColors: {
          base: '#e6dfd7',        // Cream parchment
          subtle: '#d4c8bc',      // Aged paper
          accent: '#b3a395',      // Antique beige
          text: '#2c231c',        // Dark ink
          muted: '#8c8276'        // Faded ink
        },
        accentColors: {
          primary: '#8b7355',     // Aged leather
          secondary: '#6b705c',   // Olive sage
          muted: '#a98467'        // Weathered bronze
        },
        ui: {
          background: '#f5f0e8',  // Light parchment
          card: '#ebe4dc',        // Cream paper
          border: '#d4c8bc',      // Aged border
          hover: '#e6dfd7'        // Soft hover
        }
      }
    },
    antique: {
      name: 'Antique Library',
      darkMode: {
        primaryColors: {
          base: '#1c1915',        // Aged ebony
          subtle: '#2a251f',      // Dark leather
          accent: '#3d3629',      // Burnished bronze
          text: '#e8e3dc',        // Old paper
          muted: '#a69f95'        // Dusty pages
        },
        accentColors: {
          primary: '#704214',     // Rich cognac
          secondary: '#2d2a1b',   // Antique brass
          muted: '#191610'        // Deep patina
        },
        ui: {
          background: '#171411',  // Dark oak
          card: '#1e1b16',        // Aged wood
          border: '#2f2a22',      // Vintage frame
          hover: '#26211b'        // Worn leather
        }
      },
      lightMode: {
        primaryColors: {
          base: '#f0e9e1',        // Aged vellum
          subtle: '#e1d6ca',      // Vintage paper
          accent: '#c2b5a6',      // Tea-stained
          text: '#1c1915',        // Ink black
          muted: '#998f84'        // Faded text
        },
        accentColors: {
          primary: '#8f6f4b',     // Antique gold
          secondary: '#6d6852',   // Patina green
          muted: '#b39b80'        // Aged brass
        },
        ui: {
          background: '#f7f2ea',  // Light vellum
          card: '#eee7df',        // Cream paper
          border: '#e1d6ca',      // Aged edge
          hover: '#f0e9e1'        // Soft touch
        }
      }
    },
    scholarly: {
      name: 'Scholar\'s Study',
      darkMode: {
        primaryColors: {
          base: '#1e1a1f',        // Deep purple-brown
          subtle: '#2c272d',      // Rich plum
          accent: '#3f3940',      // Dusty purple
          text: '#e4e0e5',        // Lavender white
          muted: '#a39da4'        // Muted lavender
        },
        accentColors: {
          primary: '#5d4c3c',     // Aged leather
          secondary: '#2b2d35',   // Oxford blue
          muted: '#171820'        // Midnight ink
        },
        ui: {
          background: '#181619',  // Dark plum
          card: '#201c21',        // Rich grape
          border: '#332e34',      // Deep violet
          hover: '#28242a'        // Aged violet
        }
      },
      lightMode: {
        primaryColors: {
          base: '#ece8ed',        // Lavender cream
          subtle: '#ddd7de',      // Soft purple
          accent: '#beb7bf',      // Dusty mauve
          text: '#1e1a1f',        // Dark grape
          muted: '#958e96'        // Faded purple
        },
        accentColors: {
          primary: '#7d6d5c',     // Burnished brown
          secondary: '#585b6a',   // Steel blue
          muted: '#9a8e7d'        // Weathered brass
        },
        ui: {
          background: '#f4f0f5',  // Light lavender
          card: '#e8e4e9',        // Soft cream
          border: '#ddd7de',      // Aged purple
          hover: '#ece8ed'        // Gentle hover
        }
      }
    },
    gothic: {
      name: 'Gothic Revival',
      darkMode: {
        primaryColors: {
          base: '#161314',        // Gothic black
          subtle: '#24201f',      // Dark stone
          accent: '#372f2d',      // Aged granite
          text: '#e2dcd8',        // Alabaster
          muted: '#a09591'        // Weathered stone
        },
        accentColors: {
          primary: '#6b3536',     // Deep crimson
          secondary: '#2a2527',   // Dark slate
          muted: '#171314'        // Shadow black
        },
        ui: {
          background: '#121010',  // Cathedral black
          card: '#1a1717',        // Dark marble
          border: '#2d2827',      // Iron black
          hover: '#211e1d'        // Aged iron
        }
      },
      lightMode: {
        primaryColors: {
          base: '#eae5e1',        // Marble white
          subtle: '#dbd4cf',      // Stone white
          accent: '#bbb2ac',      // Aged marble
          text: '#161314',        // Gothic ink
          muted: '#918881'        // Faded stone
        },
        accentColors: {
          primary: '#8c5657',     // Faded crimson
          secondary: '#595254',   // Slate gray
          muted: '#a08989'        // Weathered rose
        },
        ui: {
          background: '#f2ede9',  // Light stone
          card: '#e6e0dc',        // Pale marble
          border: '#dbd4cf',      // Aged marble
          hover: '#eae5e1'        // Soft marble
        }
      }
    }
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
    paperTexture: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.1"/%3E%3C/svg%3E")',
    transition: {
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      elaborate: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export default theme;