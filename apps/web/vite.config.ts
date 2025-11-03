import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'decode-named-character-reference': path.resolve(__dirname, './src/conversion/decodeNamed.ts'),
    },
    conditions: ['worker', 'browser'],
  },
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage/unit',
    },
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'playwright.config.ts'],
  },
})
