const colors = require("tailwindcss/colors");
const theme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

const dropdown = require("./tailwind-plugin/dropdown");
const button = require('./tailwind-plugin/button');
const tab = require("./tailwind-plugin/tab");
const article = require("./tailwind-plugin/article");
const avatar = require("./tailwind-plugin/avatar");
const pill = require("./tailwind-plugin/pill");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    fontFamily: {
      sans: ["Segoe UI", "SF Pro Text", "Aria", "sans-serif"],
    },
    extend: {
      keyframes: {
        progress: {
          "0%": { transform: 'translateX(-100%)' },
          "100%": { transform: 'translateX(100%)' }
        }
      },
      animation: {
        "progress": "progress 5s infinite linear"
      },
      zIndex: {
        filter: 100,
        backdrop: 1000,
        drawer: 2000,
        drawerChat: 2500,
        tooltip: 3000,
      },
      colors: {
        primary: "#0C75FF",
        secondary: "#DFEDFF",
        alert: "#FF2A1D",
        success: "#2ED73F",
        highlight: "#FFF7AB",
        neutral: {
          50: "#f8f8f8",
          300: "#d4d4d4",
          500: "#989898",
          600: "#525252"
        },
        ai: {
          500: "#FF7A00",
          700: "#FF5C00"
        }
      },
      boxShadow: {
        dropdown: "6px 4px 20px 0px rgba(0, 0, 0, 0.2)",
        article: "4px 4px 12px 0px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [
    dropdown,
    button,
    tab,
    article,
    avatar,
    pill,
    plugin(function ({ addBase, addComponents, theme }) {
      addBase({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarGutter: 'stable'
        },
        '.active:not([disabled])': {
          color: theme('colors.primary'),
          borderColor: theme('colors.primary'),
          backgroundColor: theme('colors.secondary')
        }
      })
    })
  ],
};
