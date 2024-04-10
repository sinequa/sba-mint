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
      boxShadow: {
        'dropdown': '6px 4px 20px 0px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [dropdown],
};
