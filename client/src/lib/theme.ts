export type ThemeVariant = 'classic' | 'antique' | 'scholarly' | 'gothic';

export const theme = {
  variants: {
    classic: {
      name: 'Classic Academia',
      darkMode: {
        primaryColors: {
          base: '#2c231c',        // Rich mahogany
          subtle: '#3a332e',      // Aged leather
          accent: '#4a3f35',      // Burnished bronze
          text: '#e6e1d9',        // Ivory parchment
          muted: '#998e83'        // Faded sepia
        },
        accentColors: {
          primary: '#654321',     // Antique cognac
          secondary: '#2f3520',   // Forest shadow
          muted: '#1a1f14'        // Deep moss
        },
        ui: {
          background: '#241d17',  // Dark walnut
          card: '#2a231c',        // Rich oak
          border: '#3d332b',      // Deep mahogany
          hover: '#352b23'        // Aged teak
        }
      },
      lightMode: {
        primaryColors: {
          base: '#e6dfd7',        // Cream vellum
          subtle: '#d4c8bc',      // Aged paper
          accent: '#b3a395',      // Antique linen
          text: '#2c231c',        // Dark ink
          muted: '#8c8276'        // Faded script
        },
        accentColors: {
          primary: '#8b7355',     // Burnished gold
          secondary: '#6b705c',   // Sage patina
          muted: '#a98467'        // Weathered copper
        },
        ui: {
          background: '#f5f0e8',  // Light parchment
          card: '#ebe4dc',        // Cream paper
          border: '#d4c8bc',      // Aged edge
          hover: '#e6dfd7'        // Soft touch
        }
      }
    },
    gothic: {
      name: 'Gothic Horror',
      darkMode: {
        primaryColors: {
          base: '#161314',        // Midnight black
          subtle: '#24201f',      // Shadow stone
          accent: '#372f2d',      // Dark granite
          text: '#e2dcd8',        // Ghost white
          muted: '#a09591'        // Faded ash
        },
        accentColors: {
          primary: '#6b3536',     // Blood crimson
          secondary: '#2a2527',   // Obsidian
          muted: '#171314'        // Void black
        },
        ui: {
          background: '#121010',  // Abyss black
          card: '#1a1717',        // Dark marble
          border: '#2d2827',      // Iron black
          hover: '#211e1d'        // Shadow steel
        }
      },
      lightMode: {
        primaryColors: {
          base: '#eae5e1',        // Bone white
          subtle: '#dbd4cf',      // Alabaster
          accent: '#bbb2ac',      // Aged ivory
          text: '#161314',        // Raven black
          muted: '#918881'        // Misty gray
        },
        accentColors: {
          primary: '#8c5657',     // Dried blood
          secondary: '#595254',    // Dark slate
          muted: '#a08989'        // Faded rose
        },
        ui: {
          background: '#f2ede9',   // Pale bone
          card: '#e6e0dc',        // Light marble
          border: '#dbd4cf',      // Aged stone
          hover: '#eae5e1'        // Soft marble
        }
      }
    },
    scholarly: {
      name: 'Scholar\'s Grimoire',
      darkMode: {
        primaryColors: {
          base: '#1e1a1f',        // Deep purple-black
          subtle: '#2c272d',      // Rich plum
          accent: '#3f3940',      // Royal purple
          text: '#e4e0e5',        // Moon white
          muted: '#a39da4'        // Dusty lavender
        },
        accentColors: {
          primary: '#5d4c3c',     // Ancient leather
          secondary: '#2b2d35',   // Midnight blue
          muted: '#171820'        // Deep ink
        },
        ui: {
          background: '#181619',  // Shadow purple
          card: '#201c21',        // Dark grape
          border: '#332e34',      // Deep violet
          hover: '#28242a'        // Aged amethyst
        }
      },
      lightMode: {
        primaryColors: {
          base: '#ece8ed',        // Lavender mist
          subtle: '#ddd7de',      // Soft purple
          accent: '#beb7bf',      // Dusty rose
          text: '#1e1a1f',        // Dark grape
          muted: '#958e96'        // Faded purple
        },
        accentColors: {
          primary: '#7d6d5c',     // Aged brass
          secondary: '#585b6a',   // Steel blue
          muted: '#9a8e7d'        // Weathered gold
        },
        ui: {
          background: '#f4f0f5',  // Light lavender
          card: '#e8e4e9',        // Soft cream
          border: '#ddd7de',      // Aged purple
          hover: '#ece8ed'        // Gentle hover
        }
      }
    },
    antique: {
      name: 'Antique Arcane',
      darkMode: {
        primaryColors: {
          base: '#1c1915',        // Ancient ebony
          subtle: '#2a251f',      // Dark parchment
          accent: '#3d3629',      // Aged bronze
          text: '#e8e3dc',        // Antique white
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
          hover: '#26211b'        // Ancient leather
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
    }
  },
  typography: {
    fonts: {
      serif: 'Crimson Text, Georgia, Times New Roman, serif',
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
        letterSpacing: '0.02em',
        lineHeight: 1.8
      }
    }
  },
  effects: {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
    inkBlot: '0 0 15px rgba(0, 0, 0, 0.1)',
    paperTexture: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.15\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.08\'/%3E%3C/svg%3E")',
    transition: {
      standard: 'all 0.2s ease-in-out',
      smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      elaborate: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

export default theme;