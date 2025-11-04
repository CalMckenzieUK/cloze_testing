// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // IMPORT THIS
// import tailwindcss from '@tailwindcss/node/dist/index.mjs'

// https://vitejs.dev/config/
export default defineConfig({
  // ADD THIS LINE 
  plugins: [react(), 
    tailwindcss()
  ],
  base: '/cloze_testing/'
})