/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1D2D44', light: '#2B3F5C', dark: '#121C2B' },
        q1: '#3E7CB1',
        q2: '#8E44AD',
        q3: '#D35400',
        q4: '#2E8B57',
        accent: {
          red: '#E4572E',
          teal: '#17BEBB',
          yellow: '#FFC914',
          lime: '#76B041',
        },
        surface: '#F2F4F7',
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(29,45,68,0.12)',
        lift: '0 10px 30px -8px rgba(29,45,68,0.25)',
      },
      minHeight: { touch: '44px' },
      minWidth: { touch: '44px' },
    },
  },
  plugins: [],
};
