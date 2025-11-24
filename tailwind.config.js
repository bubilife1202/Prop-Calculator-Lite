/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Financial Theme (Bloomberg/Reuters inspired)
        bg: {
          primary: '#0f172a', // Slate 900
          secondary: '#1e293b', // Slate 800
          tertiary: '#334155', // Slate 700
        },
        text: {
          primary: '#f8fafc', // Slate 50
          secondary: '#94a3b8', // Slate 400
          muted: '#64748b', // Slate 500
        },
        accent: {
          primary: '#3b82f6', // Blue 500 (Trust)
          secondary: '#6366f1', // Indigo 500
        },
        status: {
          success: '#10b981', // Emerald 500
          error: '#ef4444', // Red 500
          warning: '#f59e0b', // Amber 500
          info: '#3b82f6', // Blue 500
        },
        // Legacy support mapped to new theme
        neon: {
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
          purple: '#6366f1',
          yellow: '#f59e0b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
