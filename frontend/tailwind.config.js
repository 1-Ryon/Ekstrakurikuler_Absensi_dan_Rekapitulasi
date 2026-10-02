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
          50: '#e6f9f3',
          100: '#c2f1e2',
          200: '#8ee5ca',
          300: '#53d2ae',
          400: '#23b98f',
          500: '#00b884', // Primary emerald matching screenshot
          600: '#009e70',
          700: '#007e5b',
          800: '#056349',
          900: '#06523d',
        },
        surface: {
          sidebar: '#F8F9FA',
          canvas: '#F4F5F7',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        mono: ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -3px rgba(0, 184, 132, 0.25)',
      }
    },
  },
  plugins: [],
}
