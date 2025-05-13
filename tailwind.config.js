/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#080f2c',
          light: '#111d4a',
          dark: '#050a1f',
          accent: '#2563eb',
          glow: '#3b82f6'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'grid-flow': 'grid-flow 20s linear infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px 10px rgba(59, 130, 246, 0.4)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        'grid-flow': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' }
        }
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        'glow-grid': 'linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)'
      }
    },
  },
  plugins: [],
};