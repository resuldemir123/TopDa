/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.08)',
        card: '0 1px 2px rgb(15 23 42 / 0.04), 0 12px 32px -12px rgb(15 23 42 / 0.1)',
        nav: '0 4px 24px -6px rgb(15 23 42 / 0.08)',
      },
      backgroundImage: {
        'page-mesh':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgb(209 250 229 / 0.5), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgb(224 231 255 / 0.25), transparent)',
      },
    },
  },
  plugins: [],
};
