// vite.config.ts
import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // IMPORT THIS
// import tailwindcss from '@tailwindcss/node/dist/index.mjs'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});