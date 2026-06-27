/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        accent: '#3B82F6',
        dark: '#0B1220',
        darkSecondary: '#111827',
        background: '#0F172A',
        card: '#1E293B',
        muted: '#94A3B8',
      },
      boxShadow: {
        glow: '0 0 42px rgba(37, 99, 235, 0.22)',
        panel: '0 24px 70px rgba(0, 0, 0, 0.28)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      screens: {
        '3xl': '1800px',
      },
    },
  },
  plugins: [],
};
