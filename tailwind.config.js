/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-cyan': '#67e8f9',
        'brand-amber': '#fdba74',
      },
      boxShadow: {
        soft: '0 24px 80px rgba(15, 23, 42, 0.42)',
      },
    },
  },
  plugins: [],
}