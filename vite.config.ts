// vite.config.ts
import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss' // IMPORT THIS

export default defineConfig({
  base: '/cloze_testing/',
  css: {
    postcss: {
      plugins: [tailwindcss()
      ],
    },
  },
});