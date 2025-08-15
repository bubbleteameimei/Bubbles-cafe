import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Enhanced breakpoints for better responsive design
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        // Custom breakpoints for specific device types
        'mobile': '320px',
        'mobile-lg': '375px',
        'mobile-xl': '425px',
        'tablet': '640px',
        'tablet-lg': '768px',
        'laptop': '1024px',
        'laptop-lg': '1280px',
        'desktop': '1440px',
        'desktop-lg': '1920px',
        // Orientation breakpoints
        'portrait': {'raw': '(orientation: portrait)'},
        'landscape': {'raw': '(orientation: landscape)'},
        // Height breakpoints
        'h-sm': {'raw': '(min-height: 600px)'},
        'h-md': {'raw': '(min-height: 800px)'},
        'h-lg': {'raw': '(min-height: 1000px)'},
        'h-xl': {'raw': '(min-height: 1200px)'},
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      // Enhanced spacing scale for better responsive design
      spacing: {
        '18': '4.5rem',    // 72px
        '88': '22rem',     // 352px
        '128': '32rem',    // 512px
        '144': '36rem',    // 576px
        // Responsive spacing utilities
        'mobile-1': '0.25rem',   // 4px
        'mobile-2': '0.5rem',    // 8px
        'mobile-3': '0.75rem',   // 12px
        'mobile-4': '1rem',      // 16px
        'mobile-6': '1.5rem',    // 24px
        'mobile-8': '2rem',      // 32px
        'tablet-1': '0.25rem',   // 4px
        'tablet-2': '0.5rem',    // 8px
        'tablet-3': '0.75rem',   // 12px
        'tablet-4': '1rem',      // 16px
        'tablet-6': '1.5rem',    // 24px
        'tablet-8': '2rem',      // 32px
        'tablet-10': '2.5rem',   // 40px
        'desktop-1': '0.25rem',  // 4px
        'desktop-2': '0.5rem',   // 8px
        'desktop-3': '0.75rem',  // 12px
        'desktop-4': '1rem',     // 16px
        'desktop-6': '1.5rem',   // 24px
        'desktop-8': '2rem',     // 32px
        'desktop-10': '2.5rem',  // 40px
        'desktop-12': '3rem',    // 48px
        'desktop-16': '4rem',    // 64px
      },
      // Enhanced typography scale for responsive design
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Responsive typography sizes
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'tablet-xs': ['0.75rem', { lineHeight: '1rem' }],
        'tablet-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'tablet-base': ['1rem', { lineHeight: '1.5rem' }],
        'tablet-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'tablet-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'tablet-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'desktop-xs': ['0.75rem', { lineHeight: '1rem' }],
        'desktop-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'desktop-base': ['1rem', { lineHeight: '1.5rem' }],
        'desktop-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'desktop-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'desktop-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'desktop-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'desktop-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      // Enhanced container sizes for responsive design
      maxWidth: {
        'xs': '20rem',      // 320px
        'sm': '24rem',      // 384px
        'md': '28rem',      // 448px
        'lg': '32rem',      // 512px
        'xl': '36rem',      // 576px
        '2xl': '42rem',     // 672px
        '3xl': '48rem',     // 768px
        '4xl': '56rem',     // 896px
        '5xl': '64rem',     // 1024px
        '6xl': '72rem',     // 1152px
        '7xl': '80rem',     // 1280px
        '8xl': '88rem',     // 1408px
        '9xl': '96rem',     // 1536px
        'full': '100%',
        'min': 'min-content',
        'max': 'max-content',
        'fit': 'fit-content',
        'prose': '65ch',
        'screen-sm': '640px',
        'screen-md': '768px',
        'screen-lg': '1024px',
        'screen-xl': '1280px',
        'screen-2xl': '1536px',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "subtle-glow": {
          "0%, 100%": {
            opacity: "0.5",
            transform: "scale(1.25)",
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.3)",
          },
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "0.6",
            transform: "scale(1.05)",
          },
          "50%": {
            opacity: "0.4",
            transform: "scale(1.1)",
          },
        },
        "pulse-medium": {
          "0%, 100%": {
            opacity: "0.7",
            transform: "scale(1.03)",
          },
          "50%": {
            opacity: "0.5",
            transform: "scale(1.07)",
          },
        },
        // Enhanced responsive animations
        "fade-in-mobile": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-tablet": {
          "0%": {
            opacity: "0",
            transform: "translateY(15px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-desktop": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-left": {
          "0%": {
            opacity: "0",
            transform: "translateX(-100%)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(100%)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "subtle-glow 3s ease-in-out infinite",
        "pulse": "pulse-slow 4s ease-in-out infinite",
        "pulse-slow": "pulse-slow 8s ease-in-out infinite",
        "pulse-medium": "pulse-medium 6s ease-in-out infinite",
        // Enhanced responsive animations
        "fade-in-mobile": "fade-in-mobile 0.3s ease-out",
        "fade-in-tablet": "fade-in-tablet 0.4s ease-in-out",
        "fade-in-desktop": "fade-in-desktop 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
      // Enhanced responsive utilities
      zIndex: {
        'auto': 'auto',
        '0': '0',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'max': '999999',
        'modal': '1000',
        'overlay': '999',
        'dropdown': '100',
        'sticky': '1020',
        'fixed': '1030',
        'drawer': '1040',
        'popover': '1050',
        'tooltip': '1060',
        'toast': '1070',
      },
      // Enhanced responsive grid system
      gridTemplateColumns: {
        'mobile-1': 'repeat(1, minmax(0, 1fr))',
        'mobile-2': 'repeat(2, minmax(0, 1fr))',
        'tablet-1': 'repeat(1, minmax(0, 1fr))',
        'tablet-2': 'repeat(2, minmax(0, 1fr))',
        'tablet-3': 'repeat(3, minmax(0, 1fr))',
        'desktop-1': 'repeat(1, minmax(0, 1fr))',
        'desktop-2': 'repeat(2, minmax(0, 1fr))',
        'desktop-3': 'repeat(3, minmax(0, 1fr))',
        'desktop-4': 'repeat(4, minmax(0, 1fr))',
        'desktop-5': 'repeat(5, minmax(0, 1fr))',
        'desktop-6': 'repeat(6, minmax(0, 1fr))',
      },
      // Enhanced responsive flexbox utilities
      flex: {
        'mobile-1': '1 1 0%',
        'mobile-auto': '1 1 auto',
        'mobile-initial': '0 1 auto',
        'mobile-none': 'none',
        'tablet-1': '1 1 0%',
        'tablet-auto': '1 1 auto',
        'tablet-initial': '0 1 auto',
        'tablet-none': 'none',
        'desktop-1': '1 1 0%',
        'desktop-auto': '1 1 auto',
        'desktop-initial': '0 1 auto',
        'desktop-none': 'none',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), 
    require("@tailwindcss/typography"),
    // Custom plugin for responsive utilities
    function({ addUtilities, theme }) {
      const responsiveUtilities = {
        // Responsive text utilities
        '.text-mobile-xs': { fontSize: theme('fontSize.mobile-xs')[0] },
        '.text-mobile-sm': { fontSize: theme('fontSize.mobile-sm')[0] },
        '.text-mobile-base': { fontSize: theme('fontSize.mobile-base')[0] },
        '.text-mobile-lg': { fontSize: theme('fontSize.mobile-lg')[0] },
        '.text-mobile-xl': { fontSize: theme('fontSize.mobile-xl')[0] },
        '.text-tablet-xs': { fontSize: theme('fontSize.tablet-xs')[0] },
        '.text-tablet-sm': { fontSize: theme('fontSize.tablet-sm')[0] },
        '.text-tablet-base': { fontSize: theme('fontSize.tablet-base')[0] },
        '.text-tablet-lg': { fontSize: theme('fontSize.tablet-lg')[0] },
        '.text-tablet-xl': { fontSize: theme('fontSize.tablet-xl')[0] },
        '.text-tablet-2xl': { fontSize: theme('fontSize.tablet-2xl')[0] },
        '.text-desktop-xs': { fontSize: theme('fontSize.desktop-xs')[0] },
        '.text-desktop-sm': { fontSize: theme('fontSize.desktop-sm')[0] },
        '.text-desktop-base': { fontSize: theme('fontSize.desktop-base')[0] },
        '.text-desktop-lg': { fontSize: theme('fontSize.desktop-lg')[0] },
        '.text-desktop-xl': { fontSize: theme('fontSize.desktop-xl')[0] },
        '.text-desktop-2xl': { fontSize: theme('fontSize.desktop-2xl')[0] },
        '.text-desktop-3xl': { fontSize: theme('fontSize.desktop-3xl')[0] },
        '.text-desktop-4xl': { fontSize: theme('fontSize.desktop-4xl')[0] },
        
        // Responsive spacing utilities
        '.p-mobile-1': { padding: theme('spacing.mobile-1') },
        '.p-mobile-2': { padding: theme('spacing.mobile-2') },
        '.p-mobile-3': { padding: theme('spacing.mobile-3') },
        '.p-mobile-4': { padding: theme('spacing.mobile-4') },
        '.p-mobile-6': { padding: theme('spacing.mobile-6') },
        '.p-mobile-8': { padding: theme('spacing.mobile-8') },
        '.p-tablet-1': { padding: theme('spacing.tablet-1') },
        '.p-tablet-2': { padding: theme('spacing.tablet-2') },
        '.p-tablet-3': { padding: theme('spacing.tablet-3') },
        '.p-tablet-4': { padding: theme('spacing.tablet-4') },
        '.p-tablet-6': { padding: theme('spacing.tablet-6') },
        '.p-tablet-8': { padding: theme('spacing.tablet-8') },
        '.p-tablet-10': { padding: theme('spacing.tablet-10') },
        '.p-desktop-1': { padding: theme('spacing.desktop-1') },
        '.p-desktop-2': { padding: theme('spacing.desktop-2') },
        '.p-desktop-3': { padding: theme('spacing.desktop-3') },
        '.p-desktop-4': { padding: theme('spacing.desktop-4') },
        '.p-desktop-6': { padding: theme('spacing.desktop-6') },
        '.p-desktop-8': { padding: theme('spacing.desktop-8') },
        '.p-desktop-10': { padding: theme('spacing.desktop-10') },
        '.p-desktop-12': { padding: theme('spacing.desktop-12') },
        '.p-desktop-16': { padding: theme('spacing.desktop-16') },
      };
      
      addUtilities(responsiveUtilities);
    }
  ],
} satisfies Config;
