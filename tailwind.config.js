/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'source-serif': ['"Source Serif 4"', 'serif'],
      },
    },
  },
  plugins: [],
};
