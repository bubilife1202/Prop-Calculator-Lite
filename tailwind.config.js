/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Financial Theme
        bg: {
          primary: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
        },
        neon: {
          green: '#00ff88',
          red: '#ff0055',
          blue: '#00d4ff',
          purple: '#b700ff',
          yellow: '#ffed00',
        },
        profit: '#00ff88',
        loss: '#ff0055',
      },
      animation: {
        'count-up': 'countUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-red': 'pulseRed 1s cubic-bezier(0.4, 0, 0.6, 1)',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRed: {
          '0%, 100%': { backgroundColor: 'rgba(255, 0, 85, 0.1)' },
          '50%': { backgroundColor: 'rgba(255, 0, 85, 0.3)' },
        },
      },
    },
  },
  plugins: [],
}
