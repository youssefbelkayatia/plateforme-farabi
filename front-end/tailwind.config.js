/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#000000',
        'secondary': '#222222',
        'tertiary': '#1DCD9F',
        'quaternary': '#169976',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'playfair': ['Playfair Display', 'Amiri', 'serif'],
        'raleway': ['Raleway', 'Noto Sans Arabic', 'sans-serif'],
        'amiri': ['Amiri', 'serif'],
        'lateef': ['Lateef', 'serif'],
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} 