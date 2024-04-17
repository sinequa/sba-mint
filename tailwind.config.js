const  dropdown = require('./tailwind-plugin/dropdown');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    fontFamily: {
      sans: ['Segoe UI'],
    },
    extend: {
      colors: {
        'primary': 'rgb(59 130 246)',
        'secondary': 'rgb(239 246 255)'
      },
      boxShadow: {
        'dropdown': '6px 4px 20px 0px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [dropdown],
};
