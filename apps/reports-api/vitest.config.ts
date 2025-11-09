import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@tasks': resolve(__dirname, './src/tasks'),
      '@parent-child-requests': resolve(__dirname, './src/parent-child-requests'),
      '@request-categorization': resolve(__dirname, './src/request-categorization'),
      '@error-logs': resolve(__dirname, './src/error-logs'),
      '@request-tags': resolve(__dirname, './src/request-tags'),
      '@database': resolve(__dirname, './src/database'),
      '@common': resolve(__dirname, './src/common'),
      '@src': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    root: '.',
    include: ['test/**/*.spec.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'test/**/*.e2e-spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
