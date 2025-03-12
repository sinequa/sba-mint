// const colors = require('tailwindcss/colors');
// const theme = require('tailwindcss/defaultTheme');
const plugin = require('tailwindcss/plugin');

// const dropdown = require('./tailwind-plugin/dropdown');
// const button = require('./tailwind-plugin/button');
// const tab = require('./tailwind-plugin/tab');
const article = require('./tailwind-plugin/article');
const { input } = require('@angular/core');
// const avatar = require('./tailwind-plugin/avatar');
// const pill = require('./tailwind-plugin/pill');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.{html,ts}', 'node_modules/@sinequa/atomic-angular/**/*.mjs', 'node_modules/@sinequa/ui/**/*.mjs'],
  theme: {
    fontFamily: {
      sans: ['Segoe UI', 'SF Pro Text', 'Aria', 'sans-serif']
    },
    extend: {
      keyframes: {
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        progress: 'progress 5s infinite linear'
      },
      zIndex: {
        filter: 100,
        backdrop: 1000,
        drawer: 2000,
        drawerChat: 2500,
        tooltip: 3000
      },
      colors: {
        background: 'var(--background)/<alpha-value>',
        foreground: 'var(--foreground)/<alpha-value>',
        input: 'hsl(var(--input)/<alpha-value>)',
        ring: 'hsl(var(--ring)/<alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          hover: 'hsl(var(--primary-hover) / <alpha-value>)',
          active: 'hsl(var(--primary-active) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
          hover: 'hsl(var(--secondary-hover) / <alpha-value>)',
          active: 'hsl(var(--secondary-active) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
          hover: 'hsl(var(--destructive-hover) / <alpha-value>)',
          active: 'hsl(var(--destructive-active) / <alpha-value>)',
          disable: 'hsl(var(--destructive-disable) / <alpha-value>)'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
        },
        alert: '#FF2A1D',
        success: '#2ED73F',
        highlight: '#FFF7AB',
        neutral: {
          50: '#f8f8f8',
          300: '#d4d4d4',
          500: '#989898',
          600: '#525252'
        },
        ai: {
          500: '#FF7A00',
          700: '#FF5C00'
        }
      },
      boxShadow: {
        dropdown: '6px 4px 20px 0px rgba(0, 0, 0, 0.2)',
        article: '4px 4px 12px 0px rgba(0, 0, 0, 0.15)'
      }
    }
  },
  plugins: [
    // dropdown,
    // button,
    // tab,
    article,
    // avatar,
    // pill,
    plugin(function ({ addBase, addUtilities, addComponents, theme }) {
      addUtilities({
        '.scroll-stable': {
          'scrollbar-gutter': 'stable'
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin'
        },
        '.bg-backdrop': {
          backgroundColor: 'var(--backdrop)'
        }
      }),
        addBase({
          '.active:not([disabled])': {
            color: theme('colors.primary'),
            borderColor: theme('colors.primary'),
            backgroundColor: theme('colors.secondary')
          }
        }),
        addComponents({
          '.layout-search': {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            transition: '250ms ease-out',
            '&[drawer-opened="true"]': {
              gridTemplateColumns: '2% 25% 25% 48%'
            }
          }
        });
    })
  ]
};
