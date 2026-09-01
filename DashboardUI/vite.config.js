import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sharedPath = path.resolve(__dirname, '../shared')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': sharedPath,
    },
  },
  server: {
    fs: {
      allow: [sharedPath, path.resolve(__dirname, '..')],
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
})
