/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fff5f7',
          100: '#ffe4e9',
          500: '#8f1d3f',
          600: '#741531',
          700: '#5b1029',
          900: '#2a0714'
        },
        plum: '#4a1938',
        gold: '#b98a2f',
        cream: '#fbf7ef',
        ink: '#171216'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23,18,22,0.08)'
      }
    }
  },
  plugins: []
};
