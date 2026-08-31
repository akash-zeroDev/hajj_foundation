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
          DEFAULT: '#2a3b34',
          deep: '#18241f',
          muted: '#69877b'
        },
        ivory: '#fcfcfb',
        stone: '#f4f4f2',
        brass: '#d8aa54',
        charcoal: '#1a1f1d',
        green: {
          DEFAULT: '#259678',
          deep: '#176651',
          muted: '#4ab498',
          forest: '#114a3a',
          pale: '#e3f3ef'
        },
        emerald: {
          50: '#e3f3ef',
          100: '#cbf0e6',
          200: '#a1e3d1',
          300: '#6dceb5',
          400: '#4ab498',
          500: '#259678',
          600: '#1c7a60',
          700: '#176651',
          800: '#135041',
          900: '#114a3a',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
