/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#fdf3f5',
          100: '#fae3e8',
          200: '#f4c6d0',
          300: '#e99aab',
          400: '#d86481',
          500: '#b93a58',
          600: '#9a2443',
          700: '#7f1d37',
          800: '#6b1a31',
          900: '#4d1223',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(77,18,35,0.06), 0 4px 16px rgba(77,18,35,0.06)',
      },
    },
  },
  plugins: [],
};
