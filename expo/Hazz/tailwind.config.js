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
          DEFAULT: '#333333',
          deep: '#18241f',
          muted: '#69877b'
        },
        ivory: '#f6f4ec',
        stone: '#eeebe4',
        brass: '#d8aa54',
        charcoal: '#1a1f1d',
        green: {
          DEFAULT: '#286142',
          deep: '#1c422e',
          muted: '#4ab498',
          forest: '#0e2c1e',
          pale: '#e3f3ef'
        },
        emerald: {
          50: '#e3f3ef',
          100: '#cbf0e6',
          200: '#a1e3d1',
          300: '#6dceb5',
          400: '#4ab498',
          500: '#286142',
          600: '#1c7a60',
          700: '#1c422e',
          800: '#135041',
          900: '#0e2c1e',
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
