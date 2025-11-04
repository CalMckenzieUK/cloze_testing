// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ADD THIS LINE
    "./index.html", 
    "./src/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}