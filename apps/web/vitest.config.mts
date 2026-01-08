import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'modules/**/__tests__/**/*.spec.{ts,tsx}',
      'shared/**/__tests__/**/*.spec.{ts,tsx}',
      'lib/**/__tests__/**/*.spec.ts',
    ],
    exclude: ['node_modules', '.next', 'dist', 'e2e'],
    pool: 'vmThreads',
    setupFiles: ['./test/setup.ts'],
  },
})
