/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#001f3f',
          light: '#003d7a',
          dark: '#001529',
        },
        silver: {
          DEFAULT: '#c0c0c0',
          light: '#e8e8e8',
          dark: '#a0a0a0',
        }
      },
    },
  },
  plugins: [],
}

