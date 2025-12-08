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
        'eb-garamond': ['"EB Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
};
