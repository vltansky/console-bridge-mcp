/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#0a0f1a',
        },
        accent: {
          primary: '#5ce1e6', // Cyan from icon
          success: '#22c55e', // Green
          warning: '#eab308', // Yellow
          error: '#ef4444', // Red
        },
      },
    },
  },
  plugins: [],
};
