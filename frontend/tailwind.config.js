/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'Plus Jakarta Sans', 'Sarabun', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        thai: ['Prompt', 'Sarabun', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Prompt', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],        // 11px
        'xs': ['0.75rem', { lineHeight: '1.15rem' }],         // 12px
        'sm': ['0.875rem', { lineHeight: '1.35rem' }],        // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],           // 16px
        'lg': ['1.125rem', { lineHeight: '1.65rem' }],        // 18px
        'xl': ['1.25rem', { lineHeight: '1.8rem' }],          // 20px
        '2xl': ['1.5rem', { lineHeight: '2.1rem' }],          // 24px
        '3xl': ['1.875rem', { lineHeight: '2.4rem' }],        // 30px
        '4xl': ['2.25rem', { lineHeight: '2.85rem' }],        // 36px
      },
      colors: {
        tiktok: {
          red: '#fe2c55',
          cyan: '#25f4ee',
          dark: '#010101',
        },
        brand: {
          orange: '#FF5A1F',
          'orange-hover': '#E54911',
          'orange-light': '#FFF3EB',
          'orange-subtle': '#FFF8F4',
          'orange-dark': '#C93B07',
          dark: '#14171F',
          surface: '#F8F9FA',
        },
        creator: {
          orange: '#FF5A1F',
          lime: '#bef224',
          'lime-hover': '#addf18',
          dark: '#13161c',
          card: '#1a1e27',
          surface: '#f6f8fa',
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
