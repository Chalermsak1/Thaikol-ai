/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Sarabun', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        thai: ['Sarabun', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        tiktok: {
          red: '#fe2c55',
          cyan: '#25f4ee',
          dark: '#010101',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0,0,0,0.04)',
        'xs': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card': '0 1px 4px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 16px -2px rgba(15,23,42,0.08), 0 2px 6px -1px rgba(0,0,0,0.04)',
        'drawer': '0 20px 60px -12px rgba(15,23,42,0.25), 0 8px 24px -4px rgba(0,0,0,0.1)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}
