/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'warmi-purple': '#4b135f',
        'warmi-pink': '#fd71b2',
        'warmi-intense': '#840078',
        'warmi-magenta': '#9c1281',
        'warmi-gray': '#b4b4b4',
      },
    },
  },
  plugins: [],
}
