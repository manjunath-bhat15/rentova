/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#fc8019',
          light: '#ff9940',
          dark: '#e06b12',
          50: '#fff8f3',
        },
      }
    },
  },
  plugins: [],
}

