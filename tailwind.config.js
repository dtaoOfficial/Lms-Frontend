/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <-- ADD THIS LINE
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // --- ADD THIS WHOLE 'colors' SECTION ---
      colors: {
        background: 'rgb(var(--color-bg-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
      // -------------------------------------
    },
  },
  plugins: [],
}