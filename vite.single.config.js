// Builds ONE self-contained file: site/index.html (double-click to open, no server needed).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: { outDir: 'site', target: 'es2020', chunkSizeWarningLimit: 5000 },
})
