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
          bg: '#020617',
          card: '#090d16',
          border: '#10b981',
          green: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
