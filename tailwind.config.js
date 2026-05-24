/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        air: {
          bg: '#0a0e1a',
          panel: '#111827',
          border: '#1f2937',
          muted: '#374151',
          text: '#e5e7eb',
          dim: '#6b7280',
        }
      }
    }
  },
  plugins: []
}
