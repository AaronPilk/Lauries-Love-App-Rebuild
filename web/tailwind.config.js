/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf4f9',
          100: '#f3d9ee',
          300: '#d84a9a',
          500: '#a5257e',
          700: '#6d1b5f',
        },
      },
    },
  },
  plugins: [],
};
