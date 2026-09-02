/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Laurie's Love — "Plume, refined" palette (Skyway Media, Aug 2026).
        deepwater: '#0F474C', // the ground; owns most surfaces
        harbor: '#082729', // deepwater taken deeper, full-bleed fields
        lagoon: '#1789A8', // a glint — interface & links
        magenta: '#911766', // equity colour; one vivid stroke, never two
        gilt: '#C6A45E', // warm metal; used as a LINE only, never a fill
        seamist: '#EAF2F2', // the light — text, space, breathing room
        ink: '#051A1D', // deepest ground
        // Deepwater-led ramp. Repurposed from the old magenta scale so existing
        // bg-brand-*/text-brand-* classes shift to teal automatically.
        brand: {
          50: '#EAF2F2', // Sea Mist
          100: '#D6E6E7',
          200: '#A9CCCF',
          300: '#5AA9B5',
          400: '#1789A8', // Lagoon
          500: '#127C99',
          600: '#0F474C', // Deepwater
          700: '#0F474C', // Deepwater (primary)
          800: '#0B383C',
          900: '#082729', // Harbor
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
