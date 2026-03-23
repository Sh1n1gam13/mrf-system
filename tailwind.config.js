/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow:  '#F5C200',
          black:   '#111111',
          gray:    '#888888',
          light:   '#FAFAFA',
          border:  '#E5E5E5',
        }
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      }
    },
  },
  plugins: [],
}
