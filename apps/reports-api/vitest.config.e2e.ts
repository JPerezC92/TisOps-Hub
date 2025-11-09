import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@tasks': resolve(__dirname, './src/tasks'),
      '@parent-child-requests': resolve(__dirname, './src/parent-child-requests'),
      '@database': resolve(__dirname, './src/database'),
      '@common': resolve(__dirname, './src/common'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
