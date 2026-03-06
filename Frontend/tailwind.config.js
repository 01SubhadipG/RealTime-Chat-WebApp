/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui') // This now works correctly with module.exports
  ],
  daisyui: {
    themes: [
        "light", "dark", "cupcake", "retro", "cyberpunk", "valentine", 
        "halloween", "garden", "forest", "aqua", "lofi", "pastel", 
        "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", 
        "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"
    ],
  },
}