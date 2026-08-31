/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          DEFAULT: '#2C3B2E',
          deep: '#1A241B',
          muted: '#6B7A6D'
        },
        ivory: '#F9F6F0',
        stone: '#E8E5DF',
        brass: '#C4A464',
        charcoal: '#2D2D2D',
        green: {
          DEFAULT: '#156041',
          deep: '#0A3B26',
          muted: '#4A8B6F',
          forest: '#0E4D31',
          pale: '#E0EFE6'
        },
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
    extend: {},
  },
  plugins: [],
}

