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
        border: "rgba(var(--border), <alpha-value>)",
        background: "rgba(var(--background), <alpha-value>)",
        foreground: "rgba(var(--foreground), <alpha-value>)",
        card: "rgba(var(--card), <alpha-value>)",
        sidebar: "rgba(var(--sidebar), <alpha-value>)",
        accent: "rgba(var(--accent), <alpha-value>)",
        primary: {
          50: '#f5f8ff',
          100: '#ebf1ff',
          200: '#dde8ff',
          300: '#c4d7ff',
          400: '#9ebeff',
          500: '#6393ff',
          600: '#3b6cff',
          700: '#254eff',
          800: '#1b3cdb',
          900: '#1c36ae',
          950: '#101c6f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
