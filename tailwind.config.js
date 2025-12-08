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
      fontSize: {
        '2.5xl': '1.375rem', // 22px
        '3.5xl': '2rem', // 32px
        '5.5xl': '3.125rem', // 50px
      },
    },
  },
  plugins: [],
};
