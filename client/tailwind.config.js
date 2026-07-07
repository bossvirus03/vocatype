/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#6c63ff',
          hover: '#7c73ff',
          muted: 'rgba(108,99,255,0.15)',
        },
        correct: '#4ade80',
        incorrect: '#f87171',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'blink': 'blink 1.1s step-end infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'none' } },
        blink: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0 } },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(108,99,255,0)' },
          '50%': { boxShadow: '0 0 24px 4px rgba(108,99,255,0.25)' },
        },
      },
      backdropBlur: { xs: '4px' },
    },
  },
  plugins: [],
};
