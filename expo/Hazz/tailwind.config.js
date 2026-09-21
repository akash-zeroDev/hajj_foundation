/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito Sans"', 'Arial', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
      },
      colors: {
        noir: {
          DEFAULT: "#1a1a1a",
          rich: "#0f0f0f",
        },
        gold: {
          DEFAULT: "#C19F5C",
          light: "#DDBE7B",
          muted: "#6A5630",
        },
        ivory: {
          DEFAULT: "#F4F0E6",
          muted: "#C2BEB4",
        }
      }
    },
  },
  plugins: [],
}
