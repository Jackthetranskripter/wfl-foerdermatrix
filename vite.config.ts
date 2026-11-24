import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' → relative Pfade, funktioniert auf GitHub Pages (Unterordner) und Vercel ohne Anpassung
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
