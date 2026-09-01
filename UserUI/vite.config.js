import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sharedPath = path.resolve(__dirname, '../shared')

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    // Stable vendor chunk for long-term browser caching (vendor code changes rarely).
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // IMPORTANT: check react-router BEFORE react (route URLs contain 'react')
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
            if (id.includes('dompurify')) {
              return 'sanitizer';
            }
            if (id.includes('lucide-react') || id.includes('/clsx/')) {
              return 'vendor-lite';
            }
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    resolve: {
      alias: {
        '@shared': sharedPath,
      },
    },
    css: false,
    pool: 'threads',
    maxThreads: 1,
    minThreads: 1,
    testTimeout: 30000,
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/main.jsx', 'src/data/**'],
    },
  },
})
