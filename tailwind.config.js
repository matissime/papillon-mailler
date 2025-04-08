/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6402FF',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
