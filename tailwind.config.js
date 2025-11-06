/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a1a1a',
        'brand-secondary': '#2c2c2c',
        'brand-accent': '#c5a565',
        'brand-accent-light': '#e0c48a',
        'brand-text': '#f0e6d2',
        'brand-text-secondary': '#a99268',
        'brand-border': '#4a4a4a',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.2s ease-out'
      }
    },
  },
  plugins: [],
}
