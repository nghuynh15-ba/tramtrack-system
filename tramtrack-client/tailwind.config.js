/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        'orbit-1': 'orbit 40s linear infinite',
        'orbit-2': 'orbit 30s linear infinite reverse',
        'orbit-3': 'orbit 55s linear infinite',
        'orbit-4': 'orbit 28s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(-14px) rotate(1.5deg)' },
          '50%': { transform: 'translateY(14px) rotate(-1.5deg)' },
        },
      },
    },
  },
  plugins: [],
};
