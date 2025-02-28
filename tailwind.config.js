/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}', // Your app’s files
    './node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}' // Flowbite components
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('flowbite/plugin')
  ]
};