/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        violet: { 500: '#7C3AED', 400: '#A78BFA', 600: '#6D28D9' },
      },
      animation: {
        blob: 'blob 10s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(40px,-60px) scale(1.1)' },
          '66%': { transform: 'translate(-30px,30px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
}
