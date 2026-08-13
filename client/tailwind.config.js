/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hacker: {
          bg: '#0a0a0a',
          card: '#121212',
          border: '#00ff66',
          green: '#00ff66',
          darkgreen: '#003311'
        }
      }
    },
  },
  plugins: [],
}
