/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        scada: {
          bg: '#0B1120',      // Deep slate-950
          panel: '#111827',   // Slate-900
          border: '#1F2937',  // Slate-800
          accent: '#06B6D4',  // Cyan-500
          safe: '#10B981',    // Emerald-500
          warn: '#F59E0B',    // Amber-500
          danger: '#EF4444',  // Rose-500
          oil: '#EAB308',     // Yellow-500
          steam: '#60A5FA',   // Blue-400
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
